"use client";

import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import DetailHeader from "@/features/account/components/DetailHeader";
import { useResource } from "@/lib/hooks/use-resource";
import { listUsableVouchers, type UsableVoucher } from "@/lib/services/vouchers";
import { formatCalendarDate, formatVND, voucherLastValidShopDate } from "@/lib/utils";
import { saveVoucherCode } from "@/features/checkout/checkout-session";
import { SkeletonRows } from "@/components/ui/Skeleton";

export default function VouchersView() {
  const vouchers = useResource(listUsableVouchers, "account:usable-vouchers");
  const router = useRouter();
  return <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
    <DetailHeader title="Voucher của tôi" />
    <div className="px-[22px] pb-8 md:px-0">
      {vouchers.loading && <SkeletonRows label="Đang tải mã giảm giá…" />}
      {vouchers.error && <p role="alert" className="py-10 text-center text-primary">{vouchers.error.message}</p>}
      {!vouchers.loading && !vouchers.error && vouchers.data?.length === 0 && <p className="py-16 text-center font-serif italic text-heading-sm text-text-muted">Hiện chưa có mã giảm giá khả dụng.</p>}
      <div className="flex flex-col gap-5">{vouchers.data?.map((voucher) => <VoucherCard key={voucher.code} voucher={voucher} onUse={() => { saveVoucherCode(voucher.code); router.push("/cart"); }} />)}</div>
    </div>
  </div>;
}

function VoucherCard({ voucher, onUse }: { voucher: UsableVoucher; onUse: () => void }) {
  const amount = voucher.discountType === "PERCENTAGE" ? `Giảm ${voucher.discountValue}%` : `Giảm ${formatVND(voucher.discountValue)}`;
  return <article className="flex overflow-hidden rounded border border-neutral-border bg-neutral-surface">
    <div className="w-2 shrink-0 bg-primary" />
    <div className="flex-1 p-5">
      <div className="flex items-start justify-between gap-3"><strong className="font-serif text-2xl text-primary">{amount}</strong><span className="rounded bg-neutral-raised px-3 py-1 text-xs font-bold">VOUCHER</span></div>
      <p className="mt-2 text-sm text-text-secondary">Đơn tối thiểu {formatVND(voucher.minimumOrderAmount)}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-neutral-border pt-4">
        <div><code className="font-bold tracking-wide text-text-primary">{voucher.code}</code><p className="m-0 mt-1 text-xs text-text-muted">Hạn dùng {formatCalendarDate(voucherLastValidShopDate(voucher.expiresAt))}</p></div>
        <Button onClick={onUse} className="rounded-full bg-primary px-5 py-3 text-xs font-bold text-white">DÙNG NGAY</Button>
      </div>
    </div>
  </article>;
}
