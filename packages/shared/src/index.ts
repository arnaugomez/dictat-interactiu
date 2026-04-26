export {
  AccountGroup,
  Api,
  AuthGroup,
  BadRequestResponse,
  ConflictResponse,
  DictatIdParams,
  DictatsGroup,
  ForbiddenResponse,
  HealthGroup,
  InternalErrorResponse,
  NotFoundResponse,
  UnauthorizedResponse,
} from "./api.js";

export {
  DictatConfig,
  Dictat,
  PublicDictat,
  DictatResponse,
  DictatsListResponse,
  CreateDictatRequest,
  UpdateDictatRequest,
} from "./schemas/dictat.js";
export type {
  DictatConfig as DictatConfigType,
  Dictat as DictatType,
  PublicDictat as PublicDictatType,
  DictatResponse as DictatResponseType,
  DictatsListResponse as DictatsListResponseType,
  CreateDictatRequest as CreateDictatRequestType,
  UpdateDictatRequest as UpdateDictatRequestType,
} from "./schemas/dictat.js";

export {
  User,
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  UserResponse,
} from "./schemas/user.js";
export type {
  User as UserType,
  LoginRequest as LoginRequestType,
  SignupRequest as SignupRequestType,
  ForgotPasswordRequest as ForgotPasswordRequestType,
  ResetPasswordRequest as ResetPasswordRequestType,
  VerifyEmailRequest as VerifyEmailRequestType,
  UpdateProfileRequest as UpdateProfileRequestType,
  ChangePasswordRequest as ChangePasswordRequestType,
  UserResponse as UserResponseType,
} from "./schemas/user.js";

export { ApiError, ApiSuccess, HealthResponse } from "./schemas/api.js";
export type {
  ApiError as ApiErrorType,
  ApiSuccess as ApiSuccessType,
  HealthResponse as HealthResponseType,
} from "./schemas/api.js";
