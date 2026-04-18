import {
  HttpRouter,
  HttpServerRequest,
  HttpServerResponse,
} from "effect/unstable/http"
import { Effect, Layer } from "effect"
import { DictatService } from "../services/Dictat.js"
import { requireVerifiedAuth } from "../middleware/auth.js"
import { catchAuthErrors } from "../lib/errors.js"

const listDictats = HttpRouter.add(
  "GET",
  "/api/dictats",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth
      const dictatService = yield* DictatService
      const dictats = yield* dictatService.list(user.id)
      return HttpServerResponse.jsonUnsafe({ dictats })
    }),
  ),
)

const getDictat = HttpRouter.add(
  "GET",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth
      const { id } = yield* HttpRouter.params
      const dictatService = yield* DictatService
      const dictat = yield* dictatService.getById(id, user.id)
      return HttpServerResponse.jsonUnsafe({ dictat })
    }),
  ),
)

const createDictat = HttpRouter.add(
  "POST",
  "/api/dictats",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth
      const request = yield* HttpServerRequest.HttpServerRequest
      const body = (yield* request.json) as {
        text: string
        title?: string
        config?: { lletraPal: boolean; fontSize: number; hidePct: number; fontType: string }
        hiddenIndices?: number[]
      }

      if (!body.text) {
        return HttpServerResponse.jsonUnsafe(
          { error: "ValidationError", message: "Text is required" },
          { status: 400 },
        )
      }

      const dictatService = yield* DictatService
      const dictat = yield* dictatService.create(user.id, {
        text: body.text,
        title: body.title,
        config: body.config as any,
        hiddenIndices: body.hiddenIndices,
      })
      return HttpServerResponse.jsonUnsafe({ dictat }, { status: 201 })
    }),
  ),
)

const updateDictat = HttpRouter.add(
  "PUT",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth
      const { id } = yield* HttpRouter.params
      const request = yield* HttpServerRequest.HttpServerRequest
      const body = (yield* request.json) as {
        title?: string
        text?: string
        config?: { lletraPal: boolean; fontSize: number; hidePct: number; fontType: string }
        hiddenIndices?: number[]
      }

      const dictatService = yield* DictatService
      const dictat = yield* dictatService.update(id, user.id, {
        title: body.title,
        text: body.text,
        config: body.config as any,
        hiddenIndices: body.hiddenIndices,
      })
      return HttpServerResponse.jsonUnsafe({ dictat })
    }),
  ),
)

const deleteDictat = HttpRouter.add(
  "DELETE",
  "/api/dictats/:id",
  catchAuthErrors(
    Effect.gen(function* () {
      const { user } = yield* requireVerifiedAuth
      const { id } = yield* HttpRouter.params
      const dictatService = yield* DictatService
      yield* dictatService.remove(id, user.id)
      return HttpServerResponse.jsonUnsafe({ success: true })
    }),
  ),
)

export const dictatRoutes = Layer.mergeAll(
  listDictats,
  getDictat,
  createDictat,
  updateDictat,
  deleteDictat,
)
