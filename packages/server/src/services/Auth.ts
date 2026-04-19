import { Effect, Context, Layer, Data } from "effect";
import { eq } from "drizzle-orm";
import { Db } from "../db/client.js";
import * as schema from "../db/schema.js";
import * as crypto from "../lib/crypto.js";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const ONE_HOUR_MS = 60 * 60 * 1000;
const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;

export class AuthError extends Data.TaggedError("AuthError")<{
  readonly message: string;
}> {}

export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  readonly message: string;
}> {}

export class Auth extends Context.Service<
  Auth,
  {
    readonly hashPassword: (plain: string) => Effect.Effect<string>;
    readonly verifyPassword: (plain: string, hash: string) => Effect.Effect<boolean>;
    readonly createSession: (userId: string) => Effect.Effect<string>;
    readonly validateSession: (
      sessionId: string,
    ) => Effect.Effect<
      { user: typeof schema.users.$inferSelect; session: typeof schema.sessions.$inferSelect },
      AuthError
    >;
    readonly invalidateSession: (sessionId: string) => Effect.Effect<void>;
    readonly invalidateAllUserSessions: (userId: string) => Effect.Effect<void>;
    readonly generateEmailVerificationToken: (userId: string) => Effect.Effect<string>;
    readonly verifyEmailVerificationToken: (token: string) => Effect.Effect<string, AuthError>;
    readonly generatePasswordResetToken: (userId: string) => Effect.Effect<string>;
    readonly verifyPasswordResetToken: (token: string) => Effect.Effect<string, AuthError>;
  }
>()("@dictat/Auth") {}

export const AuthLive = Layer.effect(
  Auth,
  Effect.gen(function* () {
    const { client: db } = yield* Db;

    const hashPassword = (plain: string) => crypto.hashPassword(plain);
    const verifyPassword = (plain: string, hash: string) => crypto.verifyPassword(plain, hash);

    const createSession = Effect.fn("Auth.createSession")(function* (userId: string) {
      const token = yield* crypto.generateToken();
      const now = Date.now();
      db.insert(schema.sessions)
        .values({
          id: token,
          userId,
          expiresAt: now + THIRTY_DAYS_MS,
        })
        .run();
      return token;
    });

    const validateSession = Effect.fn("Auth.validateSession")(function* (sessionId: string) {
      const result = db.query.sessions
        .findFirst({
          where: eq(schema.sessions.id, sessionId),
        })
        .sync();
      if (!result) {
        return yield* new AuthError({ message: "Invalid session" });
      }
      const now = Date.now();
      if (result.expiresAt < now) {
        db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId)).run();
        return yield* new AuthError({ message: "Session expired" });
      }
      // Sliding expiration
      if (result.expiresAt - now < FIFTEEN_DAYS_MS) {
        db.update(schema.sessions)
          .set({ expiresAt: now + THIRTY_DAYS_MS })
          .where(eq(schema.sessions.id, sessionId))
          .run();
      }
      const user = db.query.users
        .findFirst({
          where: eq(schema.users.id, result.userId),
        })
        .sync();
      if (!user) {
        return yield* new AuthError({ message: "User not found" });
      }
      return { user, session: result };
    });

    const invalidateSession = (sessionId: string) =>
      Effect.sync(() => {
        db.delete(schema.sessions).where(eq(schema.sessions.id, sessionId)).run();
      });

    const invalidateAllUserSessions = (userId: string) =>
      Effect.sync(() => {
        db.delete(schema.sessions).where(eq(schema.sessions.userId, userId)).run();
      });

    const generateEmailVerificationToken = Effect.fn("Auth.generateEmailVerificationToken")(
      function* (userId: string) {
        db.delete(schema.emailVerificationTokens)
          .where(eq(schema.emailVerificationTokens.userId, userId))
          .run();
        const token = yield* crypto.generateToken();
        db.insert(schema.emailVerificationTokens)
          .values({
            id: token,
            userId,
            expiresAt: Date.now() + ONE_HOUR_MS,
          })
          .run();
        return token;
      },
    );

    const verifyEmailVerificationToken = Effect.fn("Auth.verifyEmailVerificationToken")(function* (
      token: string,
    ) {
      const result = db.query.emailVerificationTokens
        .findFirst({
          where: eq(schema.emailVerificationTokens.id, token),
        })
        .sync();
      if (!result) {
        return yield* new AuthError({ message: "Invalid verification token" });
      }
      db.delete(schema.emailVerificationTokens)
        .where(eq(schema.emailVerificationTokens.id, token))
        .run();
      if (result.expiresAt < Date.now()) {
        return yield* new AuthError({ message: "Verification token expired" });
      }
      return result.userId;
    });

    const generatePasswordResetToken = Effect.fn("Auth.generatePasswordResetToken")(function* (
      userId: string,
    ) {
      db.delete(schema.passwordResetTokens)
        .where(eq(schema.passwordResetTokens.userId, userId))
        .run();
      const token = yield* crypto.generateToken();
      db.insert(schema.passwordResetTokens)
        .values({
          id: token,
          userId,
          expiresAt: Date.now() + ONE_HOUR_MS,
        })
        .run();
      return token;
    });

    const verifyPasswordResetToken = Effect.fn("Auth.verifyPasswordResetToken")(function* (
      token: string,
    ) {
      const result = db.query.passwordResetTokens
        .findFirst({
          where: eq(schema.passwordResetTokens.id, token),
        })
        .sync();
      if (!result) {
        return yield* new AuthError({ message: "Invalid reset token" });
      }
      db.delete(schema.passwordResetTokens).where(eq(schema.passwordResetTokens.id, token)).run();
      if (result.expiresAt < Date.now()) {
        return yield* new AuthError({ message: "Reset token expired" });
      }
      return result.userId;
    });

    return {
      hashPassword,
      verifyPassword,
      createSession,
      validateSession,
      invalidateSession,
      invalidateAllUserSessions,
      generateEmailVerificationToken,
      verifyEmailVerificationToken,
      generatePasswordResetToken,
      verifyPasswordResetToken,
    };
  }),
);
