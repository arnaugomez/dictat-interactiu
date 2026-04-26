import { HttpBody, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  Api,
  ForbiddenResponse,
  InternalErrorResponse,
  UnauthorizedResponse,
} from "@dictat/shared";
import { Auth } from "../services/Auth.js";
import { Db, runDb } from "../db/client.js";
import type { DatabaseError } from "../db/client.js";
import * as schema from "../db/schema.js";
import { requireVerifiedAuth } from "../middleware/auth.js";
import type { ForbiddenError, UnauthorizedError } from "../middleware/auth.js";
import type { CryptoError } from "../lib/crypto.js";

/** Converts account endpoint failures into typed API failures. */
type AccountRouteError =
  | CryptoError
  | DatabaseError
  | ForbiddenError
  | ForbiddenResponse
  | HttpBody.HttpBodyError
  | UnauthorizedError
  | UnauthorizedResponse;

const catchAccountErrors = <A, R>(effect: Effect.Effect<A, AccountRouteError, R>) =>
  effect.pipe(
    Effect.catchTags({
      DatabaseError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      CryptoError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      ForbiddenError: (error) =>
        Effect.fail(new ForbiddenResponse({ error: "ForbiddenError", message: error.message })),
      HttpBodyError: () =>
        Effect.fail(
          new InternalErrorResponse({
            error: "InternalError",
            message: "Failed to encode response",
          }),
        ),
      UnauthorizedError: (error) =>
        Effect.fail(
          new UnauthorizedResponse({ error: "UnauthorizedError", message: error.message }),
        ),
    }),
  );

/** User account endpoint implementations backed by the HttpApi contract. */
export const accountRoutes = HttpApiBuilder.group(Api, "Account", (handlers) =>
  handlers
    .handle("updateProfile", ({ payload }) =>
      catchAccountErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const updatedAt = Date.now();
          const { client: db } = yield* Db;
          yield* runDb(() =>
            db
              .update(schema.users)
              .set({ name: payload.name, updatedAt })
              .where(eq(schema.users.id, user.id))
              .run(),
          );

          return {
            user: {
              id: user.id,
              name: payload.name,
              email: user.email,
              emailVerified: Boolean(user.emailVerified),
              createdAt: user.createdAt,
              updatedAt,
            },
          };
        }),
      ),
    )
    .handle("changePassword", ({ payload }) =>
      catchAccountErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const auth = yield* Auth;
          const valid = yield* auth.verifyPassword(payload.currentPassword, user.passwordHash);

          if (!valid) {
            return yield* Effect.fail(
              new UnauthorizedResponse({
                error: "AuthError",
                message: "Current password is incorrect",
              }),
            );
          }

          const passwordHash = yield* auth.hashPassword(payload.newPassword);
          const { client: db } = yield* Db;
          yield* runDb(() =>
            db
              .update(schema.users)
              .set({ passwordHash, updatedAt: Date.now() })
              .where(eq(schema.users.id, user.id))
              .run(),
          );

          return { success: true };
        }),
      ),
    )
    .handle("deleteAccount", () =>
      catchAccountErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const { client: db } = yield* Db;

          yield* runDb(() => db.delete(schema.users).where(eq(schema.users.id, user.id)).run());

          const response = yield* HttpServerResponse.json({ success: true });
          return HttpServerResponse.setHeader(
            response,
            "set-cookie",
            `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
          );
        }),
      ),
    ),
);
