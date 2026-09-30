"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

/**
 * VoucherField — apply / show / remove a discount code.
 *
 * Shared by the cart summary and the checkout confirm screen so both read and
 * write the same applied voucher on the cart store. All logic lives in the
 * store + lib/voucher; this is only the input UI.
 */
export default function VoucherField() {
  const { appliedVoucher, applyVoucher, removeVoucher } = useCart();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyVoucher(code);
    if (res.ok) {
      setCode("");
      setError(null);
    } else {
      setError(res.error ?? "Không thể áp dụng mã.");
    }
  };

  if (appliedVoucher) {
    return (
      <div className="flex items-center justify-between gap-3 bg-accent-sage-light border border-neutral-border rounded-lg p-4">
        <span className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-primary-deep" style={{ fontSize: 20 }}>
            local_offer
          </span>
          <span className="min-w-0">
            <span className="block font-sans font-bold text-body-sm text-primary-deep truncate">
              {appliedVoucher.code}
            </span>
            <span className="block font-sans text-label text-text-secondary truncate">
              {appliedVoucher.amount}
            </span>
          </span>
        </span>
        <button
          type="button"
          onClick={removeVoucher}
          aria-label={`Bỏ mã ${appliedVoucher.code}`}
          className="flex-none text-text-secondary hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-center gap-2 bg-neutral-surface border border-neutral-border rounded-lg p-2 pl-4">
        <span className="material-symbols-outlined text-primary-deep flex-none" style={{ fontSize: 20 }}>
          local_offer
        </span>
        <input
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Nhập mã giảm giá"
          aria-label="Mã giảm giá"
          className="flex-1 min-w-0 bg-transparent font-sans text-body text-text-primary placeholder:text-text-muted outline-none uppercase"
        />
        <button
          type="submit"
          disabled={!code.trim()}
          className="flex-none rounded-md bg-primary text-white px-4 py-2 font-sans font-bold text-label tracking-button hover:bg-primary-hover transition-colors disabled:bg-secondary disabled:cursor-not-allowed"
        >
          ÁP DỤNG
        </button>
      </div>
      {error && (
        <p role="alert" className="font-sans text-label text-primary mt-2 mb-0 px-1">
          {error}
        </p>
      )}
    </form>
  );
}
