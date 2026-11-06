"use client";

import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import QuantityStepper, { UNITS, type Material } from "@/features/custom-order/QuantityStepper";
import { asApiError, type ApiError } from "@/lib/api";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { getCustomOrderMaterials, type CustomMaterialSort } from "@/lib/services/custom-orders";
import type { MaterialType } from "@/lib/services/materials";
import { formatVND } from "@/lib/utils";

const PAGE_SIZE = 12;

const CONTROL = "h-11 rounded-lg border-[1.5px] border-text-muted/70 bg-white font-sans text-[16px] text-text-primary outline-none focus:border-primary-deep";

/** Lets "hoa hong" find "Hoa hồng" in the picked list, as the server search does for the catalog. */
function searchable(text: string) {
  return text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "").replace(/đ/g, "d");
}

const SORTS: Record<CustomMaterialSort, (a: Material, b: Material) => number> = {
  NAME: (a, b) => a.name.localeCompare(b.name, "vi"),
  PRICE_ASC: (a, b) => a.sellingPrice - b.sellingPrice,
  PRICE_DESC: (a, b) => b.sellingPrice - a.sellingPrice,
};

/** The pages loaded so far for one search; `key` says which search they belong to. */
interface Loaded {
  key: string;
  items: Material[];
  total: number;
  pages: number;
  error: ApiError | null;
}

function appendNew(items: Material[], more: Material[]) {
  const seen = new Set(items.map((item) => item.id));
  return [...items, ...more.filter((item) => !seen.has(item.id))];
}

/**
 * Finds materials of one type in a catalog that may hold hundreds: the server searches, sorts and sends
 * 12 at a time, and "Xem thêm" appends the next 12 (T-ORD-15). "Đã chọn" lists the picks kept by the form,
 * so picked lines survive any search. Small catalogs skip the search tools because everything fits on screen.
 */
