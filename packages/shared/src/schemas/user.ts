import { Schema } from "effect";

/** A non-empty string accepted by request payloads for required text fields. */
const RequiredString = Schema.String.check(Schema.isNonEmpty());

/** An email string accepted by account and authentication request payloads. */
const EmailString = RequiredString.check(Schema.isPattern(/^[^\s@]+@[^\s@]+\.[^\s@]+$/));

/** A password string accepted by request payloads that create or update passwords. */
const PasswordString = Schema.String.check(Schema.isMinLength(8));

export const User = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  email: Schema.String,
  emailVerified: Schema.Boolean,
  createdAt: Schema.Number,
  updatedAt: Schema.Number,
});
export type User = typeof User.Type;

/** A response containing the authenticated user's public account details. */
export const UserResponse = Schema.Struct({
  user: User,
});
export type UserResponse = typeof UserResponse.Type;

export const LoginRequest = Schema.Struct({
  email: EmailString,
  password: RequiredString,
});
export type LoginRequest = typeof LoginRequest.Type;

export const SignupRequest = Schema.Struct({
  name: RequiredString,
  email: EmailString,
  password: PasswordString,
});
export type SignupRequest = typeof SignupRequest.Type;

export const ForgotPasswordRequest = Schema.Struct({
  email: EmailString,
});
export type ForgotPasswordRequest = typeof ForgotPasswordRequest.Type;

export const ResetPasswordRequest = Schema.Struct({
  token: RequiredString,
  password: PasswordString,
});
export type ResetPasswordRequest = typeof ResetPasswordRequest.Type;

export const VerifyEmailRequest = Schema.Struct({
  token: RequiredString,
});
export type VerifyEmailRequest = typeof VerifyEmailRequest.Type;

export const UpdateProfileRequest = Schema.Struct({
  name: RequiredString,
});
export type UpdateProfileRequest = typeof UpdateProfileRequest.Type;

export const ChangePasswordRequest = Schema.Struct({
  currentPassword: RequiredString,
  newPassword: PasswordString,
});
export type ChangePasswordRequest = typeof ChangePasswordRequest.Type;
