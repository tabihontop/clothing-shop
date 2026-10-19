// Pure cart logic: no DOM, no storage. Easy to test.
// A stored cart is a list of { productId, size, qty }. Prices are never
// stored in the cart; they are always looked up from the product data.

import { effectivePrice } from './pricing.js';

export const MAX_QTY = 99;

export function lineKey(productId, size) {
  return `${productId}::${size}`;
}

export function findVariant(products, productId, size) {
  const product = products.find((p) => p.id === productId) || null;
  const variant = product ? product.sizes.find((s) => s.size === size) || null : null;
  return { product, variant };
}

/** Clean up whatever came out of localStorage: drop junk, merge duplicates. */
export function sanitizeItems(raw) {
  if (!Array.isArray(raw)) return [];
  const out = [];
  for (const it of raw) {
    if (!it || typeof it.productId !== 'string' || typeof it.size !== 'string') continue;
    const qty = Math.floor(Number(it.qty));
    if (!Number.isFinite(qty) || qty < 1) continue;
    const existing = out.find((o) => o.productId === it.productId && o.size === it.size);
    if (existing) existing.qty = Math.min(MAX_QTY, existing.qty + qty);
    else out.push({ productId: it.productId, size: it.size, qty: Math.min(MAX_QTY, qty) });
  }
  return out;
}

/**
 * Add qty of a variant, capped at stock.
 * Returns { items, added, reason } where reason is null | 'capped' |
 * 'max-stock' | 'sold-out' | 'not-found'.
 */
export function addItem(items, products, productId, size, qty = 1) {
  const { variant } = findVariant(products, productId, size);
  if (!variant) return { items, added: 0, reason: 'not-found' };
  if (variant.stock <= 0) return { items, added: 0, reason: 'sold-out' };
  const current = items.find((i) => i.productId === productId && i.size === size);
  const inCart = current ? current.qty : 0;
  const room = Math.min(variant.stock, MAX_QTY) - inCart;
  if (room <= 0) return { items, added: 0, reason: 'max-stock' };
  const added = Math.min(Math.max(1, Math.floor(qty)), room);
  const next = current
    ? items.map((i) => (i === current ? { ...i, qty: i.qty + added } : i))
    : [...items, { productId, size, qty: added }];
  return { items: next, added, reason: added < qty ? 'capped' : null };
}

/** Set an exact quantity (capped at stock). qty <= 0 removes the line. */
export function setQty(items, products, productId, size, qty) {
  const q = Math.floor(Number(qty));
  if (!Number.isFinite(q) || q <= 0) return removeItem(items, productId, size);
  const { variant } = findVariant(products, productId, size);
  const cap = variant ? Math.min(variant.stock, MAX_QTY) : 0;
  if (cap <= 0) return items; // sold out or gone: leave it for the user to remove
  return items.map((i) =>
    i.productId === productId && i.size === size ? { ...i, qty: Math.min(q, cap) } : i
  );
}

export function removeItem(items, productId, size) {
  return items.filter((i) => !(i.productId === productId && i.size === size));
}

/**
 * Match stored items against current product data.
 * - Items whose product or size no longer exists are dropped (with a notice).
 * - Quantities above current stock are reduced (with a notice).
 * - Sold-out sizes stay in the cart, flagged soldOut, and are excluded from totals.
 * Returns { lines, notices, items } where items is the cleaned list to store.
 */
export function resolveCart(rawItems, products) {
  const lines = [];
  const notices = [];
  const items = [];
  for (const item of sanitizeItems(rawItems)) {
    const { product, variant } = findVariant(products, item.productId, item.size);
    if (!product || !variant) {
      notices.push({
        type: 'removed',
        text: product
          ? `${product.name} (${product.colour.name}) in size ${item.size} is no longer available and was removed from your cart.`
          : 'An item in your cart is no longer available and was removed.',
      });
      continue;
    }
    const unitPrice = effectivePrice(product);
    const base = { key: lineKey(product.id, variant.size), product, variant, unitPrice };
    if (variant.stock <= 0) {
      lines.push({ ...base, qty: item.qty, lineTotal: 0, soldOut: true });
      items.push(item);
      continue;
    }
    let qty = item.qty;
    if (qty > variant.stock) {
      qty = variant.stock;
      notices.push({
        type: 'reduced',
        text: `Only ${variant.stock} left of ${product.name} (${product.colour.name}, ${variant.size}). We reduced the quantity in your cart.`,
      });
    }
    lines.push({ ...base, qty, lineTotal: unitPrice * qty, soldOut: false });
    items.push({ productId: item.productId, size: item.size, qty });
  }
  return { lines, notices, items };
}
