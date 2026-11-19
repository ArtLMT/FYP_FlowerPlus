"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Button from "@/components/ui/Button";
import { useResource } from "@/lib/hooks/use-resource";
import { getSalesReport, type SalesDay, type SalesReport, type TopProduct } from "@/lib/services/finance";
import { addDays, formatCalendarDate, formatVND, shopToday } from "@/lib/utils";

/**
 * Admin → Doanh thu (T-FIN-08): sales, material cost and profit for a date range.
 * Charts (Recharts): revenue, cost and profit by day on one money axis — grouped columns up to a month
 * (each day is its own total and most days have none), straight lines for longer ranges — and ranked
 * horizontal bars for the best sellers. Every chart has a table view, since colour alone is not enough.
 */

const INPUT = "min-h-11 rounded-lg border border-neutral-border bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-primary";
const CARD = "rounded-2xl border border-neutral-border bg-white p-4 shadow-sm sm:p-5";

/** Validated categorical slots 1–3 (blue, orange, aqua); aqua is below 3:1 on white, so the table view stays. */
const SERIES = {
  revenue: { label: "Doanh thu", color: "#2a78d6" },
  materialCost: { label: "Chi phí nguyên liệu", color: "#eb6834" },
  profit: { label: "Lợi nhuận", color: "#1baf7a" },
} as const;
const SERIES_KEYS = Object.keys(SERIES) as (keyof typeof SERIES)[];
/** Longest range drawn as grouped columns; past this the columns get too thin, so lines are used. */
const MAX_COLUMN_DAYS = 31;
const BAR_COLOR = "#2a78d6";
const GRID = "#E8D0C9";
const AXIS_TEXT = "#875A51";

const PRESETS = [
  { label: "7 ngày", days: 7 },
  { label: "30 ngày", days: 30 },
  { label: "90 ngày", days: 90 },
];

