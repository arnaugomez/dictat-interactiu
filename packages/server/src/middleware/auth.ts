import { HttpServerRequest } from "effect/unstable/http"
import { Effect, Data } from "effect"
import { Auth } from "../services/Auth.js"
import type * as schema from "../db/schema.js"

export class UnauthorizedError extends Data.TaggedError("UnauthorizedError")<{
  readonly message: string
}> {}

export class ForbiddenError extends Data.TaggedError("ForbiddenError")<{
  readonly message: string
}> {}

export interface AuthResult {
  user: typeof schema.users.$inferSelect
  session: typeof schema.sessions.$inferSelect
}

export const requireAuth: Effect.Effect<
  AuthResult,
  UnauthorizedError,
  Auth | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const request = yield* HttpServerRequest.HttpServerRequest
  const sessionId = request.cookies["session"]

  if (!sessionId) {
    return yield* new UnauthorizedError({ message: "No session cookie" })
  }

  const auth = yield* Auth
  const result = yield* auth.validateSession(sessionId).pipe(
    Effect.catchTag("AuthError", (e) =>
      Effect.fail(new UnauthorizedError({ message: e.message })),
    ),
  )

  return result
})

export const requireVerifiedAuth: Effect.Effect<
  AuthResult,
  UnauthorizedError | ForbiddenError,
  Auth | HttpServerRequest.HttpServerRequest
> = Effect.gen(function* () {
  const { user, session } = yield* requireAuth
  if (!user.emailVerified) {
    return yield* new ForbiddenError({ message: "Email not verified" })
  }
  return { user, session }
})
