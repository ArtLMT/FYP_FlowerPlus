"use client";

import { useResource } from "@/lib/hooks/use-resource";
import { getDistricts, getProvinces, getWards } from "@/lib/services/shipping";
import type { AreaChoice } from "@/features/account/hooks/use-address-book";

const SELECT_CLASS = "rounded-lg border bg-white p-3 font-normal outline-none focus:border-primary disabled:bg-neutral-raised";

/**
 * Province → district → ward dropdowns from GHN's address system (through the backend). Each list
 * loads once its parent is chosen; changing a parent clears the choices below it.
 */
export default function AreaPicker({
  value,
  messages,
  disabled,
  onChange,
}: {
  value: AreaChoice;
  messages: Partial<Record<keyof AreaChoice, string[]>>;
  disabled?: boolean;
  onChange: (next: AreaChoice) => void;
}) {
  const provinces = useResource(getProvinces, "ghn-provinces");
  const districts = useResource(
    () => getDistricts(value.provinceId as number),
    value.provinceId === null ? null : `ghn-districts-${value.provinceId}`,
  );
  const wards = useResource(
    () => getWards(value.districtId as number),
    value.districtId === null ? null : `ghn-wards-${value.districtId}`,
  );
  const loadError = provinces.error ?? districts.error ?? wards.error;

  return (
    <div className="flex flex-col gap-3">
      <AreaSelect
        name="provinceId"
        label="Tỉnh/Thành phố"
        value={value.provinceId === null ? "" : String(value.provinceId)}
        options={(provinces.data ?? []).map((p) => ({ value: String(p.id), label: p.name }))}
        loading={provinces.loading}
        disabled={disabled}
        messages={messages.provinceId}
        onChange={(next) => onChange({ provinceId: next === "" ? null : Number(next), districtId: null, wardCode: null })}
      />
      <AreaSelect
        name="districtId"
        label="Quận/Huyện"
        value={value.districtId === null ? "" : String(value.districtId)}
        options={(value.provinceId === null ? [] : districts.data ?? []).map((d) => ({ value: String(d.id), label: d.name }))}
        loading={districts.loading}
        disabled={disabled || value.provinceId === null}
        messages={messages.districtId}
        onChange={(next) => onChange({ ...value, districtId: next === "" ? null : Number(next), wardCode: null })}
      />
      <AreaSelect
        name="wardCode"
        label="Phường/Xã"
        value={value.wardCode ?? ""}
        options={(value.districtId === null ? [] : wards.data ?? []).map((w) => ({ value: w.code, label: w.name }))}
        loading={wards.loading}
        disabled={disabled || value.districtId === null}
        messages={messages.wardCode}
        onChange={(next) => onChange({ ...value, wardCode: next === "" ? null : next })}
      />
      {loadError && (
        <p role="alert" className="text-sm font-normal text-red-700">
          {loadError.message}{" "}
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => { provinces.reload(); districts.reload(); wards.reload(); }}
          >
            Thử lại
          </button>
        </p>
      )}
    </div>
  );
}

function AreaSelect({
  name,
  label,
  value,
  options,
  loading,
  disabled,
  messages,
  onChange,
}: {
  name: keyof AreaChoice;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  loading: boolean;
  disabled?: boolean;
  messages?: string[];
  onChange: (value: string) => void;
}) {
  const invalid = Boolean(messages?.length);
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-text-secondary">
      {label}
      <select
        value={value}
        disabled={disabled}
        aria-invalid={invalid}
        aria-describedby={invalid ? `${name}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
        className={`${SELECT_CLASS} ${invalid ? "border-red-500" : "border-neutral-border"}`}
      >
        <option value="">{loading ? "Đang tải…" : `Chọn ${label.toLowerCase()}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {invalid && (
        <div id={`${name}-error`} className="text-sm font-normal text-red-700">
          {messages?.map((message) => <p key={message}>{message}</p>)}
        </div>
      )}
    </label>
  );
}
