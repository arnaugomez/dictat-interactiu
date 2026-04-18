import { api } from "./client";

interface UserResponse {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: number;
  updatedAt: number;
}

interface AuthResponse {
  user: UserResponse;
}

interface SuccessResponse {
  success: boolean;
}

export function login(params: { email: string; password: string }): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", params);
}

export function signup(params: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/signup", params);
}

export function logout(): Promise<SuccessResponse> {
  return api.post<SuccessResponse>("/auth/logout");
}

export function getMe(): Promise<AuthResponse> {
  return api.get<AuthResponse>("/auth/me");
}

export function verifyEmail(params: { token: string }): Promise<SuccessResponse> {
  return api.post<SuccessResponse>("/auth/verify-email", params);
}

export function resendVerification(): Promise<SuccessResponse> {
  return api.post<SuccessResponse>("/auth/resend-verification");
}

export function forgotPassword(params: { email: string }): Promise<SuccessResponse> {
  return api.post<SuccessResponse>("/auth/forgot-password", params);
}

export function resetPassword(params: {
  token: string;
  password: string;
}): Promise<SuccessResponse> {
  return api.post<SuccessResponse>("/auth/reset-password", params);
}
