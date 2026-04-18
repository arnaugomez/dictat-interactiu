export {
  DictatConfig,
  Dictat,
  CreateDictatRequest,
  UpdateDictatRequest,
} from "./schemas/dictat.js"
export type {
  DictatConfig as DictatConfigType,
  Dictat as DictatType,
  CreateDictatRequest as CreateDictatRequestType,
  UpdateDictatRequest as UpdateDictatRequestType,
} from "./schemas/dictat.js"

export {
  User,
  LoginRequest,
  SignupRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "./schemas/user.js"
export type {
  User as UserType,
  LoginRequest as LoginRequestType,
  SignupRequest as SignupRequestType,
  ForgotPasswordRequest as ForgotPasswordRequestType,
  ResetPasswordRequest as ResetPasswordRequestType,
  VerifyEmailRequest as VerifyEmailRequestType,
  UpdateProfileRequest as UpdateProfileRequestType,
  ChangePasswordRequest as ChangePasswordRequestType,
} from "./schemas/user.js"

export { ApiError, ApiSuccess } from "./schemas/api.js"
export type {
  ApiError as ApiErrorType,
  ApiSuccess as ApiSuccessType,
} from "./schemas/api.js"
