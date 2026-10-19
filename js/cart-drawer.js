// Cart drawer: a native <dialog> (focus is trapped while open, Esc closes it).

import { config } from './config.js';
import { store } from './store.js';
import { esc, announce } from './dom.js';
import { formatMoney } from './money.js';
import { computeTotals } from './pricing.js';
import { productImages } from './images.js';
import { productUrl } from './components.js';

let dialog;
let opener = null;

export function totalsHtml(totals) {
  const shippingText = totals.itemCount === 0 ? '-' : totals.shipping === 0 ? 'Free' : formatMoney(totals.shipping);
  const progress =
    totals.itemCount > 0 && totals.freeShippingRemaining > 0
      ? `<p class="ship-note">Add ${formatMoney(totals.freeShippingRemaining)} more for free shipping.</p>`
      : totals.itemCount > 0
        ? '<p class="ship-note ship-note--ok">You get free shipping.</p>'
        : '';
  return `<dl class="totals">
      <div><dt>Subtotal</dt><dd>${formatMoney(totals.subtotal)}</dd></div>
      <div><dt>Shipping</dt><dd>${shippingText}</dd></div>
      <div class="totals__grand"><dt>Total</dt><dd>${formatMoney(totals.total)}</dd></div>
    </dl>
    ${progress}
    <p class="fine">${config.pricesIncludeVat ? 'Prices include VAT. ' : ''}Shipping: ${formatMoney(config.shipping.flatFee)}, free over ${formatMoney(config.shipping.freeThreshold)}.</p>`;
}

export function noticesHtml(notices) {
  if (!notices.length) return '';
  return `<div class="notice" role="status">${notices.map((n) => `<p>${esc(n.text)}</p>`).join('')}</div>`;
}

function lineHtml(line) {
  const { product, variant, qty, soldOut } = line;
  const [image] = productImages(product);
  const name = esc(product.name);
  const label = `${name}, ${esc(product.colour.name)}, size ${esc(variant.size)}`;
  const data = `data-id="${esc(product.id)}" data-size="${esc(variant.size)}"`;
  const maxed = qty >= variant.stock;
  const lowStock = !soldOut && variant.stock <= 3 ? `<p class="line__warn">Only ${variant.stock} left</p>` : '';
  return `<li class="line${soldOut ? ' line--soldout' : ''}">
    <img class="line__img" src="${esc(image.src)}" alt="" width="80" height="100" loading="lazy">
    <div class="line__info">
      <div class="line__top">
        <a class="line__name" href="${productUrl(product)}">${name}</a>
        <span class="line__price">${soldOut ? '' : formatMoney(line.lineTotal)}</span>
      </div>
      <p class="line__meta">${esc(product.colour.name)} / ${esc(variant.size)}${qty > 1 && !soldOut ? ` / ${formatMoney(line.unitPrice)} each` : ''}</p>
      ${soldOut ? '<p class="line__warn">Sold out. Remove this item to continue.</p>' : lowStock}
      <div class="line__actions">
        ${
          soldOut
            ? '<span></span>'
            : `<div class="qty" role="group" aria-label="Quantity for ${label}">
            <button type="button" data-action="dec" ${data} aria-label="Decrease quantity of ${label}" ${qty <= 1 ? 'disabled' : ''}>&minus;</button>
            <span class="qty__value">${qty}</span>
            <button type="button" data-action="inc" ${data} aria-label="Increase quantity of ${label}" ${maxed ? 'disabled' : ''}>+</button>
          </div>`
        }
        <button type="button" class="link-btn" data-action="remove" ${data} aria-label="Remove ${label}">Remove</button>
      </div>
    </div>
  </li>`;
}

function render() {
  if (!dialog) return;
  const body = dialog.querySelector('[data-body]');
  const foot = dialog.querySelector('[data-foot]');
  const { lines } = store.resolved();
  const notices = store.peekNotices();
  const totals = computeTotals(lines, config.shipping);

  // remember focus so re-rendering does not throw keyboard users out
  const active = document.activeElement;
  const focusKey = active && dialog.contains(active) && active.dataset.action
    ? { action: active.dataset.action, id: active.dataset.id, size: active.dataset.size }
    : null;

  if (!lines.length) {
    body.innerHTML = `${noticesHtml(notices)}<div class="empty"><p>Your cart is empty.</p><a class="btn btn--primary" href="shop.html">Shop all</a></div>`;
    foot.innerHTML = '';
  } else {
    body.innerHTML = `${noticesHtml(notices)}<ul class="lines">${lines.map(lineHtml).join('')}</ul>`;
    const blocked = lines.some((l) => l.soldOut);
    foot.innerHTML = `${totalsHtml(totals)}
      ${
        blocked
          ? '<p class="line__warn">Remove sold-out items to check out.</p><button class="btn btn--primary btn--block" type="button" disabled>Checkout</button>'
          : '<a class="btn btn--primary btn--block" href="checkout.html">Checkout</a>'
      }`;
  }

  if (focusKey) {
    const sel = `[data-action="${focusKey.action}"][data-id="${CSS.escape(focusKey.id)}"][data-size="${CSS.escape(focusKey.size)}"]`;
    let target = dialog.querySelector(sel);
    if (target && target.disabled) {
      const other = focusKey.action === 'inc' ? 'dec' : 'inc';
      target = dialog.querySelector(sel.replace(`"${focusKey.action}"`, `"${other}"`));
    }
    (target && !target.disabled ? target : dialog.querySelector('#cart-title')).focus();
  }
}

function onClick(e) {
  if (e.target === dialog) return close(); // click on the backdrop
  const btn = e.target.closest('button[data-action], [data-close]');
  if (!btn) return;
  if (btn.hasAttribute('data-close')) return close();
  const { action, id, size } = btn.dataset;
  const current = store.qtyOf(id, size);
  if (action === 'inc') {
    store.setQty(id, size, current + 1);
    announce(`Quantity ${store.qtyOf(id, size)}`);
  } else if (action === 'dec') {
    store.setQty(id, size, current - 1);
    announce(`Quantity ${store.qtyOf(id, size)}`);
  } else if (action === 'remove') {
    store.remove(id, size);
    announce('Item removed from cart');
  }
}

export function mountCartDrawer() {
  dialog = document.createElement('dialog');
  dialog.className = 'drawer';
  dialog.id = 'cart-drawer';
  dialog.setAttribute('aria-labelledby', 'cart-title');
  dialog.innerHTML = `<div class="drawer__panel">
      <div class="drawer__head">
        <h2 id="cart-title" class="drawer__title" tabindex="-1">Your cart</h2>
        <button type="button" class="icon-btn" data-close aria-label="Close cart">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>
        </button>
      </div>
      <div class="sr-only" role="status" aria-live="polite" data-status></div>
      <div class="drawer__body" data-body></div>
      <div class="drawer__foot" data-foot></div>
    </div>`;
  document.body.append(dialog);
  dialog.addEventListener('click', onClick);
  dialog.addEventListener('close', () => {
    store.takeNotices(); // notices were seen
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
  });
  store.subscribe(render);
  render();
}

export function openCart(trigger = document.activeElement) {
  if (!dialog) return;
  opener = trigger;
  render();
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('[data-close]').focus();
}

export function close() {
  if (dialog && dialog.open) dialog.close();
}
