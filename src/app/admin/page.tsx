import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { AccountUser } from "@/lib/services/auth";
import AdminDashboard from "./AdminDashboard";

const signInMessage = "Vui lòng đăng nhập để tiếp tục.";

async function loadAccount() {
  const accessToken = (await cookies()).get("flowerplus_at")?.value;
  if (!accessToken) {
    return { user: null, error: signInMessage };
  }

  try {
    const backendOrigin = process.env.FLOWERPLUS_API_ORIGIN ?? "http://localhost:8080";
    const response = await fetch(new URL("/api/users/me", backendOrigin), {
      headers: { Cookie: `flowerplus_at=${accessToken}` },
      cache: "no-store",
    });

    if (response.status === 401) {
      return { user: null, error: signInMessage };
    }
    if (!response.ok) {
      return { user: null, error: "Không thể xác minh tài khoản." };
    }

    return { user: (await response.json()) as AccountUser, error: "" };
  } catch {
    return { user: null, error: "Không thể kết nối máy chủ. Vui lòng thử lại." };
  }
}

export default async function AdminPage() {
  const { user, error } = await loadAccount();

  if (user && user.role !== "ADMIN" && user.role !== "STAFF") {
    notFound();
  }

  return <AdminDashboard user={user} initialError={error} />;
}
