import VouchersView from "@/features/account/components/VouchersView";
import { getVouchers } from "@/lib/services/account";

/** My Vouchers — /account/vouchers */
export default async function VouchersPage() {
  return <VouchersView vouchers={await getVouchers()} />;
}
