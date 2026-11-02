import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getAccountForToken } from "@/lib/services/auth";
import { isManager } from "@/features/admin/domains";
import AdminDashboard from "./AdminDashboard";

/** Server entry for `/admin`: loads the signed-in account, guards the route, then renders the dashboard shell. */
export default async function AdminPage() {
  const { user, error } = await getAccountForToken((await cookies()).get("flowerplus_at")?.value);

  // Customers must not learn the admin area exists.
  if (user && !isManager(user)) notFound();

  return <AdminDashboard user={user} initialError={error} />;
}
