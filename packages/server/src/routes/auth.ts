import { HttpBody, HttpServerResponse } from "effect/unstable/http";
import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Effect } from "effect";
import { eq } from "drizzle-orm";
import {
  Api,
  BadRequestResponse,
  ConflictResponse,
  InternalErrorResponse,
  UnauthorizedResponse,
} from "@dictat/shared";
import { Auth } from "../services/Auth.js";
import { Email } from "../services/Email.js";
import { Db, runDb } from "../db/client.js";
import type { DatabaseError } from "../db/client.js";
import * as schema from "../db/schema.js";
import * as crypto from "../lib/crypto.js";
import type { CryptoError } from "../lib/crypto.js";
import { requireAuth } from "../middleware/auth.js";
import type { UnauthorizedError } from "../middleware/auth.js";
import { AppConfig } from "../config.js";
import type { EmailApiError, EmailNetworkError } from "../services/Email.js";

/** Session cookie attributes shared by login and signup responses. */
const SESSION_COOKIE_OPTIONS = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`;

/** Adds a session cookie to an HTTP response. */
const setSessionCookie = (response: HttpServerResponse.HttpServerResponse, sessionId: string) =>
  HttpServerResponse.setHeader(
    response,
    "set-cookie",
    `session=${sessionId}; ${SESSION_COOKIE_OPTIONS}`,
  );

/** Clears the session cookie on an HTTP response. */
const clearSessionCookie = (response: HttpServerResponse.HttpServerResponse) =>
  HttpServerResponse.setHeader(
    response,
    "set-cookie",
    `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );

/** Converts database and infrastructure failures into typed API failures. */
type AuthRouteError =
  | BadRequestResponse
  | ConflictResponse
  | CryptoError
  | DatabaseError
  | EmailApiError
  | EmailNetworkError
  | HttpBody.HttpBodyError
  | UnauthorizedError
  | UnauthorizedResponse;

