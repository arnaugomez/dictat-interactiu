import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer, Redacted } from "effect";
import { makeDbLayer } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { AuthLive } from "./services/Auth.js";
import { EmailLive, EmailMock } from "./services/Email.js";
import { DictatServiceLive } from "./services/Dictat.js";
import { authRoutes } from "./routes/auth.js";
import { dictatRoutes } from "./routes/dictats.js";
import { accountRoutes } from "./routes/account.js";
import { healthRoutes } from "./routes/health.js";
import { AppConfig, AppConfigLive } from "./config.js";

// Build config synchronously at startup for bootstrap decisions
const config = Effect.runSync(
  Effect.provide(
    Effect.gen(function* () {
      return yield* AppConfig;
    }),
    AppConfigLive,
  ),
);

// Run migrations on startup
runMigrations(config.databaseUrl);

// OPTIONS handler for CORS preflight
const optionsRoute = HttpRouter.add(
  "OPTIONS",
  "*",
  Effect.succeed(
    HttpServerResponse.empty({ status: 204 }).pipe(
      HttpServerResponse.setHeaders({
        "access-control-allow-origin": config.corsOrigin,
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-allow-credentials": "true",
      }),
    ),
  ),
);

// All route layers combined
const routes = Layer.mergeAll(authRoutes, dictatRoutes, accountRoutes, optionsRoute, healthRoutes);

// Application
const app = routes.pipe(HttpRouter.serve);

// Service layers
const DbLive = makeDbLayer(config.databaseUrl);
const EmailLayer =
  config.emailProvider === "mock" || Redacted.value(config.resendApiKey) === ""
    ? EmailMock
    : EmailLive;

const ServicesLive = Layer.mergeAll(AuthLive, EmailLayer, DictatServiceLive).pipe(
  Layer.provideMerge(DbLive),
  Layer.provideMerge(AppConfigLive),
);

const ServerLive = BunHttpServer.layer({ port: config.port });

app.pipe(Layer.provide(ServicesLive), Layer.provide(ServerLive), Layer.launch, BunRuntime.runMain);
