import { HttpRouter, HttpServerRequest, HttpServerResponse } from "effect/unstable/http";
import { Effect, Layer } from "effect";
import { DictatService } from "../services/Dictat.js";
import { NotFoundError } from "../services/Auth.js";
import { requireVerifiedAuth } from "../middleware/auth.js";
import { Auth } from "../services/Auth.js";
import { catchAuthErrors } from "../lib/errors.js";

const requireParam = (params: Record<string, string | undefined>, name: string) =>
  Effect.gen(function* () {
    const value = params[name];
    if (value === undefined) {
      return yield* new NotFoundError({ message: `Missing parameter: ${name}` });
    }
    return value;
  });

const listDictats = HttpRouter.add(
  "GET",
  "/api/dictats",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const dictatService = yield* DictatService;
      const dictats = yield* dictatService.list(user.id);
      return yield* HttpServerResponse.json({ dictats });
    }),
  ),
);

const getDictat = HttpRouter.add(
  "GET",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const params = yield* HttpRouter.params;
      const id = yield* requireParam(params, "id");
      const dictatService = yield* DictatService;
      const dictat = yield* dictatService.getById(id, user.id);
      return yield* HttpServerResponse.json({ dictat });
    }),
  ),
);

const getPublicDictat = HttpRouter.add(
  "GET",
  "/api/public/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const request = yield* HttpServerRequest.HttpServerRequest;
      const params = yield* HttpRouter.params;
      const id = yield* requireParam(params, "id");
      const auth = yield* Auth;
      const viewer = request.cookies["session"]
        ? yield* auth.validateSession(request.cookies["session"]).pipe(
            Effect.map(({ user }) => user.id),
            Effect.catch(() => Effect.sync((): string | undefined => undefined)),
          )
        : undefined;
      const dictatService = yield* DictatService;
      const result = yield* dictatService.getPublicById(id, viewer);
      return yield* HttpServerResponse.json(result);
    }),
  ),
);

const createDictat = HttpRouter.add(
  "POST",
  "/api/dictats",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as {
        text: string;
        title?: string;
        config?: { lletraPal: boolean; fontSize: number; hidePct: number; fontType: string };
        hiddenIndices?: number[];
      };

      if (!body.text) {
        return yield* HttpServerResponse.json(
          { error: "ValidationError", message: "Text is required" },
          { status: 400 },
        );
      }

      const dictatService = yield* DictatService;
      const dictat = yield* dictatService.create(user.id, {
        text: body.text,
        title: body.title,
        config: body.config as any,
        hiddenIndices: body.hiddenIndices,
      });
      return yield* HttpServerResponse.json({ dictat }, { status: 201 });
    }),
  ),
);

const updateDictat = HttpRouter.add(
  "PUT",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const params = yield* HttpRouter.params;
      const id = yield* requireParam(params, "id");
      const request = yield* HttpServerRequest.HttpServerRequest;
      const body = (yield* request.json) as {
        title?: string;
        text?: string;
        config?: { lletraPal: boolean; fontSize: number; hidePct: number; fontType: string };
        hiddenIndices?: number[];
        isPublic?: boolean;
      };

      const dictatService = yield* DictatService;
      const dictat = yield* dictatService.update(id, user.id, {
        title: body.title,
        text: body.text,
        config: body.config as any,
        hiddenIndices: body.hiddenIndices,
        isPublic: body.isPublic,
      });
      return yield* HttpServerResponse.json({ dictat });
    }),
  ),
);

const deleteDictat = HttpRouter.add(
  "DELETE",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth;
      const params = yield* HttpRouter.params;
      const id = yield* requireParam(params, "id");
      const dictatService = yield* DictatService;
      yield* dictatService.remove(id, user.id);
      return yield* HttpServerResponse.json({ success: true });
    }),
  ),
);

export const dictatRoutes = Layer.mergeAll(
  listDictats,
  getDictat,
  getPublicDictat,
  createDictat,
  updateDictat,
  deleteDictat,
);
