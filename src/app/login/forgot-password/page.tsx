import PasswordResetFlow from "@/features/auth/PasswordResetFlow";

/**
 * Forgot-password page — /login/forgot-password.
 * The whole UI (email step → OTP step → new-password step) lives in `features/auth/PasswordResetFlow.tsx`.
 */
export default function ForgotPasswordPage() {
  return <PasswordResetFlow />;
}
