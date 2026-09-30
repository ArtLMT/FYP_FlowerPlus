"use client";

import { useState } from "react";
import Image from "next/image";
import DetailHeader from "@/features/account/components/DetailHeader";
import { formatVND } from "@/lib/utils";
import { liveOrder, orders } from "@/lib/mock-data";
import type { OrderStatus, TrackStepState } from "@/lib/types";

/**
 * Order management — /account/orders
 *
 * Live-order tracker + order history, both from the central mock. Tabs filter
 * the history by status.
 *
 * TODO(api): fetch the live order + history. TODO(logic): search, "Mua lại".
 */

const FILTERS: { key: "all" | OrderStatus; label: string }[] = [
  { key: "all", label: "TẤT CẢ" },
  { key: "unpaid", label: "CHỜ THANH TOÁN" },
  { key: "processing", label: "ĐANG XỬ LÝ" },
  { key: "delivering", label: "ĐANG GIAO" },
  { key: "done", label: "HOÀN TẤT" },
  { key: "cancelled", label: "ĐÃ HỦY" },
];

function Step({ label, state }: { label: string; state: TrackStepState }) {
  return (
    <div className="relative z-10 flex flex-col items-center gap-2 w-[60px]">
      {state === "done" && (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined" style={{ fontSize: 15 }}>check</span>
        </div>
      )}
      {state === "current" && (
        <div className="w-6 h-6 rounded-full bg-neutral-raised border border-primary flex items-center justify-center ring-4 ring-neutral-surface">
          <span className="w-2 h-2 rounded-full bg-primary" />
        </div>
      )}
      {state === "todo" && (
        <div className="w-6 h-6 rounded-full bg-neutral-canvas border border-neutral-border flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-neutral-border" />
        </div>
      )}
      <span
        className={`font-sans font-bold text-label uppercase tracking-badge text-center ${
          state === "todo" ? "text-text-muted" : "text-primary-deep"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function OrdersPage() {
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      <DetailHeader title="Đơn hàng" />

      <div className="flex-1 overflow-y-auto no-scrollbar pt-8 pb-20 md:flex-none md:overflow-visible md:pt-0 md:pb-0">
        {/* ── Live Order ── */}
        <div className="px-5">
          <div className="bg-neutral-surface border border-neutral-border rounded-[4px] p-4 flex flex-col gap-4">
            <h2 className="font-serif font-medium text-heading-md text-primary text-center m-0">
              Đơn đang giao
            </h2>

            <div className="relative px-2 pb-4">
              <div className="absolute top-[11px] left-3 right-3 h-0.5 bg-neutral-border" />
              <div className="absolute top-[11px] left-3 w-[calc(50%-12px)] h-0.5 bg-primary" />
              <div className="relative flex justify-between">
                {liveOrder.steps.map((s) => (
                  <Step key={s.label} label={s.label} state={s.state} />
                ))}
              </div>
            </div>

            <div className="ml-1.5 border-l border-neutral-border pl-[22px] pt-1">
              {liveOrder.timeline.map((e, i) => (
                <div key={i} className="relative pb-5 last:pb-0">
                  <span
                    className={`absolute -left-[28px] top-[5px] w-3 h-3 rounded-full border ${
                      e.active ? "bg-neutral-raised border-primary" : "bg-neutral-canvas border-neutral-border"
                    }`}
                  />
                  <p className="font-sans text-body-sm text-text-muted mb-1 m-0">{e.time}</p>
                  <p
                    className={`font-sans text-body leading-[1.6] m-0 ${
                      e.active ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    {e.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── My Orders ── */}
        <div className="pt-5">
          <h2 className="px-5 font-serif font-medium text-heading-md text-primary/80 m-0 mb-4">Đơn của tôi</h2>

          {/* Filter tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 mb-4">
            {FILTERS.map((f) => {
              const on = f.key === filter;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  aria-pressed={on}
                  className={`whitespace-nowrap flex-shrink-0 rounded-full px-4 py-[5px] font-sans font-bold text-label uppercase tracking-badge transition-colors ${
                    on
                      ? "bg-primary text-white border border-primary"
                      : "bg-transparent border border-secondary text-text-secondary hover:bg-neutral-surface"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="px-5 mb-4">
            <div className="relative flex items-center border-b border-secondary">
              <span className="material-symbols-outlined text-text-muted" style={{ fontSize: 18 }}>search</span>
              {/* TODO(logic): filter orders by code / product name */}
              <input
                type="text"
                placeholder="Tìm theo mã đơn hoặc tên sản phẩm"
                aria-label="Tìm đơn hàng"
                className="flex-1 bg-transparent py-[11px] pl-2 font-sans text-body text-text-primary placeholder:text-text-muted outline-none"
              />
            </div>
          </div>

          {/* Order cards */}
          <div className="px-5 flex flex-col gap-4">
            {visible.length === 0 ? (
              <p className="text-center py-10 font-serif italic text-heading-sm text-text-muted">
                Không có đơn hàng nào.
              </p>
            ) : (
              visible.map((o) => {
                const item = o.items[0];
                return (
                  <div key={o.id} className="bg-neutral-surface border border-neutral-border rounded-[4px] p-4 flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-neutral-border pb-3">
                      <span className="font-sans text-body-sm text-text-muted">Mã đơn #{o.id}</span>
                      <span className="px-2 py-[3px] rounded-full font-sans font-bold text-label uppercase tracking-badge bg-accent-sage-light text-[#386A20]">
                        {o.statusLabel}
                      </span>
                    </div>

                    <div className="flex gap-4">
                      <div className="relative w-20 h-24 flex-none rounded-[2px] overflow-hidden bg-neutral-raised">
                        <Image src={item.imageUrl} alt={item.name} fill sizes="80px" style={{ objectFit: "cover" }} />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <h3 className="font-serif font-medium text-heading-md text-primary-deep leading-[1.2] m-0">
                          {item.name}
                        </h3>
                        {item.materials && (
                          <p className="font-sans text-body text-text-muted m-0">{item.materials}</p>
                        )}
                        <div className="flex items-center justify-between pt-1">
                          <span className="font-sans text-body text-text-secondary">x{item.qty}</span>
                          <span className="font-sans font-bold text-body-sm text-primary-deep">
                            {formatVND(item.price)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-end justify-between border-t border-neutral-border pt-3">
                      <div>
                        <p className="font-sans font-bold text-label uppercase tracking-badge text-text-muted m-0">
                          Tổng cộng
                        </p>
                        <p className="font-serif font-medium text-heading-md text-primary-deep leading-none m-0">
                          {formatVND(o.total)}
                        </p>
                      </div>
                      {/* TODO(logic): re-add these items to the cart */}
                      <button className="font-sans font-bold text-label uppercase tracking-badge underline text-text-secondary">
                        Mua lại
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
