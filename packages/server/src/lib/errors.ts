import { HttpServerResponse } from "effect/unstable/http";
import { Effect } from "effect";

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

const addCors = (response: HttpServerResponse.HttpServerResponse) =>
  response.pipe(
    HttpServerResponse.setHeaders({
      "access-control-allow-origin": corsOrigin,
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "content-type",
      "access-control-allow-credentials": "true",
    }),
  );

const jsonResponse = (body: unknown, options?: { status?: number }) =>
  HttpServerResponse.json(body, options).pipe(Effect.map(addCors));

const errorStatusMap: Record<string, number> = {
  UnauthorizedError: 401,
  ForbiddenError: 403,
  NotFoundError: 404,
  HttpServerError: 400,
  HttpBodyError: 400,
  DatabaseError: 500,
  CryptoError: 500,
  EmailNetworkError: 500,
  EmailApiError: 500,
};

export const catchAuthErrors = <A, E, R>(
  effect: Effect.Effect<A, E, R>,
): Effect.Effect<A | HttpServerResponse.HttpServerResponse, never, Exclude<R, never>> =>
  effect.pipe(
    Effect.map((response) => {
      if (response && typeof response === "object" && "status" in (response as object)) {
        return addCors(response as unknown as HttpServerResponse.HttpServerResponse) as A;
      }
      return response;
    }),
    Effect.catch((error: unknown) => {
      const tag = (error as { _tag?: string })?._tag ?? "";
      const message = (error as { message?: string })?.message ?? "Internal server error";
      const status = errorStatusMap[tag] ?? 500;
      const label = status === 500 ? "InternalError" : tag;
      return jsonResponse({ error: label, message }, { status });
    }),
  ) as Effect.Effect<A | HttpServerResponse.HttpServerResponse, never, Exclude<R, never>>;
