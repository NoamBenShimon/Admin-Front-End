/**
 * @fileoverview Shared formatting helpers
 *
 * Motzklist is a Kiryat Motzkin (Israel) product, so money is shown in ILS (₪).
 */

const ilsFormatter = new Intl.NumberFormat("he-IL", {
  style: "currency",
  currency: "ILS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as Israeli new shekels, e.g. `53.5` -> ` 53.50 ₪`. */
export function formatCurrency(amount: number): string {
  return ilsFormatter.format(Number.isFinite(amount) ? amount : 0);
}

/**
 * Format an amount in an arbitrary ISO currency (e.g. Stripe balances, which
 * may be in USD). Falls back to the ILS formatter for unknown/invalid codes.
 */
export function formatMoney(amount: number, currency: string): string {
  const value = Number.isFinite(amount) ? amount : 0;
  try {
    return new Intl.NumberFormat("he-IL", {
      style: "currency",
      currency: (currency || "ILS").toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return formatCurrency(value);
  }
}

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Format an ISO date string as `08 Jun 2026`. */
export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateFormatter.format(date);
}

/** Format an ISO date string as `08 Jun 2026, 14:05`. */
export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? iso : dateTimeFormatter.format(date);
}
