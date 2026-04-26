import { Schema } from "effect";
import { HttpApi, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "effect/unstable/httpapi";
import { ApiSuccess, HealthResponse } from "./schemas/api.js";
import {
  CreateDictatRequest,
  DictatResponse,
  DictatsListResponse,
  PublicDictat,
  UpdateDictatRequest,
} from "./schemas/dictat.js";
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  ResetPasswordRequest,
  SignupRequest,
  UpdateProfileRequest,
  UserResponse,
  VerifyEmailRequest,
} from "./schemas/user.js";

/** Path parameters for endpoints that address a dictat by identifier. */
export const DictatIdParams = Schema.Struct({
  id: Schema.String.check(Schema.isNonEmpty()),
});

/** A schema-backed validation or bad-request error response. */
export class BadRequestResponse extends Schema.Class<BadRequestResponse>("BadRequestResponse")({
  error: Schema.String,
  message: Schema.String,
}) {}

/** A schema-backed authentication error response. */
export class UnauthorizedResponse extends Schema.Class<UnauthorizedResponse>(
  "UnauthorizedResponse",
)({
  error: Schema.String,
  message: Schema.String,
}) {}

/** A schema-backed authorization error response. */
export class ForbiddenResponse extends Schema.Class<ForbiddenResponse>("ForbiddenResponse")({
  error: Schema.String,
  message: Schema.String,
}) {}

/** A schema-backed not-found error response. */
export class NotFoundResponse extends Schema.Class<NotFoundResponse>("NotFoundResponse")({
  error: Schema.String,
  message: Schema.String,
}) {}

/** A schema-backed conflict error response. */
export class ConflictResponse extends Schema.Class<ConflictResponse>("ConflictResponse")({
  error: Schema.String,
  message: Schema.String,
}) {}

/** A schema-backed internal server error response. */
export class InternalErrorResponse extends Schema.Class<InternalErrorResponse>(
  "InternalErrorResponse",
)({
  error: Schema.String,
  message: Schema.String,
}) {}

/** Errors that every API endpoint can return. */
const CommonErrors = [
  BadRequestResponse.pipe(HttpApiSchema.status(400)),
  UnauthorizedResponse.pipe(HttpApiSchema.status(401)),
  ForbiddenResponse.pipe(HttpApiSchema.status(403)),
  NotFoundResponse.pipe(HttpApiSchema.status(404)),
  ConflictResponse.pipe(HttpApiSchema.status(409)),
  InternalErrorResponse.pipe(HttpApiSchema.status(500)),
] as const;

/** Authentication and account-management endpoints. */
export const AuthGroup = HttpApiGroup.make("Auth").add(
  HttpApiEndpoint.post("signup", "/api/auth/signup", {
    payload: SignupRequest,
    success: UserResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("login", "/api/auth/login", {
    payload: LoginRequest,
    success: UserResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("logout", "/api/auth/logout", {
    success: ApiSuccess,
    error: CommonErrors,
  }),
  HttpApiEndpoint.get("me", "/api/auth/me", {
    success: UserResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("verifyEmail", "/api/auth/verify-email", {
    payload: VerifyEmailRequest,
    success: ApiSuccess,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("resendVerification", "/api/auth/resend-verification", {
    success: ApiSuccess,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("forgotPassword", "/api/auth/forgot-password", {
    payload: ForgotPasswordRequest,
    success: ApiSuccess,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("resetPassword", "/api/auth/reset-password", {
    payload: ResetPasswordRequest,
    success: ApiSuccess,
    error: CommonErrors,
  }),
);

/** Dictat-management and public dictat endpoints. */
export const DictatsGroup = HttpApiGroup.make("Dictats").add(
  HttpApiEndpoint.get("listDictats", "/api/dictats", {
    success: DictatsListResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.get("getDictat", "/api/dictats/:id", {
    params: DictatIdParams,
    success: DictatResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.get("getPublicDictat", "/api/public/dictats/:id", {
    params: DictatIdParams,
    success: PublicDictat,
    error: CommonErrors,
  }),
  HttpApiEndpoint.post("createDictat", "/api/dictats", {
    payload: CreateDictatRequest,
    success: DictatResponse.pipe(HttpApiSchema.status(201)),
    error: CommonErrors,
  }),
  HttpApiEndpoint.put("updateDictat", "/api/dictats/:id", {
    params: DictatIdParams,
    payload: UpdateDictatRequest,
    success: DictatResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.delete("deleteDictat", "/api/dictats/:id", {
    params: DictatIdParams,
    success: ApiSuccess,
    error: CommonErrors,
  }),
);

/** User account endpoints. */
export const AccountGroup = HttpApiGroup.make("Account").add(
  HttpApiEndpoint.put("updateProfile", "/api/account/profile", {
    payload: UpdateProfileRequest,
    success: UserResponse,
    error: CommonErrors,
  }),
  HttpApiEndpoint.put("changePassword", "/api/account/password", {
    payload: ChangePasswordRequest,
    success: ApiSuccess,
    error: CommonErrors,
  }),
  HttpApiEndpoint.delete("deleteAccount", "/api/account", {
    success: ApiSuccess,
    error: CommonErrors,
  }),
);

/** Operational endpoints used by deployment and tests. */
export const HealthGroup = HttpApiGroup.make("Health").add(
  HttpApiEndpoint.get("health", "/api/health", {
    success: HealthResponse,
    error: CommonErrors,
  }),
);

/** The complete schema-first HTTP API contract shared by clients and servers. */
export const Api = HttpApi.make("DictatInteractiuApi").add(
  AuthGroup,
  DictatsGroup,
  AccountGroup,
  HealthGroup,
);
