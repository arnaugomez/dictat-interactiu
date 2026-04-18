import { Effect, Layer } from "effect";
import {
  HttpClient,
  HttpClientResponse,
  HttpBody,
  FetchHttpClient,
  HttpClientRequest,
} from "effect/unstable/http";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Configure fetch with credentials
const FetchLayer = Layer.succeed(FetchHttpClient.RequestInit, {
  credentials: "include",
} as RequestInit);

// Configure client to prepend /api to all URLs
const ApiClientLayer = Layer.effect(
  HttpClient.HttpClient,
  Effect.gen(function* () {
    const baseClient = yield* HttpClient.HttpClient;
    return baseClient.pipe(HttpClient.mapRequest(HttpClientRequest.prependUrl("/api")));
  }),
);

const ClientLive = ApiClientLayer.pipe(
  Layer.provide(FetchLayer),
  Layer.provide(FetchHttpClient.layer),
);

function runApiEffect<T>(
  effect: Effect.Effect<HttpClientResponse.HttpClientResponse, unknown, HttpClient.HttpClient>,
): Promise<T> {
  return effect.pipe(
    Effect.flatMap((response) => {
      if (response.status >= 400) {
        return Effect.flatMap(response.json, (body) => {
          const err = body as { error?: string; message?: string };
          return Effect.fail(
            new ApiError(response.status, err?.error ?? "Error", err?.message ?? "Request failed"),
          );
        });
      }
      return response.json as Effect.Effect<T>;
    }),
    Effect.provide(ClientLive),
    Effect.runPromise,
  );
}

export const api = {
  get: <T>(path: string): Promise<T> => runApiEffect<T>(HttpClient.get(path)),

  post: <T>(path: string, body?: unknown): Promise<T> =>
    runApiEffect<T>(
      HttpClient.post(path, body !== undefined ? { body: HttpBody.jsonUnsafe(body) } : undefined),
    ),

  put: <T>(path: string, body?: unknown): Promise<T> =>
    runApiEffect<T>(
      HttpClient.put(path, body !== undefined ? { body: HttpBody.jsonUnsafe(body) } : undefined),
    ),

  del: <T>(path: string): Promise<T> => runApiEffect<T>(HttpClient.del(path)),
};
