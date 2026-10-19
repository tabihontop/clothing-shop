import { config } from './config.js';

const formatter = new Intl.NumberFormat(config.locale, {
  style: 'currency',
  currency: config.currency,
});

/** Format integer cents for display, e.g. 8900 -> "€89.00". */
export function formatMoney(cents) {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`Money must be integer cents, got ${cents}`);
  }
  return formatter.format(cents / 100);
}

/** Integer cents -> "89.00" without float maths (for structured data). */
export function centsToDecimalString(cents) {
  if (!Number.isInteger(cents)) {
    throw new TypeError(`Money must be integer cents, got ${cents}`);
  }
  const sign = cents < 0 ? '-' : '';
  const abs = Math.abs(cents);
  return `${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`;
}
