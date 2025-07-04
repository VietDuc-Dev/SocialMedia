export const VerificationCodeEnum = {
  EmailVerification: "Email_verification",
  PasswordReset: "Password_reset",
} as const;

export type VerificationCodeEnumType = keyof typeof VerificationCodeEnum;
