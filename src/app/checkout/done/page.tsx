import Link from "next/link";
import Header from "@/components/layout/Header";
import { formatVND } from "@/lib/utils";

/**
 * Checkout · Done — /checkout/done  (step 3 of 3)
 *
 * UI-only, and static enough to stay a Server Component (no useState).
 *
 * TODO(api): the order number, ETA and summary come from the placed-order
 *            response.
 * TODO(logic): "THEO DÕI ĐƠN" links to a real tracking screen later.
 */

const ROWS = [
  { k: "Sản phẩm", v: "2 món", strong: true },
  { k: "Địa chỉ", v: "124 Đường Maplewood, Căn 4B", strong: true },
  { k: "Thời gian", v: "21/06, 15:00 – 18:00", strong: true },
  { k: "Tổng cộng", v: formatVND(1600000), total: true },
];

export default function DonePage() {
  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas">
      {/* Desktop: shared storefront chrome */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col items-center px-7 md:justify-center md:py-16">
        <div className="mt-16 w-24 h-24 rounded-full bg-accent-sage-light flex items-center justify-center text-accent-sage md:mt-0">
          <span className="material-symbols-outlined" style={{ fontSize: 46 }}>check</span>
        </div>

        <h1 className="font-serif font-semibold text-[48px] text-text-primary mt-11 m-0">
          Đặt hàng thành công!
        </h1>
        <p className="font-sans text-[17px] text-text-muted mt-3 m-0">Đơn hàng #FP2031</p>

        <div className="flex items-center gap-[10px] mt-[26px] text-primary">
          <span className="material-symbols-outlined">local_shipping</span>
          <span className="font-sans font-bold text-[17px]">Giao hôm nay, 12:00 – 15:00</span>
        </div>

        <div className="w-full mt-[30px] bg-neutral-raised border border-neutral-border rounded-2xl px-[22px] md:max-w-md">
          {ROWS.map((r, i) => (
            <div
              key={r.k}
              className={`flex items-start justify-between gap-5 py-[18px] ${
                i < ROWS.length - 1 ? "border-b border-neutral-border" : ""
              }`}
            >
              <span className="font-sans text-[16px] text-text-muted flex-shrink-0">{r.k}</span>
              <span
                className={`font-sans text-right ${
                  r.total
                    ? "font-bold text-[22px] text-primary"
                    : "font-bold text-[16px] text-text-primary"
                }`}
              >
                {r.v}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-[22px] pt-[14px] pb-[26px] flex flex-col gap-3 md:max-w-md md:mx-auto md:w-full md:pb-16">
        {/* TODO(logic): link to a real order-tracking screen */}
        <button className="w-full bg-primary text-white rounded-full py-[18px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-primary-hover transition-colors">
          THEO DÕI ĐƠN
        </button>
        <Link
          href="/"
          className="w-full text-center bg-transparent text-primary border-[1.5px] border-primary rounded-full py-[18px] font-sans font-bold text-body-sm tracking-[0.1em] hover:bg-neutral-surface transition-colors"
        >
          VỀ TRANG CHỦ
        </Link>
      </div>
    </div>
  );
}
