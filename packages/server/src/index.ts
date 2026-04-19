import { HttpRouter, HttpServerResponse } from "effect/unstable/http";
import { BunHttpServer, BunRuntime } from "@effect/platform-bun";
import { Effect, Layer } from "effect";
import { makeDbLayer } from "./db/client.js";
import { runMigrations } from "./db/migrate.js";
import { AuthLive } from "./services/Auth.js";
import { EmailLive, EmailMock } from "./services/Email.js";
import { DictatServiceLive } from "./services/Dictat.js";
import { authRoutes } from "./routes/auth.js";
import { dictatRoutes } from "./routes/dictats.js";
import { accountRoutes } from "./routes/account.js";

const databaseUrl = process.env.DATABASE_URL || "./data.db";
const port = Number(process.env.PORT || 3000);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

// Run migrations on startup
runMigrations(databaseUrl);

// OPTIONS handler for CORS preflight
const optionsRoute = HttpRouter.add(
  "OPTIONS",
  "*",
  Effect.succeed(
    HttpServerResponse.empty({ status: 204 }).pipe(
      HttpServerResponse.setHeaders({
        "access-control-allow-origin": corsOrigin,
        "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
        "access-control-allow-headers": "content-type",
        "access-control-allow-credentials": "true",
      }),
    ),
  ),
);

// All route layers combined
const routes = Layer.mergeAll(authRoutes, dictatRoutes, accountRoutes, optionsRoute);

// Application
const app = routes.pipe(HttpRouter.serve);

// Service layers
const DbLive = makeDbLayer(databaseUrl);
const EmailLayer =
  process.env.EMAIL_PROVIDER === "mock" || !process.env.RESEND_API_KEY ? EmailMock : EmailLive;

const ServicesLive = Layer.mergeAll(AuthLive, EmailLayer, DictatServiceLive).pipe(
  Layer.provideMerge(DbLive),
);

const ServerLive = BunHttpServer.layer({ port });

app.pipe(Layer.provide(ServicesLive), Layer.provide(ServerLive), Layer.launch, BunRuntime.runMain);