export default function MaterialPicker({ label, type, emptyMessage, refresh = 0, quantities, picks, onSet, onChange, onSettle }: {
  label: string;
  type: MaterialType;
  /** Shown when the shop has no Active material of this type. */
  emptyMessage: string;
  /** Change it to load the results again, e.g. after the server refused a stopped material. */
  refresh?: number;
  quantities: Record<string, string>;
  picks: Record<string, Material>;
  onSet: (material: Material, value: string) => void;
  onChange: (material: Material, change: number) => void;
  onSettle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CustomMaterialSort>("NAME");
  const [onlyPicked, setOnlyPicked] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [moreError, setMoreError] = useState<string | null>(null);
  // The results scroll inside a box of fixed height; this says whether anything is hidden below it.
  const listRef = useRef<HTMLDivElement>(null);
  const [moreBelow, setMoreBelow] = useState(false);

  const search = useDebouncedValue(query.trim(), 250);
  const key = `${type}|${search}|${sort}|${refresh}|${attempt}`;

  useEffect(() => {
    let current = true;
    getCustomOrderMaterials({ type, search, sort, page: 0, size: PAGE_SIZE }).then(
      (page) => {
        if (current) setLoaded({ key, items: page.content, total: page.totalElements, pages: 1, error: null });
      },
      (cause: unknown) => {
        if (current) setLoaded({ key, items: [], total: 0, pages: 0, error: asApiError(cause) });
      },
    );
    return () => {
      current = false;
    };
  }, [key, type, search, sort]);

  async function loadMore() {
    if (!loaded || loaded.key !== key || loadingMore) return;
    setLoadingMore(true);
    setMoreError(null);
    try {
      const page = await getCustomOrderMaterials({ type, search, sort, page: loaded.pages, size: PAGE_SIZE });
      setLoaded((previous) => previous && previous.key === key
        ? { ...previous, items: appendNew(previous.items, page.content), total: page.totalElements, pages: previous.pages + 1 }
        : previous);
    } catch (cause) {
      setMoreError(asApiError(cause).message);
    } finally {
      setLoadingMore(false);
    }
  }

  // While a new search loads, the previous results stay on screen so the list does not flash empty.
  const loading = loaded?.key !== key;
  const isPicked = (material: Material) => quantities[material.id] !== undefined;
  const pickedHere = Object.values(picks).filter((material) => material.type === type && isPicked(material));
  const typed = searchable(query).split(/\s+/).filter(Boolean);
  // Each typed word must start a word in the name, so "hong" finds "Hồng đỏ" but not "Phong lan".
  const matchesQuery = (material: Material) => {
    const nameWords = searchable(material.name).split(/\s+/);
    return typed.every((word) => nameWords.some((nameWord) => nameWord.startsWith(word)));
  };

  const visible = onlyPicked
    ? pickedHere.filter(matchesQuery).sort(SORTS[sort])
    : loaded?.items ?? [];
  const total = onlyPicked ? visible.length : loaded?.total ?? 0;
  const remaining = onlyPicked ? 0 : total - visible.length;
  const searching = query.trim() !== "" || sort !== "NAME";
  const catalogEmpty = !onlyPicked && !loading && !searching && loaded?.error === null && total === 0;

  /** Pixels of results still hidden below the box. */
  function hiddenBelow() {
    const box = listRef.current;
    return box ? box.scrollHeight - box.scrollTop - box.clientHeight : 0;
  }

  // Re-measure whenever the results change size: new page, new search, a card growing a stepper.
  useEffect(() => {
    const box = listRef.current;
    if (!box) return;
    const observer = new ResizeObserver(() => setMoreBelow(box.scrollHeight - box.scrollTop - box.clientHeight > 8));
    observer.observe(box);
    if (box.firstElementChild) observer.observe(box.firstElementChild);
    return () => observer.disconnect();
  }, [visible.length, onlyPicked, loaded?.error]);

  function onListScroll() {
    const below = hiddenBelow();
    setMoreBelow(below > 8);
    // Near the end of what is loaded: fetch the next 12 without making the user find the button.
    if (below < 160 && remaining > 0 && !loading) void loadMore();
  }

  function scrollDown() {
    const box = listRef.current;
    box?.scrollBy({ top: box.clientHeight * 0.8, behavior: "smooth" });
  }

  if (!loaded) return <p className="m-0 py-4 font-sans text-body-sm text-text-secondary">Đang tải {label}...</p>;
  if (catalogEmpty) return <p className="m-0 font-sans text-body-sm text-text-secondary">{emptyMessage}</p>;

  return <div aria-busy={loading}>
    {(searching || loaded.total > PAGE_SIZE) && <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <div className="relative min-w-0 flex-1">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[20px] text-text-secondary" aria-hidden="true">search</span>
        <input
          type="search"
          aria-label={`Tìm ${label}`}
          placeholder={`Tìm ${label}...`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className={`${CONTROL} w-full pl-10 pr-3`}
        />
      </div>
      <select aria-label="Sắp xếp" value={sort} onChange={(event) => setSort(event.target.value as CustomMaterialSort)} className={`${CONTROL} px-3 sm:w-44`}>
        <option value="NAME">Tên A–Z</option>
        <option value="PRICE_ASC">Giá thấp đến cao</option>
        <option value="PRICE_DESC">Giá cao đến thấp</option>
      </select>
    </div>}

    {(searching || loaded.total > PAGE_SIZE || pickedHere.length > 0 || onlyPicked) && <div className="mb-3 flex items-center justify-between gap-3">
      <p className="m-0 font-sans text-body-sm text-text-secondary" aria-live="polite">
        {loading && !onlyPicked ? "Đang tìm..." : `Hiển thị ${visible.length} / ${total} loại`}
      </p>
      <Button
        type="button"
        aria-pressed={onlyPicked}
        disabled={pickedHere.length === 0 && !onlyPicked}
        onClick={() => setOnlyPicked(!onlyPicked)}
        className={`flex-shrink-0 rounded-full border-[1.5px] px-3 py-1.5 font-sans text-body-sm font-bold ${onlyPicked ? "border-primary-deep bg-primary-deep text-white" : "border-primary-deep bg-white text-primary-deep"}`}
      >
        Đã chọn ({pickedHere.length})
      </Button>
    </div>}

    {!onlyPicked && loaded.error
      ? <p role="alert" className="m-0 rounded-xl border border-dashed border-text-muted/70 p-6 text-center font-sans text-body text-text-secondary">
        {loaded.error.message}{" "}
        <Button type="button" onClick={() => setAttempt(attempt + 1)} className="font-bold text-primary-deep underline">Thử lại</Button>
      </p>
      : visible.length === 0
        ? !loading && <p className="m-0 rounded-xl border border-dashed border-text-muted/70 p-6 text-center font-sans text-body text-text-secondary">
          Không tìm thấy loại nào phù hợp.{" "}
          <Button type="button" onClick={() => { setQuery(""); setOnlyPicked(false); }} className="font-bold text-primary-deep underline">Xem tất cả</Button>
        </p>
        : <div className="relative">
        <div
          ref={listRef}
          onScroll={onListScroll}
          className="max-h-[23rem] overflow-y-auto rounded-xl border border-neutral-border bg-neutral-canvas/40 p-2 [scrollbar-color:var(--color-primary-deep)_transparent] [scrollbar-width:thin] md:max-h-[28rem]"
        >
        <ul className={`m-0 grid list-none grid-cols-2 gap-2.5 p-0 md:grid-cols-3 ${loading && !onlyPicked ? "opacity-60" : ""}`}>
          {visible.map((material) => {
            const picked = isPicked(material);
            return <li key={material.id} className={`flex min-w-0 flex-col justify-between gap-3 rounded-xl border-[1.5px] p-3 ${picked ? "border-primary-deep bg-neutral-surface" : "border-neutral-border bg-white"}`}>
              <div className="min-w-0">
                <p title={material.name} className="m-0 line-clamp-2 break-words font-sans text-[15px] font-bold leading-snug text-text-primary">{material.name}</p>
                <p className="m-0 mt-1 font-sans text-body-sm text-text-secondary">{formatVND(material.sellingPrice)} / {UNITS[material.unitOfMeasure]}</p>
              </div>
              {picked
                ? <QuantityStepper material={material} value={quantities[material.id]} onSet={onSet} onChange={onChange} onSettle={onSettle} />
                : <Button type="button" aria-label={`Chọn ${material.name}`} onClick={() => onChange(material, 1)} className="flex h-[43px] w-full items-center justify-center gap-1 rounded-lg border-[1.5px] border-text-muted/70 bg-white font-sans text-body-sm font-bold text-primary-deep hover:border-primary-deep hover:bg-neutral-surface">
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">add</span> Chọn
                </Button>}
            </li>;
          })}
        </ul>
        {moreError && <p role="alert" className="m-0 mt-3 font-sans text-body-sm text-red-800">{moreError}</p>}
        {remaining > 0 && !loading && <Button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="mt-3 w-full rounded-lg border-[1.5px] border-primary-deep bg-white py-3 font-sans text-body-sm font-bold text-primary-deep hover:bg-neutral-surface disabled:opacity-60">
          {loadingMore ? "Đang tải..." : `Xem thêm (còn ${remaining} loại)`}
        </Button>}
        </div>
        {/* A fade and a button over the bottom edge, so a phone user (no visible scrollbar) sees there is more. */}
        {moreBelow && <div className="pointer-events-none absolute inset-x-px bottom-px flex h-20 items-end justify-center rounded-b-xl bg-gradient-to-t from-white via-white/80 to-transparent pb-2">
          <Button type="button" onClick={scrollDown} className="pointer-events-auto flex items-center gap-1 rounded-full bg-primary-deep px-4 py-1.5 font-sans text-body-sm font-bold text-white shadow-md">
            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">expand_more</span>
            Cuộn để xem thêm
          </Button>
        </div>}
      </div>}
  </div>;
}
