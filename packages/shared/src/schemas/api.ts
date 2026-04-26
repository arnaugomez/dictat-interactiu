import { Schema } from "effect";

/** A successful mutation response. */
export const ApiSuccess = Schema.Struct({
  success: Schema.Boolean,
});
export type ApiSuccess = typeof ApiSuccess.Type;

/** A successful health-check response. */
export const HealthResponse = Schema.Struct({
  status: Schema.Literal("ok"),
});
export type HealthResponse = typeof HealthResponse.Type;

/** A structured API error response. */
export const ApiError = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
});
export type ApiError = typeof ApiError.Type;
