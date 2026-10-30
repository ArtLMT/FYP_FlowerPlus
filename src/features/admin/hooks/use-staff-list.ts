import { useState, type FormEvent } from "react";
import { asApiError, type FieldErrors } from "@/lib/api";
import { useResource } from "@/lib/hooks/use-resource";
import {
  createStaff,
  listStaff,
  resendStaffInvitation,
  toggleStaffStatus,
  type StaffAccount,
  type StaffForm,
  type StaffStatusFilter,
} from "@/lib/services/staff";

const PAGE_SIZE = 20;

const BLANK_FORM: StaffForm = { fullName: "", email: "" };

export type StaffListState = "loading" | "error" | "empty" | "ready";

type Feedback = { kind: "success" | "error"; text: string };

/**
 * Admin: Staff accounts. The status-filtered, paged list; the create dialog; and
 * deactivate/reactivate. After a change (or an unknown-account error) the list is re-read.
 */
export function useStaffList() {
  // List query
  const [pageNumber, setPageNumber] = useState(0);
  const [status, setStatus] = useState<StaffStatusFilter | "">("");
  const page = useResource(
    () => listStaff(pageNumber, PAGE_SIZE, status || undefined),
    `staff:${pageNumber}|${status}`,
  );

  // Dialog and actions
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(BLANK_FORM);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [actionStaffId, setActionStaffId] = useState("");
  const [resendingStaffId, setResendingStaffId] = useState("");

  const staff = page.data?.content ?? [];
  const totalPages = page.data?.totalPages ?? 0;
  /** The page actually shown (the service may have moved past a page that no longer exists). */
  const currentPage = page.data?.page ?? pageNumber;
  const state: StaffListState = page.loading ? "loading"
    : page.error ? "error"
      : staff.length === 0 ? "empty"
        : "ready";

  function openCreate() {
    setForm(BLANK_FORM);
    setFieldErrors({});
    setFeedback(null);
    setCreatorOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      const created = await createStaff(form);
      setCreatorOpen(false);
      // The email goes out in the background, so its delivery cannot be confirmed here.
      setFeedback({ kind: "success", text: `Đã tạo tài khoản cho ${created.email}. Email chứa mã thiết lập mật khẩu đang được gửi; nếu nhân viên không nhận được, hãy dùng “Gửi lại email thiết lập”.` });
      setPageNumber(0);
      page.reload();
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      setFieldErrors(error.fieldErrors);
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(person: StaffAccount) {
    setActionStaffId(person.id);
    setFeedback(null);
    try {
      const changed = await toggleStaffStatus(person);
      setFeedback({ kind: "success", text: changed.status === "BANNED" ? `Đã vô hiệu hóa ${changed.email}.` : `Đã kích hoạt lại ${changed.email}.` });
      page.reload();
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      if (error.is("USER_NOT_FOUND")) page.reload();
    } finally {
      setActionStaffId("");
    }
  }

  /** Sends the set-up email again, e.g. when the mail server was down at creation. */
  async function resendInvitation(person: StaffAccount) {
    setResendingStaffId(person.id);
    setFeedback(null);
    try {
      await resendStaffInvitation(person);
      setFeedback({ kind: "success", text: `Đang gửi lại email thiết lập mật khẩu tới ${person.email}. Mã mới có hiệu lực 24 giờ; mã cũ không còn dùng được.` });
    } catch (cause) {
      const error = asApiError(cause);
      setFeedback({ kind: "error", text: error.message });
      if (error.is("USER_NOT_FOUND", "STAFF_NOT_ACTIVE")) page.reload();
    } finally {
      setResendingStaffId("");
    }
  }

  return {
    // List
    staff,
    state,
    error: page.error?.message ?? "",
    pageNumber: currentPage,
    totalPages,
    totalElements: page.data?.totalElements ?? 0,
    showPagination: !page.loading && totalPages > 1,
    hasPrevious: currentPage > 0,
    hasNext: currentPage + 1 < totalPages,
    previous: () => setPageNumber(currentPage - 1),
    next: () => setPageNumber(currentPage + 1),
    // Filter: changing it starts again from the first page.
    status,
    setStatus: (value: StaffStatusFilter | "") => {
      setStatus(value);
      setPageNumber(0);
      setFeedback(null);
    },
    // Feedback and per-card actions
    feedback,
    actionStaffId,
    resendingStaffId,
    actionsDisabled: Boolean(actionStaffId || resendingStaffId || saving),
    changeStatus,
    resendInvitation,
    // Create dialog
    creatorOpen,
    form,
    updateForm: (patch: Partial<StaffForm>) => setForm((current) => ({ ...current, ...patch })),
    fieldErrors,
    saving,
    openCreate,
    closeCreator: () => setCreatorOpen(false),
    submit,
  };
}
