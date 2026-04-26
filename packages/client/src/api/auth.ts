import { withClient } from "./client";
import type { Effect } from "effect";
import type {
  ApiSuccessType,
  ForgotPasswordRequestType,
  LoginRequestType,
  ResetPasswordRequestType,
  SignupRequestType,
  UserResponseType,
  VerifyEmailRequestType,
} from "@dictat/shared";
import type { ApiError } from "./client";

/** Logs a user in using the shared Auth.login endpoint contract. */
export function login(params: LoginRequestType): Effect.Effect<UserResponseType, ApiError> {
  return withClient((client) => client.Auth.login({ payload: params }));
}

/** Creates a new account using the shared Auth.signup endpoint contract. */
export function signup(params: SignupRequestType): Effect.Effect<UserResponseType, ApiError> {
  return withClient((client) => client.Auth.signup({ payload: params }));
}

/** Logs the current user out using the shared Auth.logout endpoint contract. */
export function logout(): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Auth.logout());
}

/** Loads the current user using the shared Auth.me endpoint contract. */
export function getMe(): Effect.Effect<UserResponseType, ApiError> {
  return withClient((client) => client.Auth.me());
}

/** Verifies an email address using the shared Auth.verifyEmail endpoint contract. */
export function verifyEmail(
  params: VerifyEmailRequestType,
): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Auth.verifyEmail({ payload: params }));
}

/** Resends the verification email using the shared Auth.resendVerification endpoint contract. */
export function resendVerification(): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Auth.resendVerification());
}

/** Requests a password-reset email using the shared Auth.forgotPassword endpoint contract. */
export function forgotPassword(
  params: ForgotPasswordRequestType,
): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Auth.forgotPassword({ payload: params }));
}

/** Resets a password using the shared Auth.resetPassword endpoint contract. */
export function resetPassword(
  params: ResetPasswordRequestType,
): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Auth.resetPassword({ payload: params }));
}
