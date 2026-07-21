export type AuthErrorCode = "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";

export function isAuthErrorCode(code: string): code is AuthErrorCode {
  return code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL";
}
