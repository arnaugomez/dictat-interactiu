import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { Auth } from "../services/Auth.js";
import { Email } from "../services/Email.js";
import { Db, runDb } from "../db/client.js";
import * as schema from "../db/schema.js";
import * as crypto from "../lib/crypto.js";
import { requireAuth } from "../middleware/auth.js";
import { catchAuthErrors } from "../lib/errors.js";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";
const SESSION_COOKIE_OPTIONS = `HttpOnly; SameSite=Lax; Path=/; Max-Age=${30 * 24 * 60 * 60}`;

const setSessionCookie = (response: HttpServerResponse.HttpServerResponse, sessionId: string) =>
  HttpServerResponse.setHeader(
    response,
    "set-cookie",
    `session=${sessionId}; ${SESSION_COOKIE_OPTIONS}`,
  );

const clearSessionCookie = (response: HttpServerResponse.HttpServerResponse) =>
  HttpServerResponse.setHeader(
    response,
    "set-cookie",
    `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
  );

const signup = HttpRouter.add(
  "POST",
  "/api/auth/signup",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as {
        name: string;
        email: string;
        password: string;
      };
      const { name, email, password } = body;

      if (!name || !email || !password) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Name, email and password are required" },
          { status: 400 },
        );
      }
      if (password.length < 8) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }

      const { client: db } = yield* Db;
      const existing = yield* runDb(() =>
        db.query.users
          .findFirst({
            where: eq(schema.users.email, email.toLowerCase()),
          })
          .sync(),
      );
      if (existing) {
        return yield* HttpServerResponse.json(
          { error: "ConflictError", message: "An account with this email already exists" },
          { status: 409 },
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
            email: email.toLowerCase(),
            passwordHash,
            emailVerified: 0,
            createdAt: now,
            updatedAt: now,
          })
          .run(),
      );

      const token = yield* auth.generateEmailVerificationToken(id);
      const emailService = yield* Email;
      yield* emailService.sendVerificationEmail(email.toLowerCase(), token, baseUrl);

      const sessionId = yield* auth.createSession(id);

      const resp = yield* HttpServerResponse.json({
        user: {
          id,
          name,
          email: email.toLowerCase(),
          emailVerified: false,
          createdAt: now,
          updatedAt: now,
        },
      });
      return setSessionCookie(resp, sessionId);
    }),
  ),
);

const login = HttpRouter.add(
  "POST",
  "/api/auth/login",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as { email: string; password: string };
      const { email, password } = body;

      if (!email || !password) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Email and password are required" },
          { status: 400 },
        );
      }

      const { client: db } = yield* Db;
      const user = yield* runDb(() =>
        db.query.users
          .findFirst({
            where: eq(schema.users.email, email.toLowerCase()),
          })
          .sync(),
      );
      if (!user) {
        return yield* HttpServerResponse.json(
          { error: "AuthError", message: "Invalid email or password" },
          { status: 401 },
        );
      }

      const auth = yield* Auth;
      const valid = yield* auth.verifyPassword(password, user.passwordHash);
      if (!valid) {
        return yield* HttpServerResponse.json(
          { error: "AuthError", message: "Invalid email or password" },
          { status: 401 },
        );
      }

      const sessionId = yield* auth.createSession(user.id);
      const resp = yield* HttpServerResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
      return setSessionCookie(resp, sessionId);
    }),
  ),
);

const logout = HttpRouter.add(
  "POST",
  "/api/auth/logout",
  catchAuthErrors(
    Effect.gen(function* () {
      const { session } = yield* requireAuth;
      const auth = yield* Auth;
      yield* auth.invalidateSession(session.id);
      return clearSessionCookie(yield* HttpServerResponse.json({ success: true }));
    }),
  ),
);

const me = HttpRouter.add(
  "GET",
  "/api/auth/me",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireAuth;
      return yield* HttpServerResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    }),
  ),
);

const verifyEmail = HttpRouter.add(
  "POST",
  "/api/auth/verify-email",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as { token: string };
      const { token } = body;

      if (!token) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Token is required" },
          { status: 400 },
        );
      }

      const auth = yield* Auth;
      const userId = yield* auth
        .verifyEmailVerificationToken(token)
        .pipe(Effect.catchTag("AuthError", () => Effect.succeed(null as string | null)));

      if (!userId) {
        return yield* HttpServerResponse.json(
          { error: "AuthError", message: "Invalid or expired verification token" },
          { status: 400 },
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

      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

const resendVerification = HttpRouter.add(
  "POST",
  "/api/auth/resend-verification",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireAuth;

      if (user.emailVerified) {
        return yield* HttpServerResponse.json(
          { error: "ConflictError", message: "Email already verified" },
          { status: 409 },
        );
      }

      const auth = yield* Auth;
      const token = yield* auth.generateEmailVerificationToken(user.id);
      const emailService = yield* Email;
      yield* emailService.sendVerificationEmail(user.email, token, baseUrl);

      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

const forgotPassword = HttpRouter.add(
  "POST",
  "/api/auth/forgot-password",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as { email: string };
      const { email } = body;

      if (!email) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Email is required" },
          { status: 400 },
        );
      }

      const { client: db } = yield* Db;
      const user = yield* runDb(() =>
        db.query.users
          .findFirst({
            where: eq(schema.users.email, email.toLowerCase()),
          })
          .sync(),
      );

      if (user) {
        const auth = yield* Auth;
        const token = yield* auth.generatePasswordResetToken(user.id);
        const emailService = yield* Email;
        yield* emailService.sendPasswordResetEmail(user.email, token, baseUrl);
      }

      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

const resetPassword = HttpRouter.add(
  "POST",
  "/api/auth/reset-password",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as { token: string; password: string };
      const { token, password } = body;

      if (!token || !password) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Token and password are required" },
          { status: 400 },
        );
      }
      if (password.length < 8) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Password must be at least 8 characters" },
          { status: 400 },
        );
      }

      const auth = yield* Auth;
      const userId = yield* auth
        .verifyPasswordResetToken(token)
        .pipe(Effect.catchTag("AuthError", () => Effect.succeed(null as string | null)));

      if (!userId) {
        return yield* HttpServerResponse.json(
          { error: "AuthError", message: "Invalid or expired reset token" },
          { status: 400 },
        );
      }

      const passwordHash = yield* auth.hashPassword(password);
      const { client: db } = yield* Db;
      yield* runDb(() =>
        db
          .update(schema.users)
          .set({ passwordHash, updatedAt: Date.now() })
          .where(eq(schema.users.id, userId))
          .run(),
      );

      yield* auth.invalidateAllUserSessions(userId);

      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

export const authRoutes = Layer.mergeAll(
  signup,
  login,
  logout,
  me,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
);
