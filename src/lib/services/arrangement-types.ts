import { api, groupFieldErrors, path, type ErrorMessages, type ValidationFieldError } from "@/lib/api";

/** Staff/Admin list of arrangement forms (Bó tròn, Hộp, Giỏ kính…) with a fixed labour fee each (BR-CUS-11). */

export type ArrangementTypeStatus = "ACTIVE" | "INACTIVE";

export interface ArrangementType {
  id: string;
  name: string;
  labourFee: number;
  status: ArrangementTypeStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
}

function fieldMessage({ field, rule }: ValidationFieldError) {
  if (field === "name" && rule === "NotBlank") return "Tên kiểu cắm là bắt buộc.";
  if (field === "name" && rule === "Size") return "Tên kiểu cắm tối đa 100 ký tự.";
  if (field === "labourFee") return "Phí công phải là số nguyên VND từ 0 trở lên.";
  return "Thông tin chưa hợp lệ.";
}

const CONFLICT = "Kiểu cắm đã được thay đổi ở nơi khác. Danh sách đã được làm mới; hãy xem lại rồi thử lại.";

const errors: ErrorMessages = {
  codes: {
    ARRANGEMENT_TYPE_NAME_EXISTS: "Tên kiểu cắm này đã được sử dụng.",
    ARRANGEMENT_TYPE_NOT_FOUND: "Kiểu cắm không còn tồn tại. Danh sách đã được làm mới.",
    CONCURRENT_MODIFICATION: CONFLICT,
  },
  fields: (fields) => groupFieldErrors(fields, fieldMessage),
};

export const listArrangementTypes = () =>
  api<ArrangementType[]>("/api/manage/arrangement-types", { errors: { fallback: "Không thể tải kiểu cắm." } });

/** Creates a type, or edits `existing` (with its version, so concurrent edits are caught). */
export function saveArrangementType(existing: ArrangementType | null, name: string, labourFee: number) {
  const body = { name: name.trim(), labourFee };
  return existing
    ? api<ArrangementType>(path`/api/manage/arrangement-types/${existing.id}`, {
      method: "PUT",
      body: { ...body, version: existing.version },
      errors,
    })
    : api<ArrangementType>("/api/manage/arrangement-types", { method: "POST", body, errors });
}

export const setArrangementTypeActive = (type: ArrangementType, active: boolean) =>
  api<ArrangementType>(
    active ? path`/api/manage/arrangement-types/${type.id}/reactivate` : path`/api/manage/arrangement-types/${type.id}/deactivate`,
    { method: "POST", body: { version: type.version }, errors },
  );
