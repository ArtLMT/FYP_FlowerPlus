import {
  api,
  groupFieldErrors,
  path,
  SIGN_IN_MESSAGE,
  VIEW_DENIED_MESSAGE,
  withQuery,
  type ErrorMessages,
  type Page,
  type ValidationFieldError,
} from "@/lib/api";
import type { AccountUser } from "@/lib/services/auth";
import { formatWait } from "@/lib/utils";

/** Admin management of Staff accounts. Staff are ACTIVE, or BANNED once deactivated. */

export interface StaffAccount extends AccountUser {
  provider: string;
}

export type StaffStatusFilter = "ACTIVE" | "BANNED";

export interface StaffForm {
  fullName: string;
  email: string;
}

const FIELD_LABELS: Record<string, string> = {
  fullName: "Họ tên",
  email: "Email",
};

function fieldMessage({ field, rule }: ValidationFieldError) {
  const label = FIELD_LABELS[field] ?? "Thông tin";
  if (rule === "NotBlank") return `${label} là bắt buộc.`;
  if (field === "fullName" && rule === "Size") return `${label} phải có ít nhất 2 ký tự.`;
  if (field === "email" && rule === "Email") return "Email không đúng định dạng.";
  return `${label} chưa hợp lệ.`;
}

const ACCESS_ERRORS = { 401: SIGN_IN_MESSAGE, 403: VIEW_DENIED_MESSAGE };

const createErrors: ErrorMessages = {
  status: ACCESS_ERRORS,
  codes: { EMAIL_ALREADY_EXISTS: "Email này đã thuộc về một tài khoản khác." },
  fields: (fields) => groupFieldErrors(fields, fieldMessage),
};

const statusErrors: ErrorMessages = {
  status: ACCESS_ERRORS,
  codes: { USER_NOT_FOUND: "Không tìm thấy tài khoản nhân viên. Danh sách đã được làm mới." },
};

const fetchPage = (page: number, size: number, status?: StaffStatusFilter) =>
  api<Page<StaffAccount>>(withQuery("/api/admin/staff", { page, size, status }), {
    errors: { status: ACCESS_ERRORS },
  });

/** One page of Staff accounts. If that page no longer exists, the last page instead. */
export async function listStaff(page = 0, size = 20, status?: StaffStatusFilter): Promise<Page<StaffAccount>> {
  const result = await fetchPage(page, size, status);
  const lastPage = result.totalPages - 1;
  return result.totalPages > 0 && page > lastPage ? fetchPage(lastPage, size, status) : result;
}

/** Creates a Staff account. No password: the new Staff member sets one through the emailed code. */
export const createStaff = (form: StaffForm) =>
  api<StaffAccount>("/api/admin/staff", {
    method: "POST",
    body: { fullName: form.fullName.trim(), email: form.email.trim() },
    errors: createErrors,
  });

const resendErrors: ErrorMessages = {
  status: ACCESS_ERRORS,
  codes: {
    USER_NOT_FOUND: "Không tìm thấy tài khoản nhân viên. Danh sách đã được làm mới.",
    STAFF_NOT_ACTIVE: "Tài khoản này đã bị vô hiệu hóa. Hãy kích hoạt lại trước khi gửi email thiết lập.",
    OTP_THROTTLED: (error) => `Vừa có mã được gửi tới email này. Vui lòng thử lại sau ${formatWait(error.retryAfterSeconds || 60)}.`,
    OTP_DAILY_LIMIT_REACHED: "Email này đã nhận đủ số mã cho phép trong ngày. Vui lòng thử lại vào ngày mai.",
  },
};

/** Sends the set-up email again with a new 24-hour code (the earlier code stops working). */
export const resendStaffInvitation = (staff: StaffAccount) =>
  api<void>(path`/api/admin/staff/${staff.id}/invitation`, { method: "POST", errors: resendErrors });

/** Deactivates an active Staff account, or reactivates a deactivated one. */
export function toggleStaffStatus(staff: StaffAccount) {
  const action = staff.status === "BANNED" ? "reactivate" : "deactivate";
  return api<StaffAccount>(path`/api/admin/staff/${staff.id}/${action}`, { method: "PUT", errors: statusErrors });
}
