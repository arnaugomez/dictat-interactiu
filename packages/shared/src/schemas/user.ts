import { Schema } from "effect"

export const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  emailVerified: Schema.Boolean,
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
})
export type User = typeof User.Type

export const LoginRequest = Schema.Struct({
  email: Schema.String,
  password: Schema.String,
})
export type LoginRequest = typeof LoginRequest.Type

export const SignupRequest = Schema.Struct({
  name: Schema.String,
  email: Schema.String,
  password: Schema.String,
})
export type SignupRequest = typeof SignupRequest.Type

export const ForgotPasswordRequest = Schema.Struct({
  email: Schema.String,
})
export type ForgotPasswordRequest = typeof ForgotPasswordRequest.Type

export const ResetPasswordRequest = Schema.Struct({
  token: Schema.String,
  password: Schema.String,
})
export type ResetPasswordRequest = typeof ResetPasswordRequest.Type

export const VerifyEmailRequest = Schema.Struct({
  token: Schema.String,
})
export type VerifyEmailRequest = typeof VerifyEmailRequest.Type

export const UpdateProfileRequest = Schema.Struct({
  name: Schema.String,
})
export type UpdateProfileRequest = typeof UpdateProfileRequest.Type

export const ChangePasswordRequest = Schema.Struct({
  currentPassword: Schema.String,
  newPassword: Schema.String,
})
export type ChangePasswordRequest = typeof ChangePasswordRequest.Type
