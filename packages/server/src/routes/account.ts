import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { Auth } from "../services/Auth.js";
import { Db } from "../db/client.js";
import * as schema from "../db/schema.js";
import { requireVerifiedAuth } from "../middleware/auth.js";
import { catchAuthErrors } from "../lib/errors.js";

const updateProfile = HttpRouter.add(
  "PUT",
  "/api/account/profile",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as { name: string };
      const { name } = body;

      if (!name) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Name is required" },
          { status: 400 },
        );
      }

      const { client: db } = yield* Db;
      db.update(schema.users)
        .set({ name, updatedAt: Date.now() })
        .where(eq(schema.users.id, user.id))
        .run();

      return yield* HttpServerResponse.json({
        user: {
          id: user.id,
          name,
          email: user.email,
          emailVerified: !!user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: Date.now(),
        },
      });
    }),
  ),
);

const changePassword = HttpRouter.add(
  "PUT",
  "/api/account/password",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as {
        currentPassword: string;
        newPassword: string;
      };
      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Current and new passwords are required" },
          { status: 400 },
        );
      }
      if (newPassword.length < 8) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "New password must be at least 8 characters" },
          { status: 400 },
        );
      }

      const auth = yield* Auth;
      const valid = yield* auth.verifyPassword(currentPassword, user.passwordHash);
      if (!valid) {
        return yield* HttpServerResponse.json(
          { error: "AuthError", message: "Current password is incorrect" },
          { status: 401 },
        );
      }

      const passwordHash = yield* auth.hashPassword(newPassword);
      const { client: db } = yield* Db;
      db.update(schema.users)
        .set({ passwordHash, updatedAt: Date.now() })
        .where(eq(schema.users.id, user.id))
        .run();

      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

const deleteAccount = HttpRouter.add(
  "DELETE",
  "/api/account",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const { client: db } = yield* Db;

      db.delete(schema.users).where(eq(schema.users.id, user.id)).run();

      const resp = yield* HttpServerResponse.json({ success: true });
      return HttpServerResponse.setHeader(
        resp,
        "set-cookie",
        `session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0`,
      );
    }),
  ),
);

export const accountRoutes = Layer.mergeAll(updateProfile, changePassword, deleteAccount);
