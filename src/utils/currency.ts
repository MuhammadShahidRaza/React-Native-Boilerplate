/** Change currency label here only — whole app uses formatMoney(). */
export const APP_CURRENCY_CODE = 'CFA';

export function parseMoneyAmount(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  if (typeof raw === 'number') return Number.isFinite(raw) ? raw : null;
  const text = String(raw).trim();
  if (!text) return null;
  const n = parseFloat(text.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(n) ? null : n;
}

type FormatMoneyOptions = {
  /** Shown when amount is null/invalid (default: "CFA 0.00"). */
  empty?: string;
  /** Prefix minus for negative values (default: true). */
  signed?: boolean;
};

/** Standard app money display — always 2 decimal places, e.g. CFA 30.20 */
export function formatMoney(
  amount: number | string | null | undefined,
  options?: FormatMoneyOptions,
): string {
  const empty = options?.empty ?? `${APP_CURRENCY_CODE} 0.00`;
  const signed = options?.signed ?? true;

  if (typeof amount === 'string' && /^cfa/i.test(amount.trim())) {
    const parsed = parseMoneyAmount(amount);
    if (parsed != null) return formatMoney(parsed, options);
    return amount.trim();
  }

  const value = typeof amount === 'number' ? amount : parseMoneyAmount(amount);
  if (value == null) return empty;

  const prefix =
    signed && value < 0 ? `-${APP_CURRENCY_CODE} ` : `${APP_CURRENCY_CODE} `;
  const formatted = Math.abs(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${prefix}${formatted}`;
}

/** For estimate rows before API returns a value. */
export function formatMoneyOrDash(amount: number | null | undefined): string {
  if (amount == null) return '—';
  return formatMoney(amount);
}
