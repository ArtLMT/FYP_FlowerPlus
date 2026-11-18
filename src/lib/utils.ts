/** Format a number as Vietnamese Dong, e.g. 690000 → "690.000đ" */
export const formatVND = (price: number): string =>
  price.toLocaleString("vi-VN") + "đ";

/** A wait in Vietnamese, e.g. 75 → "1 phút 15 giây", 9 → "9 giây". */
export function formatWait(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes > 0) return `${minutes} phút ${String(remainingSeconds).padStart(2, "0")} giây`;
  return `${remainingSeconds} giây`;
}

/** A date-only ISO string as shown to customers: "2026-10-14" → "14/10/2026". */
export function formatCalendarDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * The shop's wall clock is a fixed UTC+7, the same as the server's `ShopTime`. Shifting the instant
 * and reading it as UTC avoids region names such as Asia/Saigon vs Asia/Ho_Chi_Minh.
 */
const SHOP_OFFSET_MS = 7 * 60 * 60 * 1000;

const toShopClock = (instant: Date) => new Date(instant.getTime() + SHOP_OFFSET_MS);

/** Convert a datetime-local form value as shop wall time, independent of the browser timezone. */
export function shopWallTimeToInstant(value: string): string {
  return new Date(`${value}:00+07:00`).toISOString();
}

export function instantToShopWallTime(instant: string): string {
  return toShopClock(new Date(instant)).toISOString().slice(0, 16);
}

/** Voucher expiresAt is the exclusive next midnight; show the preceding shop date. */
export function voucherLastValidShopDate(expiresAt: string): string {
  return addDays(toShopClock(new Date(expiresAt)).toISOString().slice(0, 10), -1);
}

/** Today in shop time as YYYY-MM-DD — the server's "today" for delivery dates and batch dates alike. */
export function shopToday(): string {
  return toShopClock(new Date()).toISOString().slice(0, 10);
}

/** The shop's current time of day, in minutes after midnight. */
export function shopMinutesNow(): number {
  const clock = toShopClock(new Date());
  return clock.getUTCHours() * 60 + clock.getUTCMinutes();
}

/** A YYYY-MM-DD date plus whole days, e.g. tomorrow. */
export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** An instant as shop date and time, e.g. "14/10/2026 09:30". */
export function formatShopDateTime(instant: string): string {
  const clock = toShopClock(new Date(instant));
  const time = clock.toISOString().slice(11, 16);
  return `${formatCalendarDate(clock.toISOString().slice(0, 10))} ${time}`;
}
