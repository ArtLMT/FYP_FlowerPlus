import PasswordResetFlow from "@/features/auth/PasswordResetFlow";

/**
 * Staff set-up page — /login/set-password, linked from the welcome email.
 * One screen: work email, the emailed set-up code and the new password. It never requests a
 * code (that would send a password-reset email instead); a new set-up email comes from the Admin.
 * The UI is `features/auth/PasswordResetFlow.tsx` in set-up mode.
 */
export default function SetPasswordPage() {
  return <PasswordResetFlow setup />;
}
