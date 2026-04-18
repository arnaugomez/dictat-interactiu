import { Schema } from "effect"

export const ApiError = Schema.Struct({
  error: Schema.String,
  message: Schema.String,
})
export type ApiError = typeof ApiError.Type

export const ApiSuccess = Schema.Struct({
  success: Schema.Boolean,
})
export type ApiSuccess = typeof ApiSuccess.Type
