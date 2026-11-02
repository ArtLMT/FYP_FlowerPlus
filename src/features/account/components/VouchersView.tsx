"use client";
import Button from "@/components/ui/Button";

import { useState } from "react";
import DetailHeader from "@/features/account/components/DetailHeader";
import type { Voucher, VoucherState } from "@/lib/types";

/**
 * My Vouchers view for /account/vouchers.
 *
 * Vouchers come from the account service; tabs filter by state and "Sao chép"
 * copies the code to the clipboard.
 *
 * TODO(logic): "Dùng ngay" applies it.
 */

const TABS: { key: VoucherState; label: string }[] = [
  { key: "active", label: "ĐANG DÙNG" },
  { key: "used", label: "ĐÃ DÙNG" },
  { key: "expired", label: "HẾT HẠN" },
];

export default function VouchersView({ vouchers: allVouchers }: { vouchers: Voucher[] }) {
  const [tab, setTab] = useState<VoucherState>("active");
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const vouchers = allVouchers.filter((v) => v.state === tab);
  const emptyMsg = tab === "used" ? "Chưa có voucher nào được dùng." : "Không có voucher hết hạn.";

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      {/* Mobile-only back-bar; desktop uses the account layout title. */}
      <DetailHeader title="Voucher của tôi" />

      {/* Tabs */}
      <div className="flex gap-3 px-[22px] py-[18px] md:px-0 md:pt-0 md:flex-wrap">
        {TABS.map(({ key, label }) => {
          const on = key === tab;
          return (
            <Button
              key={key}
              onClick={() => setTab(key)}
              aria-pressed={on}
              className={`rounded-full py-3 px-[26px] font-sans font-bold text-body-sm tracking-badge transition-colors ${
                on
                  ? "bg-tertiary text-primary-deep border-none"
                  : "bg-transparent border border-neutral-border text-text-muted hover:bg-neutral-surface"
              }`}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* List / empty state */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-[22px] pb-8 md:flex-none md:overflow-visible md:px-0 md:pb-0">
        {vouchers.length === 0 ? (
          <p className="text-center py-20 font-serif italic text-heading-sm text-text-muted">{emptyMsg}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {vouchers.map((v) => (
              <div
                key={v.code}
                className="flex bg-neutral-surface border border-neutral-border rounded-[4px] overflow-hidden"
              >
                {/* One voucher ticket: coloured edge strip, then the content. */}
                <div className="w-[8px] bg-primary flex-shrink-0" />
                <div className="flex-1 p-[22px]">
                  {/* Discount amount and tag. */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-serif font-medium text-[32px] leading-none text-primary">
                      {v.amount}
                    </span>
                    <span className="px-3 py-[6px] rounded-[7px] font-sans font-bold text-label tracking-badge bg-neutral-raised text-text-secondary">
                      {v.tag}
                    </span>
                  </div>
                  {/* Voucher description and dashed divider. */}
                  <p className="font-sans text-body-lg text-text-secondary mt-3 m-0">{v.desc}</p>

                  <div className="border-t-[1.5px] border-dashed border-neutral-border my-[18px]" />

                  {/* Code with copy button, expiry date, and "DÙNG NGAY" button. */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-body-lg tracking-wide text-text-primary">
                          {v.code}
                        </span>
                        <Button
                          onClick={() => copy(v.code)}
                          className="text-text-muted hover:text-text-primary transition-colors inline-flex"
                          aria-label="Sao chép mã"
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                            {copied === v.code ? "check" : "content_copy"}
                          </span>
                        </Button>
                      </div>
                      <p className="font-sans text-body-sm text-text-muted mt-2 m-0">
                        Hiệu lực đến {v.validUntil}
                      </p>
                    </div>
                    <Button className="bg-primary text-text-on-primary border-none rounded-full py-[14px] px-6 font-sans font-bold text-body-sm tracking-badge whitespace-nowrap hover:bg-primary-hover transition-colors">
                      DÙNG NGAY
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
