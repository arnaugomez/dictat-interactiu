import { Effect, Layer, Schema } from "effect";
import {
  Api,
  BadRequestResponse,
  ConflictResponse,
  ForbiddenResponse,
  InternalErrorResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from "@dictat/shared";
import { FetchHttpClient } from "effect/unstable/http";
import { HttpApiClient, HttpApiError } from "effect/unstable/httpapi";

/** Client-side API error produced by the Effect HTTP API client boundary. */
export class ApiError extends Schema.TaggedErrorClass<ApiError>("ApiError")("ApiError", {
  /** HTTP status associated with the failed request. */
  status: Schema.Number,
  /** Machine-readable error code from the response schema or transport error. */
  code: Schema.String,
  /** Human-readable message suitable for existing UI error displays. */
  message: Schema.String,
}) {}

/** Fetch configuration shared by every browser API request. */
const FetchLayer = Layer.succeed(FetchHttpClient.RequestInit, {
  credentials: "include",
} satisfies RequestInit);

/** Effect client layer used to execute derived HttpApi client methods. */
const ClientLive = FetchHttpClient.layer.pipe(Layer.provide(FetchLayer));

/** Lazily derives the type-safe client from the shared HttpApi contract. */
const clientEffect = HttpApiClient.make(Api);

/** Client type generated from the shared HttpApi contract. */
type ApiClient = Effect.Success<typeof clientEffect>;

/** Maps the shared error schema class to its HTTP status code. */
const statusFromError = (error: unknown): number => {
  if (error instanceof BadRequestResponse) return 400;
  if (error instanceof UnauthorizedResponse) return 401;
  if (error instanceof ForbiddenResponse) return 403;
  if (error instanceof NotFoundResponse) return 404;
  if (error instanceof ConflictResponse) return 409;
  if (error instanceof InternalErrorResponse) return 500;
  if (error instanceof HttpApiError.BadRequest) return 400;
  return 500;
};

/** Reads a structured error code from an Effect HTTP API failure. */
const codeFromError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "error" in error) {
    return String(error.error);
  }
  if (typeof error === "object" && error !== null && "_tag" in error) {
    return String(error._tag);
  }
  return "Error";
};

/** Reads a displayable message from an Effect HTTP API failure. */
const messageFromError = (error: unknown): string => {
  if (typeof error === "object" && error !== null && "message" in error) {
    return String(error.message);
  }
  if (error instanceof Schema.SchemaError) {
    return error.message;
  }
  return "Request failed";
};

/** Converts Effect HTTP API failures into the app's typed client API error. */
const toApiError = (error: unknown): ApiError =>
  new ApiError({
    status: statusFromError(error),
    code: codeFromError(error),
    message: messageFromError(error),
  });

/** Builds an Effect operation against the derived shared HttpApi client. */
export const withClient = <A, E>(
  useClient: (client: ApiClient) => Effect.Effect<A, E>,
): Effect.Effect<A, ApiError> =>
  clientEffect.pipe(
    Effect.flatMap(useClient),
    Effect.mapError(toApiError),
    Effect.provide(ClientLive),
  );
