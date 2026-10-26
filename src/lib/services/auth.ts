import { api, asApiError, SIGN_IN_MESSAGE } from "@/lib/api";
import { formatWait } from "@/lib/utils";

/** Sign-in, registration, email verification and password reset. */

export type AccountRole = "ADMIN" | "STAFF" | "CUSTOMER";
export type AccountStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED";

export interface AccountUser {
  id: string;
  username: string;
  email: string;
  role: AccountRole;
  status: AccountStatus;
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
}

/**
 * Starts Google sign-in. The browser itself goes to the backend — not through the /api proxy —
 * because the OAuth exchange keeps its state in a backend session cookie and Google calls the
 * backend's own callback URL. The backend then sets the auth cookies and sends the browser back
 * to the shop home page, or to /login?error=CODE on failure.
 */
export const GOOGLE_LOGIN_URL = `${process.env.NEXT_PUBLIC_FLOWERPLUS_API_ORIGIN ?? "http://localhost:8080"}/oauth2/authorization/google`;

/** Wording for the ?error= code the backend's Google failure redirect carries. */
export function googleLoginError(code: string | null): string | null {
  if (!code) return null;
  if (code === "ACCOUNT_BLOCKED") return "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ cửa hàng.";
  return "Đăng nhập bằng Google không thành công. Vui lòng thử lại.";
}

export const login = (email: string, password: string) =>
  api<void>("/api/auth/login", { method: "POST", body: { email: email.trim(), password } });

export const register = (fullName: string, email: string, password: string) =>
  api<void>("/api/auth/register", {
    method: "POST",
    body: { fullName: fullName.trim(), email: email.trim(), password },
  });

export const verifyEmail = (email: string, code: string) =>
  api<void>("/api/auth/verify-email", { method: "POST", body: { email, code } });

export const resendOtp = (email: string) =>
  api<void>("/api/auth/resend-otp", { method: "POST", body: { email } });

export const requestPasswordReset = (email: string) =>
  withRetryHint(api<void>("/api/auth/forgot-password", { method: "POST", body: { email: email.trim() } }));

export const resetPassword = (email: string, code: string, newPassword: string) =>
  withRetryHint(api<void>("/api/auth/reset-password", {
    method: "POST",
    body: { email: email.trim(), code, newPassword },
  }));

export const logout = () => api<void>("/api/auth/logout", { method: "POST" });

/** The signed-in account, or null for a guest. */
export async function getCurrentUser(): Promise<AccountUser | null> {
  try {
    return await api<AccountUser>("/api/users/me");
  } catch (cause) {
    if (asApiError(cause).status === 401) return null;
    throw cause;
  }
}

/**
 * Server-side: the account behind the access-token cookie, or why it could not be loaded.
 * Server components cannot rely on the browser sending cookies, so the token is forwarded.
 */
export async function getAccountForToken(
  accessToken: string | undefined,
): Promise<{ user: AccountUser | null; error: string }> {
  if (!accessToken) return { user: null, error: SIGN_IN_MESSAGE };
  try {
    const user = await api<AccountUser>("/api/users/me", {
      headers: { Cookie: `flowerplus_at=${accessToken}` },
      errors: { status: { 401: SIGN_IN_MESSAGE }, fallback: "Không thể xác minh tài khoản." },
    });
    return { user, error: "" };
  } catch (cause) {
    return { user: null, error: asApiError(cause).message };
  }
}

/** When the backend throttles a code request, tell the customer how long to wait. */
async function withRetryHint<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (cause) {
    const error = asApiError(cause);
    if (error.retryAfterSeconds > 0) {
      error.message = `${error.message} Có thể yêu cầu mã mới sau ${formatWait(error.retryAfterSeconds)}.`;
    }
    throw error;
  }
}