const catchInfrastructureErrors = <A, R>(effect: Effect.Effect<A, AuthRouteError, R>) =>
  effect.pipe(
    Effect.catchTags({
      CryptoError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      DatabaseError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      EmailApiError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      EmailNetworkError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
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

/** Authentication endpoint implementations backed by the HttpApi contract. */
export const authRoutes = HttpApiBuilder.group(Api, "Auth", (handlers) =>
  handlers
    .handle("signup", ({ payload }) =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { name, email, password } = payload;
          const normalizedEmail = email.toLowerCase();
          const { client: db } = yield* Db;
          const existing = yield* runDb(() =>
            db.query.users
              .findFirst({
                where: eq(schema.users.email, normalizedEmail),
              })
              .sync(),
          );

          if (existing) {
            return yield* Effect.fail(
              new ConflictResponse({
                error: "ConflictError",
                message: "An account with this email already exists",
              }),
            );
          }

          const auth = yield* Auth;
          const passwordHash = yield* auth.hashPassword(password);
          const id = yield* crypto.generateId();
          const now = Date.now();

          yield* runDb(() =>
            db
              .insert(schema.users)
              .values({
                id,
                name,
                email: normalizedEmail,
                passwordHash,
                emailVerified: 0,
                createdAt: now,
                updatedAt: now,
              })
              .run(),
          );

          const token = yield* auth.generateEmailVerificationToken(id);
          const emailService = yield* Email;
          const config = yield* AppConfig;
          yield* emailService.sendVerificationEmail(normalizedEmail, token, config.baseUrl);

          const sessionId = yield* auth.createSession(id);
          const response = yield* HttpServerResponse.json({
            user: {
              id,
              name,
              email: normalizedEmail,
              emailVerified: false,
              createdAt: now,
              updatedAt: now,
            },
          });
          return setSessionCookie(response, sessionId);
        }),
      ),
    )
    .handle("login", ({ payload }) =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { email, password } = payload;
          const { client: db } = yield* Db;
          const user = yield* runDb(() =>
            db.query.users
              .findFirst({
                where: eq(schema.users.email, email.toLowerCase()),
              })
              .sync(),
          );

          if (!user) {
            return yield* Effect.fail(
              new UnauthorizedResponse({
                error: "AuthError",
                message: "Invalid email or password",
              }),
            );
          }

          const auth = yield* Auth;
          const valid = yield* auth.verifyPassword(password, user.passwordHash);
          if (!valid) {
            return yield* Effect.fail(
              new UnauthorizedResponse({
                error: "AuthError",
                message: "Invalid email or password",
              }),
            );
          }

          const sessionId = yield* auth.createSession(user.id);
          const response = yield* HttpServerResponse.json({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: Boolean(user.emailVerified),
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          });
          return setSessionCookie(response, sessionId);
        }),
      ),
    )
    .handle("logout", () =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { session } = yield* requireAuth;
          const auth = yield* Auth;
          yield* auth.invalidateSession(session.id);
          return clearSessionCookie(yield* HttpServerResponse.json({ success: true }));
        }),
      ),
    )
    .handle("me", () =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { user } = yield* requireAuth;
          return {
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              emailVerified: Boolean(user.emailVerified),
              createdAt: user.createdAt,
              updatedAt: user.updatedAt,
            },
          };
        }),
      ),
    )
    .handle("verifyEmail", ({ payload }) =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const auth = yield* Auth;
          const userId = yield* auth
            .verifyEmailVerificationToken(payload.token)
            .pipe(Effect.catchTag("AuthError", () => Effect.void));

          if (!userId) {
            return yield* Effect.fail(
              new BadRequestResponse({
                error: "AuthError",
                message: "Invalid or expired verification token",
              }),
            );
          }

          const { client: db } = yield* Db;
          yield* runDb(() =>
            db
              .update(schema.users)
              .set({ emailVerified: 1, updatedAt: Date.now() })
              .where(eq(schema.users.id, userId))
              .run(),
          );

          return { success: true };
        }),
      ),
    )
    .handle("resendVerification", () =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { user } = yield* requireAuth;

          if (user.emailVerified) {
            return yield* Effect.fail(
              new ConflictResponse({
                error: "ConflictError",
                message: "Email already verified",
              }),
            );
          }

          const auth = yield* Auth;
          const token = yield* auth.generateEmailVerificationToken(user.id);
          const emailService = yield* Email;
          const config = yield* AppConfig;
          yield* emailService.sendVerificationEmail(user.email, token, config.baseUrl);

          return { success: true };
        }),
      ),
    )
    .handle("forgotPassword", ({ payload }) =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const { client: db } = yield* Db;
          const user = yield* runDb(() =>
            db.query.users
              .findFirst({
                where: eq(schema.users.email, payload.email.toLowerCase()),
              })
              .sync(),
          );

          if (user) {
            const auth = yield* Auth;
            const token = yield* auth.generatePasswordResetToken(user.id);
            const emailService = yield* Email;
            const config = yield* AppConfig;
            yield* emailService.sendPasswordResetEmail(user.email, token, config.baseUrl);
          }

          return { success: true };
        }),
      ),
    )
    .handle("resetPassword", ({ payload }) =>
      catchInfrastructureErrors(
        Effect.gen(function* () {
          const auth = yield* Auth;
          const userId = yield* auth
            .verifyPasswordResetToken(payload.token)
            .pipe(Effect.catchTag("AuthError", () => Effect.void));

          if (!userId) {
            return yield* Effect.fail(
              new BadRequestResponse({
                error: "AuthError",
                message: "Invalid or expired reset token",
              }),
            );
          }

          const passwordHash = yield* auth.hashPassword(payload.password);
          const { client: db } = yield* Db;
          yield* runDb(() =>
            db
              .update(schema.users)
              .set({ passwordHash, updatedAt: Date.now() })
              .where(eq(schema.users.id, userId))
              .run(),
          );

          yield* auth.invalidateAllUserSessions(userId);

          return { success: true };
        }),
      ),
    ),
);
