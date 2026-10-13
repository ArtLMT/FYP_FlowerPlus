"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import { RequestError, errorText } from "@/lib/api";
import { listStaff, type AdminStaff } from "@/lib/services/admin";

function staffError(error: unknown) {
  if (error instanceof RequestError) {
    if (error.status === 401) return "Vui lòng đăng nhập để tiếp tục.";
    if (error.status === 403) return "Tài khoản của bạn không có quyền xem nội dung này.";
  }
  return errorText(error);
}

function Field({ label, value }: { label: string; value: string }) {
  return <p className="text-sm text-text-secondary"><span className="font-semibold text-text-primary">{label}: </span>{value}</p>;
}

function StaffCard({ person }: { person: AdminStaff }) {
  return <article className="rounded-xl border border-neutral-border bg-neutral-canvas p-5">
    <div className="mb-3 flex items-center justify-between gap-3"><h3 className="truncate font-serif text-xl font-semibold">{person.fullName || person.username}</h3><span className="rounded-full bg-neutral-raised px-3 py-1 text-xs font-bold text-text-secondary">{person.status}</span></div>
    <div className="space-y-2"><Field label="Email" value={person.email} /><Field label="Tên tài khoản" value={person.username} /></div>
  </article>;
}

export default function StaffManager() {
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listStaff(pageNumber)
      .then((page) => {
        if (!active) return;
        setStaff(page.content);
        setTotalPages(page.totalPages);
        setTotalElements(page.totalElements);
      })
      .catch((reason: unknown) => { if (active) setError(staffError(reason)); })
      .finally(() => { if (active) setLoadedPage(pageNumber); });
    return () => { active = false; };
  }, [pageNumber]);

  return <section className="rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-6">
    <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
      <div><h2 className="font-serif text-xl font-semibold text-text-primary">Staff accounts</h2><p className="mt-1 text-sm text-text-muted">{totalElements} accounts · page {pageNumber + 1} of {Math.max(1, totalPages)}</p></div>
      <span className="text-sm text-text-muted">{staff.length} shown</span>
    </div>
    {loadedPage !== pageNumber ? <p className="py-8 text-center text-sm text-text-muted">Loading staff…</p>
      : error ? <p role="alert" className="py-5 text-sm text-primary-deep">{error}</p>
        : staff.length === 0 ? <p className="py-8 text-center text-sm text-text-muted">Chưa có nhân sự.</p>
          : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{staff.map((person) => <StaffCard key={person.id} person={person} />)}</div>}
    {loadedPage === pageNumber && totalPages > 1 && <div className="mt-6 flex justify-between border-t border-neutral-border pt-5">
      <Button type="button" disabled={pageNumber === 0} onClick={() => setPageNumber((current) => current - 1)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Previous</Button>
      <Button type="button" disabled={pageNumber + 1 >= totalPages} onClick={() => setPageNumber((current) => current + 1)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Next</Button>
    </div>}
  </section>;
}
