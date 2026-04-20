import { HttpServerRequest } from "effect/unstable/http";
import { Effect, Schema } from "effect";
import { Auth } from "../services/Auth.js";
import type { DatabaseError } from "../db/client.js";
import type * as schema from "../db/schema.js";

export class UnauthorizedError extends Schema.TaggedErrorClass<UnauthorizedError>()(
  "UnauthorizedError",
  { message: Schema.String },
) {}

export class ForbiddenError extends Schema.TaggedErrorClass<ForbiddenError>()("ForbiddenError", {
  message: Schema.String,
}) {}

export interface AuthResult {
  user: typeof schema.users.$inferSelect;
  session: typeof schema.sessions.$inferSelect;
}

export const requireAuth: Effect.Effect<
  AuthResult,
  UnauthorizedError | DatabaseError,
  Auth | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest;
  const sessionId = request.cookies["session"];

  if (!sessionId) {
    return yield* new UnauthorizedError({ message: "No session cookie" });
  }

  const auth = yield* Auth;
  const result = yield* auth
    .validateSession(sessionId)
    .pipe(
      Effect.catchTag("AuthError", (e) =>
        Effect.fail(new UnauthorizedError({ message: e.message })),
      ),
    );

  return result;
});

export const requireVerifiedAuth: Effect.Effect<
  AuthResult,
  UnauthorizedError | ForbiddenError | DatabaseError,
  Auth | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const { user, session } = yield* requireAuth;
  if (!user.emailVerified) {
    return yield* new ForbiddenError({ message: "Email not verified" });
  }
  return { user, session };
});
