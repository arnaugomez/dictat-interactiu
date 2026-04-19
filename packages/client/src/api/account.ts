import { api } from "./client";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ProfileResponse {
  user: UserResponse;
}

interface SuccessResponse {
  success: boolean;
}

export function updateProfile(params: { name: string }): Promise<ProfileResponse> {
  return api.put<ProfileResponse>("/account/profile", params);
}

export function changePassword(params: {
  currentPassword: string;
  newPassword: string;
}): Promise<SuccessResponse> {
  return api.put<SuccessResponse>("/account/password", params);
}

export function deleteAccount(): Promise<SuccessResponse> {
  return api.del<SuccessResponse>("/account");
}
