import { Config, Context, Effect, Layer, Redacted } from "effect";

export class AppConfig extends Context.Service<
  AppConfig,
  {
    readonly databaseUrl: string;
    readonly port: number;
    readonly corsOrigin: string;
    readonly baseUrl: string;
    readonly emailProvider: string;
    readonly resendApiKey: Redacted.Redacted;
    readonly emailFrom: string;
  }
>()("@dictat/AppConfig") {}

export const AppConfigLive = Layer.effect(
  AppConfig,
  Effect.gen(function* () {
    const databaseUrl = yield* Config.string("DATABASE_URL").pipe(Config.withDefault("./data.db"));
    const port = yield* Config.int("PORT").pipe(Config.withDefault(3000));
    const corsOrigin = yield* Config.string("CORS_ORIGIN").pipe(
      Config.withDefault("http://localhost:5173"),
    );
    const baseUrl = yield* Config.string("BASE_URL").pipe(
      Config.withDefault("http://localhost:5173"),
    );
    const emailProvider = yield* Config.string("EMAIL_PROVIDER").pipe(Config.withDefault(""));
    const resendApiKey = yield* Config.redacted("RESEND_API_KEY").pipe(
      Config.withDefault(Redacted.make("")),
    );
    const emailFrom = yield* Config.string("EMAIL_FROM").pipe(
      Config.withDefault("noreply@dictteasy.com"),
    );
    return {
      databaseUrl,
      port,
      corsOrigin,
      baseUrl,
      emailProvider,
      resendApiKey,
      emailFrom,
    };
  }),
);
