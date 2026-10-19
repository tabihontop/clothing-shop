// Browser cart store: keeps the cart in localStorage and tells the UI when it
// changes (also when it changes in another tab).

import { config } from './config.js';
import { products } from './data/products.js';
import * as cart from './cart.js';

const KEY = config.cartStorageKey;

function read() {
  try {
    return cart.sanitizeItems(JSON.parse(localStorage.getItem(KEY) || '[]'));
  } catch {
    return [];
  }
}

function write(items) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // storage full or blocked (private mode): the cart still works for this page view
  }
}

let items = read();
let notices = [];
const listeners = new Set();

// On page load, drop items that no longer exist and cap quantities at stock.
function reconcile() {
  const result = cart.resolveCart(items, products);
  if (result.notices.length) notices = [...notices, ...result.notices];
  if (JSON.stringify(result.items) !== JSON.stringify(items)) {
    items = result.items;
    write(items);
  }
}
reconcile();

function commit(next) {
  items = next;
  write(items);
  listeners.forEach((fn) => fn());
}

window.addEventListener('storage', (e) => {
  if (e.key !== KEY) return;
  items = read();
  reconcile();
  listeners.forEach((fn) => fn());
});

export const store = {
  get items() {
    return items;
  },
  /** { lines, notices, items } for rendering. */
  resolved() {
    return cart.resolveCart(items, products);
  },
  /** One-off notices from reconciling the stored cart (removed / reduced items). */
  takeNotices() {
    const out = notices;
    notices = [];
    return out;
  },
  peekNotices() {
    return notices;
  },
  count() {
    return cart.resolveCart(items, products).lines.reduce((n, l) => n + (l.soldOut ? 0 : l.qty), 0);
  },
  qtyOf(productId, size) {
    const it = items.find((i) => i.productId === productId && i.size === size);
    return it ? it.qty : 0;
  },
  add(productId, size, qty = 1) {
    const r = cart.addItem(items, products, productId, size, qty);
    if (r.added) commit(r.items);
    return r;
  },
  setQty(productId, size, qty) {
    commit(cart.setQty(items, products, productId, size, qty));
  },
  remove(productId, size) {
    commit(cart.removeItem(items, productId, size));
  },
  clear() {
    commit([]);
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
