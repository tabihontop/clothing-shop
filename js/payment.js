// Stripe Payment Links helpers (pure, no DOM).
// A Payment Link is a hosted Stripe checkout page whose price is set in your
// Stripe Dashboard, so the browser cannot change what the customer is charged.

/**
 * Which Payment Link to use for a product + size.
 * A size-level link wins over the product-level link.
 * Returns { url, level: 'size' | 'product' } or null.
 */
export function paymentLinkFor(product, variant) {
  if (variant && variant.paymentLink) return { url: variant.paymentLink, level: 'size' };
  if (product && product.paymentLink) return { url: product.paymentLink, level: 'product' };
  return null;
}

/**
 * Add client_reference_id=<sku> so the size shows up on the payment in the
 * Stripe Dashboard. It is informational only: it cannot change the price.
 */
export function buildPaymentUrl(link, sku) {
  let url;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  if (url.protocol !== 'https:') return null;
  const ref = String(sku || '').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 200);
  if (ref) url.searchParams.set('client_reference_id', ref);
  return url.toString();
}

/** 'demo' when payments are not set up, otherwise 'links'. */
export function checkoutMode(lines, checkoutConfig) {
  if (checkoutConfig.mode === 'demo') return 'demo';
  const payable = lines.filter((l) => !l.soldOut);
  return payable.some((l) => paymentLinkFor(l.product, l.variant)) ? 'links' : 'demo';
}

/** localStorage key: the cart line last sent to Stripe (see thank-you.js). */
export const PENDING_PAYMENTS_KEY = 'pending-payments';
