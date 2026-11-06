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

  // The key restarts the dashboard once a renewed session loads the account, so its opening section
  // is chosen for that account's role and not for a signed-out visitor.
  return <AdminDashboard key={user?.id ?? "signed-out"} user={user} initialError={error} />;
}
