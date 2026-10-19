// Thank-you page. Set each Stripe Payment Link's "after payment" redirect to
// this page. Reaching it is NOT proof of payment (anyone can open the URL):
// orders are confirmed in your Stripe Dashboard / by Stripe's email receipt.
// This page only tidies up the visitor's local cart.

import { initLayout } from '../layout.js';
import { store } from '../store.js';
import { formatMoney } from '../money.js';
import { esc, $, announce } from '../dom.js';

import { PENDING_PAYMENTS_KEY as PENDING_KEY } from '../payment.js';

initLayout({ title: 'Thank you', description: 'Thanks for your order.', noindex: true });

const root = $('[data-thanks]');

const PENDING_MAX_AGE = 3 * 60 * 60 * 1000; // 3 hours

function readPending() {
  try {
    const p = JSON.parse(localStorage.getItem(PENDING_KEY) || 'null');
    localStorage.removeItem(PENDING_KEY);
    return p && typeof p.key === 'string' && Date.now() - p.at < PENDING_MAX_AGE ? p.key : null;
  } catch {
    return null;
  }
}

// The checkout page remembers the last item sent to Stripe; Stripe only
// redirects here after a successful payment, so take that item out of the cart.
const pending = readPending();
let removedText = '';
if (pending) {
  const line = store.resolved().lines.find((l) => l.key === pending);
  if (line) {
    store.remove(line.product.id, line.variant.size);
    removedText = `We removed ${line.product.name} (${line.variant.size}) from your cart.`;
    announce(removedText);
  }
}

function render() {
  const { lines } = store.resolved();
  root.querySelector('[data-removed]').textContent = removedText;
  const rest = root.querySelector('[data-rest]');
  if (!lines.length) {
    rest.innerHTML = '<a class="btn btn--primary" href="shop.html">Continue shopping</a>';
    return;
  }
  rest.innerHTML = `<h2 class="h-small">Still in your cart</h2>
    <p>Already paid for some of these? Remove them so you do not pay twice.</p>
    <ul class="simple-list">${lines
      .map(
        (l) => `<li><span>${esc(l.product.name)} (${esc(l.product.colour.name)}, ${esc(l.variant.size)}) &times; ${l.qty}${l.soldOut ? '' : ` &middot; ${formatMoney(l.lineTotal)}`}</span>
        <button type="button" class="link-btn" data-remove data-id="${esc(l.product.id)}" data-size="${esc(l.variant.size)}">Remove</button></li>`
      )
      .join('')}</ul>
    <div class="btn-row"><a class="btn btn--primary" href="checkout.html">Pay for remaining items</a><a class="btn" href="shop.html">Continue shopping</a></div>`;
}

root.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-remove]');
  if (!btn) return;
  store.remove(btn.dataset.id, btn.dataset.size);
  announce('Item removed from cart');
  const heading = root.querySelector('h1');
  if (heading) heading.focus();
});

store.subscribe(render);
render();
