import NotificationsView from "@/features/account/components/NotificationsView";
import { getNotifications } from "@/lib/services/account";

/** Notifications — /account/notifications */
export default async function NotificationsPage() {
  return <NotificationsView notifications={await getNotifications()} />;
}
