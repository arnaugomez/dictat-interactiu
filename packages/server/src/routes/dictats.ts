import { HttpApiBuilder } from "effect/unstable/httpapi";
import { Effect } from "effect";
import {
  Api,
  ForbiddenResponse,
  InternalErrorResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from "@dictat/shared";
import { DictatService } from "../services/Dictat.js";
import { requireVerifiedAuth } from "../middleware/auth.js";
import type { ForbiddenError, UnauthorizedError } from "../middleware/auth.js";
import { Auth } from "../services/Auth.js";
import type { DatabaseError } from "../db/client.js";
import type { AuthError, NotFoundError } from "../services/Auth.js";

/** Converts service and auth failures into typed API failures. */
type DictatRouteError =
  | AuthError
  | DatabaseError
  | ForbiddenError
  | NotFoundError
  | UnauthorizedError;

const catchDictatErrors = <A, R>(effect: Effect.Effect<A, DictatRouteError, R>) =>
  effect.pipe(
    Effect.catchTags({
      AuthError: (error) =>
        Effect.fail(new UnauthorizedResponse({ error: "AuthError", message: error.message })),
      DatabaseError: (error) =>
        Effect.fail(new InternalErrorResponse({ error: "InternalError", message: error.message })),
      ForbiddenError: (error) =>
        Effect.fail(new ForbiddenResponse({ error: "ForbiddenError", message: error.message })),
      NotFoundError: (error) =>
        Effect.fail(new NotFoundResponse({ error: "NotFoundError", message: error.message })),
      UnauthorizedError: (error) =>
        Effect.fail(
          new UnauthorizedResponse({ error: "UnauthorizedError", message: error.message }),
        ),
    }),
  );

/** Dictat endpoint implementations backed by the HttpApi contract. */
export const dictatRoutes = HttpApiBuilder.group(Api, "Dictats", (handlers) =>
  handlers
    .handle("listDictats", () =>
      catchDictatErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const dictatService = yield* DictatService;
          const dictats = yield* dictatService.list(user.id);
          return { dictats };
        }),
      ),
    )
    .handle("getDictat", ({ params }) =>
      catchDictatErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const dictatService = yield* DictatService;
          const dictat = yield* dictatService.getById(params.id, user.id);
          return { dictat };
        }),
      ),
    )
    .handle("getPublicDictat", ({ params, request }) =>
      catchDictatErrors(
        Effect.gen(function* () {
          const auth = yield* Auth;
          const viewer = request.cookies["session"]
            ? yield* auth.validateSession(request.cookies["session"]).pipe(
                Effect.map(({ user }) => user.id),
                Effect.catch(() => Effect.sync((): string | undefined => undefined)),
              )
            : undefined;
          const dictatService = yield* DictatService;
          return yield* dictatService.getPublicById(params.id, viewer);
        }),
      ),
    )
    .handle("createDictat", ({ payload }) =>
      catchDictatErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const dictatService = yield* DictatService;
          const dictat = yield* dictatService.create(user.id, {
            text: payload.text,
            title: payload.title,
            config: payload.config,
            hiddenIndices: payload.hiddenIndices,
          });
          return { dictat };
        }),
      ),
    )
    .handle("updateDictat", ({ params, payload }) =>
      catchDictatErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const dictatService = yield* DictatService;
          const dictat = yield* dictatService.update(params.id, user.id, {
            title: payload.title,
            text: payload.text,
            config: payload.config,
            hiddenIndices: payload.hiddenIndices,
            isPublic: payload.isPublic,
          });
          return { dictat };
        }),
      ),
    )
    .handle("deleteDictat", ({ params }) =>
      catchDictatErrors(
        Effect.gen(function* () {
          const { user } = yield* requireVerifiedAuth;
          const dictatService = yield* DictatService;
          yield* dictatService.remove(params.id, user.id);
          return { success: true };
        }),
      ),
    ),
);
