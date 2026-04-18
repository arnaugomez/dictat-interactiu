import { HttpServerResponse } from "effect/unstable/http"
import { Effect } from "effect"

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173"

const addCors = (response: HttpServerResponse.HttpServerResponse) =>
  response.pipe(
    HttpServerResponse.setHeaders({
      "access-control-allow-origin": corsOrigin,
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-allow-credentials": "true",
    }),
  )

const jsonResponse = (body: unknown, options?: { status?: number }) =>
  addCors(HttpServerResponse.jsonUnsafe(body, options))

export const catchAuthErrors = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
) =>
  effect.pipe(
    Effect.map((response) => {
      if (
        response &&
        typeof response === "object" &&
        "status" in (response as any)
      ) {
        return addCors(response as any) as any as A
      }
      return response
    }),
    Effect.catchTag("UnauthorizedError", (e: any) =>
      Effect.succeed(jsonResponse({ error: "Unauthorized", message: e.message }, { status: 401 })),
    ),
    Effect.catchTag("ForbiddenError", (e: any) =>
      Effect.succeed(jsonResponse({ error: "Forbidden", message: e.message }, { status: 403 })),
    ),
    Effect.catchTag("NotFoundError", (e: any) =>
      Effect.succeed(jsonResponse({ error: "NotFound", message: e.message }, { status: 404 })),
    ),
    Effect.catchTag("HttpServerError", () =>
      Effect.succeed(jsonResponse({ error: "BadRequest", message: "Invalid request body" }, { status: 400 })),
    ),
    Effect.catch(() =>
      Effect.succeed(jsonResponse({ error: "InternalError", message: "Internal server error" }, { status: 500 })),
    ),
  )
