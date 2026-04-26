import { withClient } from "./client";
import type { Effect } from "effect";
import type {
  ApiSuccessType,
  ChangePasswordRequestType,
  UpdateProfileRequestType,
  UserResponseType,
} from "@dictat/shared";
import type { ApiError } from "./client";

/** Updates the current user's profile using the shared Account.updateProfile endpoint contract. */
export function updateProfile(
  params: UpdateProfileRequestType,
): Effect.Effect<UserResponseType, ApiError> {
  return withClient((client) => client.Account.updateProfile({ payload: params }));
}

/** Changes the current user's password using the shared Account.changePassword endpoint contract. */
export function changePassword(
  params: ChangePasswordRequestType,
): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Account.changePassword({ payload: params }));
}

/** Deletes the current user's account using the shared Account.deleteAccount endpoint contract. */
export function deleteAccount(): Effect.Effect<ApiSuccessType, ApiError> {
  return withClient((client) => client.Account.deleteAccount());
}
