"use client";

import { useState } from "react";
import DetailHeader from "@/features/account/components/DetailHeader";
import { user, addresses as seedAddresses } from "@/lib/mock-data";

/**
 * Account Info — /account/info
 *
 * User + address book from the central mock. Gender selection, "Xóa" (remove)
 * and "Đặt mặc định" (set default) mutate local state.
 *
 * TODO(api): load + persist. TODO(logic): Show / Edit / Add-address.
 */

const INFO_ROWS = [
  { label: "Tên đăng nhập", value: user.username, masked: false },
  { label: "Họ và tên", value: user.fullName, masked: false },
  { label: "Email", value: user.email, masked: true },
  { label: "Số điện thoại", value: user.phone, masked: true },
];

const GENDERS = [
  { key: "female", label: "Nữ" },
  { key: "male", label: "Nam" },
  { key: "other", label: "Khác" },
];

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-sans font-bold text-body-sm tracking-badge text-text-muted m-0">{children}</p>
);

export default function AccountInfoPage() {
  const [gender, setGender] = useState<string>(user.gender);
  const [addresses, setAddresses] = useState(seedAddresses);

  const removeAddress = (id: string) => setAddresses((prev) => prev.filter((a) => a.id !== id));
  const setDefault = (id: string) =>
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));

  return (
    <div className="min-h-dvh flex flex-col bg-neutral-canvas md:min-h-0 md:block md:bg-transparent">
      <DetailHeader title="Thông tin tài khoản" />

      <div className="flex-1 overflow-y-auto no-scrollbar px-[22px] pb-8 md:flex-none md:overflow-visible md:px-0 md:pb-0">
        <div className="mt-6 mb-0">
          <SectionLabel>THÔNG TIN NGƯỜI DÙNG</SectionLabel>
        </div>

        {/* Info rows */}
        {INFO_ROWS.map(({ label, value, masked }) => (
          <div key={label} className="flex items-center gap-[14px] py-[18px] border-t border-neutral-border">
            <span className="font-sans text-body-lg text-text-primary">{label}</span>
            <span className="flex-1 text-right font-sans text-body-lg text-text-secondary">{value}</span>
            {masked && (
              <button className="font-sans text-body text-text-muted hover:text-text-primary transition-colors">
                Hiện
              </button>
            )}
            <button className="font-sans text-body text-primary underline hover:no-underline">Sửa</button>
          </div>
        ))}

        {/* Gender */}
        <div className="pt-[18px] border-t border-neutral-border">
          <p className="font-sans text-body-lg text-text-primary mb-[14px] m-0">Giới tính</p>
          <div className="flex gap-[10px]">
            {GENDERS.map(({ key, label }) => {
              const on = key === gender;
              return (
                <button
                  key={key}
                  onClick={() => setGender(key)}
                  aria-pressed={on}
                  className={`rounded-[9px] py-3 px-6 font-sans text-body-lg transition-colors ${
                    on
                      ? "border border-secondary bg-tertiary text-text-primary font-bold"
                      : "border-none bg-transparent text-text-secondary hover:bg-neutral-surface"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Date of birth — from mock */}
        <div className="flex items-center gap-[14px] py-5 mt-[18px] border-t border-neutral-border">
          <span className="font-sans text-body-lg text-text-primary">Ngày sinh</span>
          <div className="flex-1 flex items-center justify-end gap-2">
            <span className="w-14 text-center border border-neutral-border rounded-lg py-[11px] font-sans text-body-lg">
              {user.dob.day}
            </span>
            <span className="text-text-muted">/</span>
            <span className="border border-neutral-border rounded-lg py-[11px] px-4 font-sans text-body-lg">
              {user.dob.month}
            </span>
            <span className="text-text-muted">/</span>
            <span className="w-16 text-center border border-neutral-border rounded-lg py-[11px] font-sans text-body-lg">
              {user.dob.year}
            </span>
          </div>
        </div>

        {/* Address book */}
        <div className="mt-[18px] mb-4">
          <SectionLabel>SỔ ĐỊA CHỈ</SectionLabel>
        </div>
        <div className="flex flex-col gap-[18px]">
          {addresses.map((a) => (
            <div key={a.id} className="bg-neutral-raised border border-neutral-border rounded-2xl p-[22px]">
              <div className="flex items-center justify-between mb-4">
                <span className="font-serif font-medium text-heading-md text-text-primary">{a.name}</span>
                {a.isDefault && (
                  <span className="px-3 py-[5px] rounded-[7px] font-sans font-bold text-label tracking-badge bg-tertiary text-primary">
                    MẶC ĐỊNH
                  </span>
                )}
              </div>
              <p className="font-sans text-body-lg leading-[1.6] text-text-secondary m-0">
                {a.line1}
                <br />
                {a.line2}
              </p>
              <div className="flex items-center gap-3 mt-[14px] font-sans text-body-lg text-text-secondary">
                SĐT: {a.phone}
                <button className="font-sans text-body text-text-muted underline hover:no-underline">Hiện</button>
              </div>
              <div className="h-px bg-neutral-border my-5" />
              <div className="flex items-center gap-4">
                <button className="font-sans text-body text-primary">Sửa</button>
                <span className="text-neutral-border">|</span>
                <button
                  onClick={() => removeAddress(a.id)}
                  className="font-sans text-body text-text-secondary hover:text-primary transition-colors"
                >
                  Xóa
                </button>
                {!a.isDefault && (
                  <button
                    onClick={() => setDefault(a.id)}
                    className="ml-auto font-sans text-body text-primary underline hover:no-underline"
                  >
                    Đặt mặc định
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add address */}
        {/* TODO(logic): open an add-address form */}
        <button className="flex items-center justify-center gap-3 w-full mt-7 bg-primary text-text-on-primary border-none rounded-xl py-[18px] font-sans font-bold text-body-sm tracking-button hover:bg-primary-hover transition-colors">
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>add</span>
          THÊM ĐỊA CHỈ MỚI
        </button>
      </div>
    </div>
  );
}
