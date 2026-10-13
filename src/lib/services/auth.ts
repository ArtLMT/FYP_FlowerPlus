import { api } from "@/lib/api";

export interface AccountUser {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "STAFF" | "CUSTOMER";
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "BANNED";
  fullName: string | null;
  phone: string | null;
  avatar: string | null;
}

export const login = (email: string, password: string) =>
  api<void>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });

export const register = (fullName: string, email: string, password: string) =>
  api<void>("/api/auth/register", { method: "POST", body: JSON.stringify({ fullName, email, password }) });

export const verifyEmail = (email: string, code: string) =>
  api<void>("/api/auth/verify-email", { method: "POST", body: JSON.stringify({ email, code }) });

export const resendOtp = (email: string) =>
  api<void>("/api/auth/resend-otp", { method: "POST", body: JSON.stringify({ email }) });

export const requestPasswordReset = (email: string) =>
  api<void>("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });

export const resetPassword = (email: string, code: string, newPassword: string) =>
  api<void>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, code, newPassword }),
  });

export const logout = () => api<void>("/api/auth/logout", { method: "POST" });
export const currentUser = () => api<AccountUser>("/api/users/me");
