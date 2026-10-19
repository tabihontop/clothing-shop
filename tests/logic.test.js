// Logic tests for pricing, cart, catalog and payment helpers.
// Run in Node:     node tests/logic.test.js     (Node 18+)
// Or in a browser: serve the folder and open /tests/

import { products, categories, sizeGuides } from '../js/data/products.js';
import { config } from '../js/config.js';
import { formatMoney, centsToDecimalString } from '../js/money.js';
import { effectivePrice, isOnSale, discountPercent, computeTotals, shippingFor } from '../js/pricing.js';
import { addItem, setQty, removeItem, resolveCart, sanitizeItems, lineKey } from '../js/cart.js';
import { filterAndSort, parseShopParams, shopParamsToSearch, validateCatalog, isSoldOut } from '../js/catalog.js';
import { paymentLinkFor, buildPaymentUrl, checkoutMode } from '../js/payment.js';

const results = [];
function test(name, fn) {
  try {
    fn();
    results.push({ name, ok: true });
  } catch (err) {
    results.push({ name, ok: false, error: err && err.message ? err.message : String(err) });
  }
}
function eq(actual, expected, msg = '') {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${msg} expected ${e}, got ${a}`);
}
function ok(cond, msg) {
  if (!cond) throw new Error(msg || 'assertion failed');
}

// ---- fixtures (independent of the real catalog) ----------------------------
const RULES = { flatFee: 495, freeThreshold: 10000 };
const fx = [
  { id: 'a', name: 'A', colour: { name: 'Black', hex: '#000000' }, category: 'tees', price: 3900, salePrice: null, createdAt: '2026-01-01', images: [], sizes: [
    { size: 'S', sku: 'A-S', stock: 2, paymentLink: '' },
    { size: 'M', sku: 'A-M', stock: 0, paymentLink: '' },
  ] },
  { id: 'b', name: 'B', colour: { name: 'Red', hex: '#ff0000' }, category: 'hoodies', price: 9500, salePrice: 7600, createdAt: '2026-03-01', images: [], paymentLink: 'https://buy.stripe.com/test_product', sizes: [
    { size: 'L', sku: 'B-L', stock: 5, paymentLink: 'https://buy.stripe.com/test_size' },
    { size: 'XL', sku: 'B-XL', stock: 5, paymentLink: '' },
  ] },
  { id: 'c', name: 'C', colour: { name: 'Blue', hex: '#0000ff' }, category: 'tees', price: 2900, salePrice: null, createdAt: '2026-02-01', images: [], sizes: [
    { size: 'One size', sku: 'C-OS', stock: 0, paymentLink: '' },
  ] },
];

// ---- money -----------------------------------------------------------------
test('formatMoney uses EUR and the configured locale', () => {
  eq(config.currency, 'EUR');
  eq(formatMoney(8900), '€89.00');
  eq(formatMoney(495), '€4.95');
  eq(formatMoney(0), '€0.00');
  eq(formatMoney(123456), '€1,234.56');
});
test('formatMoney rejects non-integer cents', () => {
  let threw = false;
  try { formatMoney(89.5); } catch { threw = true; }
  ok(threw, 'should throw on floats');
});
test('centsToDecimalString is exact', () => {
  eq(centsToDecimalString(8900), '89.00');
  eq(centsToDecimalString(7605), '76.05');
  eq(centsToDecimalString(5), '0.05');
});

// ---- pricing ---------------------------------------------------------------
test('sale price is used when lower than price', () => {
  eq(isOnSale(fx[1]), true);
  eq(effectivePrice(fx[1]), 7600);
  eq(effectivePrice(fx[0]), 3900);
  eq(discountPercent(fx[1]), 20);
});
test('shipping: flat fee below threshold, free at/above, zero for empty cart', () => {
  eq(shippingFor(9999, 1, RULES), 495);
  eq(shippingFor(10000, 1, RULES), 0);
  eq(shippingFor(0, 0, RULES), 0);
});
test('totals for a mixed cart below free-shipping threshold', () => {
  let items = [];
  items = addItem(items, fx, 'a', 'S', 2).items; // 2 x 3900
  const { lines } = resolveCart(items, fx);
  const t = computeTotals(lines, RULES);
  eq(t, { subtotal: 7800, shipping: 495, total: 8295, itemCount: 2, freeShippingRemaining: 2200 });
});
test('totals at free-shipping threshold and with sale price', () => {
  let items = [];
  items = addItem(items, fx, 'b', 'L', 1).items; // 7600
  items = addItem(items, fx, 'a', 'S', 1).items; // 3900
  const t = computeTotals(resolveCart(items, fx).lines, RULES);
  eq(t.subtotal, 11500);
  eq(t.shipping, 0);
  eq(t.total, 11500);
  eq(t.freeShippingRemaining, 0);
});
test('sold-out lines are excluded from totals', () => {
  const items = [{ productId: 'c', size: 'One size', qty: 1 }, { productId: 'a', size: 'S', qty: 1 }];
  const r = resolveCart(items, fx);
  eq(r.lines.length, 2);
  eq(r.lines[0].soldOut, true);
  const t = computeTotals(r.lines, RULES);
  eq(t.subtotal, 3900);
  eq(t.itemCount, 1);
});

// ---- cart ------------------------------------------------------------------
test('addItem caps at stock and reports why', () => {
  let r = addItem([], fx, 'a', 'S', 5);
  eq(r.added, 2);
  eq(r.reason, 'capped');
  r = addItem(r.items, fx, 'a', 'S', 1);
  eq(r.added, 0);
  eq(r.reason, 'max-stock');
  eq(addItem([], fx, 'a', 'M', 1).reason, 'sold-out');
  eq(addItem([], fx, 'nope', 'S', 1).reason, 'not-found');
});
test('adding the same variant twice merges into one line', () => {
  let items = addItem([], fx, 'b', 'L', 1).items;
  items = addItem(items, fx, 'b', 'L', 2).items;
  eq(items, [{ productId: 'b', size: 'L', qty: 3 }]);
});
test('setQty caps at stock, 0 removes', () => {
  let items = addItem([], fx, 'b', 'L', 1).items;
  items = setQty(items, fx, 'b', 'L', 99);
  eq(items[0].qty, 5);
  items = setQty(items, fx, 'b', 'L', 0);
  eq(items, []);
});
test('removeItem removes only that variant', () => {
  let items = addItem([], fx, 'b', 'L', 1).items;
  items = addItem(items, fx, 'b', 'XL', 1).items;
  items = removeItem(items, 'b', 'L');
  eq(items, [{ productId: 'b', size: 'XL', qty: 1 }]);
});
test('resolveCart drops missing products/sizes and reduces over-stock quantities', () => {
  const stored = [
    { productId: 'deleted', size: 'M', qty: 1 },
    { productId: 'a', size: 'XXL', qty: 1 },
    { productId: 'a', size: 'S', qty: 7 },
  ];
  const r = resolveCart(stored, fx);
  eq(r.items, [{ productId: 'a', size: 'S', qty: 2 }]);
  eq(r.notices.map((n) => n.type), ['removed', 'removed', 'reduced']);
  eq(r.lines[0].lineTotal, 7800);
});
test('sanitizeItems ignores junk from localStorage', () => {
  eq(sanitizeItems(null), []);
  eq(sanitizeItems('x'), []);
  eq(sanitizeItems([{ productId: 'a', size: 'S', qty: '2' }, { productId: 'a', size: 'S', qty: 1 }, { qty: 3 }, { productId: 'b', size: 'L', qty: -1 }]), [
    { productId: 'a', size: 'S', qty: 3 },
  ]);
});
test('cart never stores prices', () => {
  const items = addItem([], fx, 'b', 'L', 1).items;
  ok(!('price' in items[0]) && !('unitPrice' in items[0]), 'items must not contain prices');
});

// ---- catalog ---------------------------------------------------------------
test('filter by category and sort by price/newest', () => {
  eq(filterAndSort(fx, { category: 'tees', sort: 'price-asc' }).map((p) => p.id), ['c', 'a']);
  eq(filterAndSort(fx, { category: 'all', sort: 'price-desc' }).map((p) => p.id), ['b', 'a', 'c']);
  eq(filterAndSort(fx, { category: 'all', sort: 'newest' }).map((p) => p.id), ['b', 'c', 'a']);
  ok(isSoldOut(fx[2]) && !isSoldOut(fx[0]));
});
test('shop URL params: parse, validate, serialise', () => {
  eq(parseShopParams('?category=hoodies&sort=price-asc', categories), { category: 'hoodies', sort: 'price-asc' });
  eq(parseShopParams('?category=<script>&sort=bogus', categories), { category: 'all', sort: 'featured' });
  eq(shopParamsToSearch({ category: 'all', sort: 'featured' }), '');
  eq(shopParamsToSearch({ category: 'tees', sort: 'newest' }), '?category=tees&sort=newest');
});

// ---- payment links ---------------------------------------------------------
test('size-level payment link wins over product-level link', () => {
  eq(paymentLinkFor(fx[1], fx[1].sizes[0]), { url: 'https://buy.stripe.com/test_size', level: 'size' });
  eq(paymentLinkFor(fx[1], fx[1].sizes[1]), { url: 'https://buy.stripe.com/test_product', level: 'product' });
  eq(paymentLinkFor(fx[0], fx[0].sizes[0]), null);
});
test('buildPaymentUrl adds a safe client_reference_id and rejects non-https', () => {
  eq(buildPaymentUrl('https://buy.stripe.com/test_abc', 'KRB-HHD-BLK-M'), 'https://buy.stripe.com/test_abc?client_reference_id=KRB-HHD-BLK-M');
  eq(buildPaymentUrl('https://buy.stripe.com/test_abc', 'a b&c'), 'https://buy.stripe.com/test_abc?client_reference_id=abc');
  eq(buildPaymentUrl('http://buy.stripe.com/x', 'S'), null);
  eq(buildPaymentUrl('javascript:alert(1)', 'S'), null);
});
test('checkout mode is demo when no item has a link', () => {
  const noLinks = resolveCart([{ productId: 'a', size: 'S', qty: 1 }], fx).lines;
  const withLink = resolveCart([{ productId: 'b', size: 'L', qty: 1 }], fx).lines;
  eq(checkoutMode(noLinks, { mode: 'auto' }), 'demo');
  eq(checkoutMode(withLink, { mode: 'auto' }), 'links');
  eq(checkoutMode(withLink, { mode: 'demo' }), 'demo');
});

// ---- real catalog ----------------------------------------------------------
test('real product data passes validation', () => {
  const errors = validateCatalog(products, categories, sizeGuides);
  eq(errors, [], 'validation errors:');
  ok(products.length >= 10 && products.length <= 12, 'expected 10-12 products');
});
test('real catalog: a full cart total is computed in integer cents', () => {
  let items = [];
  items = addItem(items, products, 'heavyweight-hoodie-black', 'M', 1).items; // 8900
  items = addItem(items, products, 'zip-hoodie-olive', 'S', 1).items; // sale 7600
  items = addItem(items, products, 'ribbed-beanie-rust', 'One size', 5).items; // capped at 3 x 2900
  const r = resolveCart(items, products);
  const t = computeTotals(r.lines, config.shipping);
  eq(r.lines.find((l) => l.key === lineKey('ribbed-beanie-rust', 'One size')).qty, 3);
  eq(t.subtotal, 8900 + 7600 + 3 * 2900);
  eq(t.shipping, 0);
  eq(t.total, 25200);
  let small = addItem([], products, 'boxy-tee-white', 'M', 1).items;
  eq(computeTotals(resolveCart(small, products).lines, config.shipping), {
    subtotal: 3900, shipping: config.shipping.flatFee, total: 3900 + config.shipping.flatFee, itemCount: 1, freeShippingRemaining: 6100,
  });
});

// ---- report ----------------------------------------------------------------
const failed = results.filter((r) => !r.ok);
const summary = `${results.length - failed.length}/${results.length} tests passed`;
for (const r of results) {
  console[r.ok ? 'log' : 'error'](`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : `\n      ${r.error}`}`);
}
console.log(summary);

if (typeof document !== 'undefined') {
  const out = document.getElementById('results');
  if (out) {
    out.innerHTML = `<p class="${failed.length ? 'bad' : 'good'}" data-summary>${summary}</p><ul>${results
      .map((r) => `<li class="${r.ok ? 'good' : 'bad'}">${r.ok ? 'PASS' : 'FAIL'} ${r.name}${r.ok ? '' : ` <code>${String(r.error).replace(/</g, '&lt;')}</code>`}</li>`)
      .join('')}</ul>`;
  }
  globalThis.__testResults = { passed: results.length - failed.length, failed: failed.length, results };
} else if (typeof process !== 'undefined' && failed.length) {
  process.exitCode = 1;
}
