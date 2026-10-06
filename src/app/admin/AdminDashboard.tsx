"use client";
import Button from "@/components/ui/Button";

import { useEffect, useState } from "react";
import { RequestError, errorText } from "@/lib/api";
import type { AccountUser } from "@/lib/services/auth";
import MaterialManager from "@/features/admin/MaterialManager";
import {
  getAdminAddress,
  listStaff,
  type AdminAddress,
  type AdminStaff,
} from "@/lib/services/admin";

type Domain = "users" | "materials" | "addresses";

const domainNames: Record<Domain, string> = {
  users: "Nhân sự",
  materials: "Nguyên liệu",
  addresses: "Địa chỉ",
};

function messageFor(error: unknown) {
  if (error instanceof RequestError) {
    if (error.status === 401) return "Vui lòng đăng nhập để tiếp tục.";
    if (error.status === 403) return "Tài khoản của bạn không có quyền xem nội dung này.";
    if (error.errorCode === "ADDRESS_NOT_FOUND") return "Không tìm thấy địa chỉ với mã này.";
  }
  return errorText(error);
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-neutral-border bg-white p-5 shadow-sm sm:p-7">
      {children}
    </section>
  );
}

function ItemCard({ children }: { children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-neutral-border bg-neutral-canvas p-5">
      {children}
    </article>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-text-secondary">
      <span className="font-semibold text-text-primary">{label}: </span>{value}
    </p>
  );
}

