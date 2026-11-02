import PasswordResetFlow from "@/features/auth/PasswordResetFlow";

/**
 * Forgot-password page — /login/forgot-password.
 * The whole UI (email step → OTP step → new-password step) lives in `features/auth/PasswordResetFlow.tsx`.
 * `?have-code=1` opens on "I already have a code". Welcome emails sent before 2026-10-29 afternoon
 * link here; newer ones link to /login/set-password instead.
 */
export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { "have-code": haveCode } = await searchParams;
  return <PasswordResetFlow startWithCode={haveCode === "1"} />;
}
