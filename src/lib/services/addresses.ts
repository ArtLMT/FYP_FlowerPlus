import { api } from "@/lib/api";

export interface AccountAddress {
  id: string;
  receiverName: string;
  phone: string;
  address: string;
  isDefault: boolean;
}

export type AddressInput = Omit<AccountAddress, "id">;

interface Page<T> { content: T[] }

export const getAddresses = async () => (await api<Page<AccountAddress>>("/api/addresses")).content;
export const createAddress = (input: AddressInput) =>
  api<AccountAddress>("/api/addresses", { method: "POST", body: JSON.stringify(input) });
export const updateAddress = (id: string, input: AddressInput) =>
  api<AccountAddress>(`/api/addresses/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
export const deleteAddress = (id: string) =>
  api<void>(`/api/addresses/${encodeURIComponent(id)}`, { method: "DELETE" });
export const setDefaultAddress = (id: string) =>
  api<AccountAddress>(`/api/addresses/${encodeURIComponent(id)}/default`, { method: "PUT" });
