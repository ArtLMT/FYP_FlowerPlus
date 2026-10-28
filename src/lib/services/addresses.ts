import {
  api,
  groupFieldErrors,
  path,
  SIGN_IN_MESSAGE,
  VIEW_DENIED_MESSAGE,
  type ErrorMessages,
  type Page,
  type ValidationFieldError,
} from "@/lib/api";

/** The signed-in customer's address book, plus the Admin lookup of any saved address. */

export interface AccountAddress {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export type AddressInput = Omit<AccountAddress, "id">;

export interface AdminAddress extends AccountAddress {
  createdAt: string;
  updatedAt: string;
}

export const MAX_ADDRESSES = 20;

const FIELD_LABELS: Record<string, string> = {
  receiverName: "Tên người nhận",
  phone: "Số điện thoại",
  address: "Địa chỉ",
};

function fieldMessage(field: ValidationFieldError) {
  const label = FIELD_LABELS[field.field] ?? "Thông tin";
  if (field.rule === "NotBlank") return `${label} là bắt buộc.`;
  if (field.rule === "Pattern") return `${label} không đúng định dạng.`;
  if (field.rule === "Size") return `${label} vượt quá độ dài cho phép.`;
  return `${label} chưa hợp lệ.`;
}

/** A blank field only reports that it is required, not that it is also too short or malformed. */
function addressFieldErrors(fields: ValidationFieldError[]) {
  const isBlank = (name: string) => fields.some((field) => field.field === name && field.rule === "NotBlank");
  const shown = fields.filter((field) => field.rule === "NotBlank" || !isBlank(field.field));
  return groupFieldErrors(shown, fieldMessage);
}

const saveErrors: ErrorMessages = { fields: addressFieldErrors };

const lookupErrors: ErrorMessages = {
  status: { 401: SIGN_IN_MESSAGE, 403: VIEW_DENIED_MESSAGE },
  codes: { ADDRESS_NOT_FOUND: "Không tìm thấy địa chỉ với mã này." },
};

export const getAddresses = async () =>
  (await api<Page<AccountAddress>>("/api/addresses")).content;

/** Creates the address, or updates it when `id` is given. Text fields are trimmed. */
export function saveAddress(id: string | null, form: AddressInput) {
  const body: AddressInput = {
    ...form,
    receiverName: form.receiverName.trim(),
    phone: form.phone.trim(),
    address: form.address.trim(),
  };
  return id
    ? api<AccountAddress>(path`/api/addresses/${id}`, { method: "PUT", body, errors: saveErrors })
    : api<AccountAddress>("/api/addresses", { method: "POST", body, errors: saveErrors });
}

export const deleteAddress = (id: string) =>
  api<void>(path`/api/addresses/${id}`, { method: "DELETE" });

export const setDefaultAddress = (id: string) =>
  api<AccountAddress>(path`/api/addresses/${id}/default`, { method: "PUT" });

export const lookupAddress = (id: string) =>
  api<AdminAddress>(path`/api/admin/addresses/${id.trim()}`, { errors: lookupErrors });