export default function AdminDashboard({
  user,
  initialError,
}: {
  user: AccountUser | null;
  initialError: string;
}) {
  const [domain, setDomain] = useState<Domain>(user?.role === "ADMIN" ? "users" : "materials");
  const [staff, setStaff] = useState<AdminStaff[]>([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [addressId, setAddressId] = useState("");
  const [address, setAddress] = useState<AdminAddress | null>(null);
  const [loadedDomain, setLoadedDomain] = useState<Domain | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    if (!user || user.role !== "ADMIN" || domain !== "users") return;
    let active = true;
    listStaff(pageNumber)
      .then((page) => {
        if (!active) return;
        setTotalPages(page.totalPages);
        setTotalElements(page.totalElements);
        setStaff(page.content);
      })
      .catch((reason: unknown) => { if (active) setError(messageFor(reason)); })
      .finally(() => { if (active) { setLoadedDomain(domain); setLoadedPage(pageNumber); } });
    return () => { active = false; };
  }, [domain, pageNumber, user]);

  async function lookupAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const id = addressId.trim();
    if (!id) return;
    setLookupLoading(true);
    setAddress(null);
    setLookupError("");
    try {
      setAddress(await getAdminAddress(id));
    } catch (reason) {
      setLookupError(messageFor(reason));
    } finally {
      setLookupLoading(false);
    }
  }

  const allowedDomains: Domain[] = user?.role === "ADMIN"
    ? ["users", "materials", "addresses"]
    : user?.role === "STAFF" ? ["materials"] : [];

  return (
    <main className="min-h-screen bg-neutral-canvas px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-7">
        <header className="flex flex-col gap-4 border-b border-neutral-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary-deep">FlowerPlus · Quản trị</p>
            <h1 className="font-serif text-4xl font-semibold text-text-primary">Bảng điều khiển</h1>
            <p className="mt-2 text-text-secondary">Xin chào{user?.fullName ? `, ${user.fullName}` : ""}.</p>
          </div>
          {user && <span className="w-fit rounded-full bg-neutral-raised px-4 py-2 text-xs font-bold uppercase tracking-wide text-text-secondary">{user.role}</span>}
        </header>

        {!user && (
          <Panel><p className="text-text-secondary">{error || "Không thể tải tài khoản."} <a className="font-semibold text-primary-deep underline" href="/login">Đăng nhập</a></p></Panel>
        )}
        {user && allowedDomains.length === 0 && (
          <Panel><h2 className="font-serif text-2xl text-text-primary">Không có quyền truy cập</h2><p className="mt-2 text-text-secondary">Trang này dành cho tài khoản Staff và Admin.</p></Panel>
        )}
        {user && allowedDomains.length > 0 && <>
          <nav aria-label="Chọn lĩnh vực" className="flex flex-wrap gap-3">
            {allowedDomains.map((item) => (
              <Button
                key={item}
                type="button"
                aria-pressed={domain === item}
                onClick={() => { setDomain(item); setPageNumber(0); setError(""); }}
                className={`rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${domain === item ? "border-primary bg-primary text-white" : "border-neutral-border bg-white text-text-secondary hover:border-primary hover:text-primary-deep"}`}
              >{domainNames[item]}</Button>
            ))}
          </nav>

          <Panel>
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-text-primary">{domainNames[domain]}</h2>
                <p className="mt-1 text-sm text-text-muted">Dữ liệu được tải từ FlowerPlus.</p>
              </div>
              {domain === "users" && <span className="text-sm text-text-muted">{staff.length} mục</span>}
              {domain === "users" && totalPages > 0 && <p className="mt-2 text-sm text-text-muted">{totalElements} mục · trang {pageNumber + 1}/{totalPages}</p>}
            </div>

            {domain === "addresses" ? <>
              <form onSubmit={lookupAddress} className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="address-id">Mã địa chỉ</label>
                <input id="address-id" value={addressId} onChange={(event) => setAddressId(event.target.value)} placeholder="Nhập mã địa chỉ (UUID)" className="min-w-0 flex-1 rounded-xl border border-neutral-border bg-white px-4 py-3 text-sm outline-none focus:border-primary" />
                <Button disabled={lookupLoading || !addressId.trim()} className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed">{lookupLoading ? "Đang tìm…" : "Tra cứu"}</Button>
              </form>
              {lookupError && <p role="alert" className="mt-4 text-sm text-primary-deep">{lookupError}</p>}
              {address && <div className="mt-5"><ItemCard>
                <div className="mb-3 flex flex-wrap items-center gap-2"><h3 className="font-serif text-xl font-semibold">{address.receiverName}</h3>{address.isDefault && <span className="rounded-full bg-accent-sage-light px-3 py-1 text-xs font-bold text-text-primary">Mặc định</span>}</div>
                <div className="space-y-2"><Field label="Điện thoại" value={address.phone} /><Field label="Địa chỉ" value={address.address} /><Field label="Mã" value={address.id} /></div>
              </ItemCard></div>}
            </> : domain === "materials" ? <MaterialManager />
              : loadedDomain !== domain || loadedPage !== pageNumber ? <p className="py-8 text-center text-sm text-text-muted">Đang tải dữ liệu…</p>
                : error ? <p role="alert" className="py-5 text-sm text-primary-deep">{error}</p>
                  : staff.length === 0 ? <p className="py-8 text-center text-sm text-text-muted">Chưa có nhân sự.</p> : <div className="grid gap-4 md:grid-cols-2">{staff.map((person) => <ItemCard key={person.id}>
                  <div className="mb-3 flex items-center justify-between gap-3"><h3 className="font-serif text-xl font-semibold">{person.fullName || person.username}</h3><span className="rounded-full bg-neutral-raised px-3 py-1 text-xs font-bold text-text-secondary">{person.status}</span></div>
                  <div className="space-y-2"><Field label="Email" value={person.email} /><Field label="Tên tài khoản" value={person.username} /></div>
                </ItemCard>)}</div>
                }
            {domain === "users" && loadedDomain === domain && loadedPage === pageNumber && totalPages > 1 && <div className="mt-6 flex justify-between border-t border-neutral-border pt-5">
              <Button type="button" disabled={pageNumber === 0} onClick={() => setPageNumber((page) => page - 1)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Trước</Button>
              <Button type="button" disabled={pageNumber + 1 >= totalPages} onClick={() => setPageNumber((page) => page + 1)} className="rounded-lg border border-neutral-border px-4 py-2 text-sm font-semibold text-text-secondary">Tiếp</Button>
            </div>}
          </Panel>
        </>}
      </div>
    </main>
  );
}
