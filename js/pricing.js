// Pure pricing logic. All amounts are integer cents.

export function isOnSale(product) {
  return Number.isInteger(product.salePrice) && product.salePrice < product.price;
}

/** The price the customer pays for one unit. */
export function effectivePrice(product) {
  return isOnSale(product) ? product.salePrice : product.price;
}

export function discountPercent(product) {
  if (!isOnSale(product)) return 0;
  return Math.round(((product.price - product.salePrice) * 100) / product.price);
}

/**
 * Shipping for a given subtotal.
 * rules = { flatFee, freeThreshold } (cents).
 */
export function shippingFor(subtotal, itemCount, rules) {
  if (itemCount <= 0) return 0;
  return subtotal >= rules.freeThreshold ? 0 : rules.flatFee;
}

/**
 * Totals for resolved cart lines (see cart.js resolveCart).
 * Sold-out lines are ignored.
 */
export function computeTotals(lines, rules) {
  let subtotal = 0;
  let itemCount = 0;
  for (const line of lines) {
    if (line.soldOut) continue;
    if (!Number.isInteger(line.unitPrice) || !Number.isInteger(line.qty)) {
      throw new TypeError('Cart line prices and quantities must be integers');
    }
    subtotal += line.unitPrice * line.qty;
    itemCount += line.qty;
  }
  const shipping = shippingFor(subtotal, itemCount, rules);
  return {
    subtotal,
    shipping,
    total: subtotal + shipping,
    itemCount,
    freeShippingRemaining: Math.max(0, rules.freeThreshold - subtotal),
  };
}