/** "1.250.000đ" for tiles and tables; "1,3tr" / "450k" on the axis, where space is short. */
function compactVND(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${(value / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}tr`;
  if (abs >= 1_000) return `${Math.round(value / 1_000)}k`;
  return String(value);
}

const shortDate = (iso: string) => formatCalendarDate(iso).slice(0, 5);

function Tile({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "loss" }) {
  return <div className={`${CARD} flex min-h-28 flex-col justify-between gap-2`}>
    <span className="text-sm font-bold text-text-primary">{label}</span>
    <span className={`font-serif text-3xl font-semibold ${tone === "loss" ? "text-red-800" : "text-text-primary"}`}>{value}</span>
    {hint && <span className="text-xs text-text-secondary">{hint}</span>}
  </div>;
}

function ViewToggle({ table, onChange }: { table: boolean; onChange: (table: boolean) => void }) {
  return <Button type="button" onClick={() => onChange(!table)} className="text-sm font-semibold text-primary-deep underline">
    {table ? "Xem dạng biểu đồ" : "Xem dạng bảng"}
  </Button>;
}

function MoneyTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm shadow-md">
    <p className="mb-1 font-semibold text-text-primary">{label && formatCalendarDate(label)}</p>
    {payload.map((item) => <p key={item.name} className="flex items-center gap-2 text-text-secondary">
      <span aria-hidden className="inline-block size-2.5 rounded-sm" style={{ backgroundColor: item.color }} />
      {item.name}: <span className="font-semibold text-text-primary">{formatVND(item.value)}</span>
    </p>)}
  </div>;
}

function DailyChart({ days }: { days: SalesDay[] }) {
  const [table, setTable] = useState(false);
  const columns = days.length <= MAX_COLUMN_DAYS;
  // Shared by both chart forms. Recharts reads these as direct children, so they are an array, not a component.
  const axes = [
    <CartesianGrid key="grid" stroke={GRID} vertical={false} />,
    <ReferenceLine key="zero" y={0} stroke={AXIS_TEXT} />,
    <XAxis key="x" dataKey="date" tickFormatter={shortDate} tick={{ fill: AXIS_TEXT, fontSize: 12 }} tickLine={false} axisLine={false} minTickGap={16} />,
    <YAxis key="y" tickFormatter={compactVND} tick={{ fill: AXIS_TEXT, fontSize: 12 }} tickLine={false} axisLine={false} width={56} />,
    <Tooltip key="tip" content={<MoneyTooltip />} cursor={{ fill: "#F9EEE9", stroke: AXIS_TEXT, strokeWidth: 0 }} wrapperStyle={{ zIndex: 10 }} />,
    <Legend key="legend" verticalAlign="top" align="left" iconType={columns ? "square" : "plainline"}
      itemSorter={(item) => SERIES_KEYS.indexOf(item.dataKey as keyof typeof SERIES)}
      wrapperStyle={{ fontSize: 13, color: "#6B4039", paddingBottom: 8 }} />,
  ];
  return <section className={CARD} aria-labelledby="finance-daily">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <h3 id="finance-daily" className="font-serif text-xl text-text-primary">Doanh thu, chi phí và lợi nhuận theo ngày</h3>
      <ViewToggle table={table} onChange={setTable} />
    </div>
    {table ? <div className="max-h-96 overflow-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="sticky top-0 border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted">
          <tr><th scope="col" className="px-3 py-2">Ngày</th><th scope="col" className="px-3 py-2 text-right">Đơn</th><th scope="col" className="px-3 py-2 text-right">Doanh thu</th><th scope="col" className="px-3 py-2 text-right">Chi phí NL</th><th scope="col" className="px-3 py-2 text-right">Lợi nhuận</th><th scope="col" className="px-3 py-2 text-right">Hao hụt</th></tr>
        </thead>
        <tbody>{days.map((day) => <tr key={day.date} className="border-b border-neutral-border/60">
          <td className="px-3 py-2">{formatCalendarDate(day.date)}</td>
          <td className="px-3 py-2 text-right">{day.orders}</td>
          <td className="px-3 py-2 text-right">{formatVND(day.revenue)}</td>
          <td className="px-3 py-2 text-right">{formatVND(day.materialCost)}</td>
          <td className={`px-3 py-2 text-right ${day.profit < 0 ? "text-red-800" : ""}`}>{formatVND(day.profit)}</td>
          <td className="px-3 py-2 text-right">{formatVND(day.expiryWaste)}</td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        {columns
          ? <BarChart data={days} margin={{ top: 8, right: 16, bottom: 0, left: 0 }} barGap={1} barCategoryGap="20%">
            {axes}
            {SERIES_KEYS.map((key) => <Bar key={key} dataKey={key} name={SERIES[key].label} fill={SERIES[key].color}
              maxBarSize={14} radius={[3, 3, 0, 0]} isAnimationActive={false} />)}
          </BarChart>
          : <LineChart data={days} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
            {axes}
            {SERIES_KEYS.map((key) => <Line key={key} type="linear" dataKey={key} name={SERIES[key].label}
              stroke={SERIES[key].color} strokeWidth={2} dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              isAnimationActive={false} />)}
          </LineChart>}
      </ResponsiveContainer>
    </div>}
  </section>;
}

function ProductTooltip({ active, payload }: { active?: boolean; payload?: { payload: TopProduct }[] }) {
  if (!active || !payload?.length) return null;
  const product = payload[0].payload;
  return <div className="rounded-lg border border-neutral-border bg-white px-3 py-2 text-sm shadow-md">
    <p className="mb-1 font-semibold text-text-primary">{product.name}</p>
    <p className="text-text-secondary">Đã bán: <span className="font-semibold text-text-primary">{product.units}</span></p>
    <p className="text-text-secondary">Doanh thu: <span className="font-semibold text-text-primary">{formatVND(product.value)}</span></p>
    <p className="text-text-secondary">Chi phí NL: <span className="font-semibold text-text-primary">{formatVND(product.materialCost)}</span></p>
    <p className="text-text-secondary">Lợi nhuận: <span className="font-semibold text-text-primary">{formatVND(product.profit)}</span></p>
  </div>;
}

function TopProducts({ products }: { products: TopProduct[] }) {
  const [table, setTable] = useState(false);
  return <section className={CARD} aria-labelledby="finance-top">
    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
      <h3 id="finance-top" className="font-serif text-xl text-text-primary">5 sản phẩm bán chạy</h3>
      <ViewToggle table={table} onChange={setTable} />
    </div>
    <p className="mb-3 text-xs text-text-secondary">Theo số lượng trên đơn hoàn thành. Doanh thu sau giảm giá sản phẩm, trước voucher.</p>
    {table ? <div className="overflow-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead className="border-b border-neutral-border bg-neutral-canvas text-xs uppercase tracking-wider text-text-muted">
          <tr><th scope="col" className="px-3 py-2">Sản phẩm</th><th scope="col" className="px-3 py-2 text-right">Đã bán</th><th scope="col" className="px-3 py-2 text-right">Doanh thu</th><th scope="col" className="px-3 py-2 text-right">Chi phí NL</th><th scope="col" className="px-3 py-2 text-right">Lợi nhuận</th></tr>
        </thead>
        <tbody>{products.map((product) => <tr key={product.productId ?? "custom"} className="border-b border-neutral-border/60">
          <td className="px-3 py-2">{product.name}</td>
          <td className="px-3 py-2 text-right">{product.units}</td>
          <td className="px-3 py-2 text-right">{formatVND(product.value)}</td>
          <td className="px-3 py-2 text-right">{formatVND(product.materialCost)}</td>
          <td className="px-3 py-2 text-right">{formatVND(product.profit)}</td>
        </tr>)}</tbody>
      </table>
    </div> : <div className="w-full" style={{ height: Math.max(120, products.length * 48 + 24) }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={products} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap={8}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis type="number" allowDecimals={false} tick={{ fill: AXIS_TEXT, fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" width={150} tick={{ fill: "#2E1A16", fontSize: 13 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ProductTooltip />} cursor={{ fill: "#F9EEE9" }} wrapperStyle={{ zIndex: 10 }} />
          <Bar dataKey="units" name="Đã bán" fill={BAR_COLOR} radius={[0, 4, 4, 0]} barSize={22} isAnimationActive={false}>
            <LabelList dataKey="units" position="right" style={{ fill: "#2E1A16", fontSize: 13, fontWeight: 600 }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>}
  </section>;
}

function ReportBody({ report }: { report: SalesReport }) {
  const t = report.totals;
  const empty = t.completedOrders === 0;
  return <div className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <Tile label="Doanh thu" value={formatVND(t.revenue)} hint="Đơn hoàn thành, không gồm phí giao" />
      <Tile label="Chi phí nguyên liệu" value={formatVND(t.materialCost)} hint="Theo giá nhập của từng lô đã dùng" />
      <Tile label="Lợi nhuận" value={formatVND(t.profit)} tone={t.profit < 0 ? "loss" : undefined}
        hint={t.margin === null ? "Chưa có doanh thu" : `Biên lợi nhuận ${t.margin.toLocaleString("vi-VN")}%`} />
      <Tile label="Đơn hoàn thành" value={String(t.completedOrders)}
        hint={`Giá trị TB ${formatVND(t.averageOrderValue)} · ${t.cancelledOrders} đơn đã hủy`} />
      <Tile label="Hao hụt do hết hạn" value={formatVND(t.expiryWaste)} hint="Hoa còn trong lô đã quá hạn dùng" />
      <Tile label="Lợi nhuận sau hao hụt" value={formatVND(t.profitAfterWaste)} tone={t.profitAfterWaste < 0 ? "loss" : undefined}
        hint="Lợi nhuận trừ hao hụt" />
    </div>
    <p className="rounded-lg bg-neutral-surface px-4 py-3 text-sm text-text-secondary">
      Phí giao đã thu (đơn GHN) {formatVND(t.shippingCollected)} − phí GHN {formatVND(t.ghnFeesPaid)} ={" "}
      <span className={`font-semibold ${t.shippingResult < 0 ? "text-red-800" : "text-text-primary"}`}>{formatVND(t.shippingResult)}</span>
      {" "}(đã tính vào lợi nhuận).
    </p>
    {empty
      ? <p className={`${CARD} text-text-secondary`}>Chưa có đơn hoàn thành trong khoảng này.</p>
      : <>
        <DailyChart days={report.byDay} />
        <TopProducts products={report.topProducts} />
      </>}
  </div>;
}

export default function FinanceReport() {
  const today = shopToday();
  const [from, setFrom] = useState(addDays(today, -29));
  const [to, setTo] = useState(today);
  const invalid = !from || !to || from > to;
  const report = useResource(() => getSalesReport(from, to), invalid ? null : `finance:${from}:${to}`);

  return <div className="space-y-4">
    <section className={`${CARD} flex flex-wrap items-end gap-3`} aria-label="Khoảng thời gian">
      <label className="flex flex-col gap-1 text-sm font-semibold text-text-primary">Từ ngày
        <input type="date" max={today} value={from} onChange={(event) => setFrom(event.target.value)} className={INPUT} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-text-primary">Đến ngày
        <input type="date" max={today} value={to} onChange={(event) => setTo(event.target.value)} className={INPUT} />
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const presetFrom = addDays(today, -(preset.days - 1));
          const selected = from === presetFrom && to === today;
          return <Button key={preset.days} type="button" aria-pressed={selected}
            onClick={() => { setFrom(presetFrom); setTo(today); }}
            className={`min-h-11 rounded-lg border px-3 text-sm font-semibold ${selected ? "border-primary-deep bg-primary-deep text-text-on-primary" : "border-neutral-border bg-white text-text-primary hover:border-primary-deep"}`}>
            {preset.label}
          </Button>;
        })}
      </div>
      <Button type="button" onClick={report.reload} disabled={invalid || report.loading}
        className="ml-auto min-h-11 rounded-lg border border-neutral-border bg-white px-3 text-sm font-semibold text-text-primary hover:border-primary-deep">
        {report.loading ? "Đang tải…" : "Làm mới"}
      </Button>
    </section>
    {invalid && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</p>}
    {report.error && !invalid && <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
      {report.error.message}{" "}
      <Button type="button" onClick={report.reload} className="font-semibold underline">Thử lại</Button>
    </p>}
    {report.data && !invalid && <div className={report.loading ? "opacity-60 transition-opacity" : undefined}><ReportBody report={report.data} /></div>}
    {!report.data && report.loading && <p className={`${CARD} text-text-secondary`}>Đang tải báo cáo…</p>}
  </div>;
}
