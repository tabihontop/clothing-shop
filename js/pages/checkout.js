// Checkout page.
// There is no server, so this page never takes payment itself:
// - demo mode: shows an order summary and says clearly that payments are not set up;
// - Payment Links mode: each item is paid on Stripe's hosted page, at the price
//   configured in the Stripe Dashboard (the browser cannot change it).

import { initLayout } from '../layout.js';
import { config } from '../config.js';
import { store } from '../store.js';
import { computeTotals } from '../pricing.js';
import { formatMoney } from '../money.js';
import { productImages } from '../images.js';
import { productUrl } from '../components.js';
import { paymentLinkFor, buildPaymentUrl, checkoutMode, PENDING_PAYMENTS_KEY as PENDING_KEY } from '../payment.js';
import { totalsHtml, noticesHtml } from '../cart-drawer.js';
import { esc, $ } from '../dom.js';


initLayout({ title: 'Checkout', description: 'Review your order.', noindex: true });

const root = $('[data-checkout]');

function summaryLine(line) {
  const { product, variant, qty, soldOut } = line;
  const [img] = productImages(product);
  return `<li class="line line--summary${soldOut ? ' line--soldout' : ''}">
    <img class="line__img" src="${esc(img.src)}" alt="" width="80" height="100" loading="lazy">
    <div class="line__info">
      <div class="line__top">
        <a class="line__name" href="${productUrl(product)}">${esc(product.name)}</a>
        <span class="line__price">${soldOut ? 'Sold out' : formatMoney(line.lineTotal)}</span>
      </div>
      <p class="line__meta">${esc(product.colour.name)} / ${esc(variant.size)} / Qty ${qty}</p>
    </div>
  </li>`;
}

// Remember which line was just sent to Stripe, so thank-you.html can take it
// out of the cart. Stripe opens in this same tab and redirects back.
function rememberPending(key) {
  try {
    localStorage.setItem(PENDING_KEY, JSON.stringify({ key, at: Date.now() }));
  } catch {
    /* storage blocked: thank-you page lets the customer remove items by hand */
  }
}

function payStep(line) {
  const { product, variant, qty } = line;
  const link = paymentLinkFor(product, variant);
  const name = `${esc(product.name)} (${esc(product.colour.name)}, ${esc(variant.size)})`;
  if (!link) {
    return `<li class="pay-step pay-step--off">
      <p class="pay-step__name">${name}</p>
      <p class="fine">Online payment is not available for this item yet. Email <a href="mailto:${esc(config.brand.email)}">${esc(config.brand.email)}</a> to order it.</p>
    </li>`;
  }
  const url = buildPaymentUrl(link.url, variant.sku);
  const hints = [];
  if (qty > 1) hints.push(`Set the quantity to <strong>${qty}</strong> on the Stripe page.`);
  if (link.level === 'product') hints.push(`Choose size <strong>${esc(variant.size)}</strong> on the Stripe page if asked.`);
  return `<li class="pay-step">
    <p class="pay-step__name">${name}${qty > 1 ? ` &times; ${qty}` : ''}</p>
    ${hints.length ? `<p class="fine">${hints.join(' ')}</p>` : ''}
    ${
      url
        ? `<a class="btn btn--primary btn--block" href="${esc(url)}" data-pay="${esc(line.key)}">Pay ${formatMoney(line.lineTotal)} on Stripe</a>`
        : '<p class="form-error">This item\'s payment link is invalid. Please contact us.</p>'
    }
  </li>`;
}

function render() {
  const { lines } = store.resolved();
  const notices = store.peekNotices();
  if (!lines.length) {
    root.innerHTML = `${noticesHtml(notices)}<div class="empty empty--page"><h1>Checkout</h1><p>Your cart is empty.</p><a class="btn btn--primary" href="shop.html">Shop all</a></div>`;
    return;
  }
  const totals = computeTotals(lines, config.shipping);
  const payable = lines.filter((l) => !l.soldOut);
  const soldOutLines = lines.filter((l) => l.soldOut);
  const mode = checkoutMode(lines, config.checkout);

  const summary = `<aside class="checkout__summary" aria-labelledby="summary-h">
      <h2 id="summary-h" class="h-small">Order summary</h2>
      <ul class="lines">${lines.map(summaryLine).join('')}</ul>
      ${totalsHtml(totals)}
      <button type="button" class="link-btn" data-open-cart>Edit cart</button>
    </aside>`;

  let main;
  if (soldOutLines.length) {
    main = `<div class="notice notice--warn" role="alert"><p>Some items in your cart are sold out. <button type="button" class="link-btn" data-open-cart>Open your cart</button> and remove them to continue.</p></div>`;
  } else if (mode === 'demo') {
    main = `<div class="demo-box">
        <p class="demo-box__tag">Demo mode</p>
        <h2>Payments are not set up yet</h2>
        <p>This shop is running in demo mode. <strong>No order will be placed and nothing will be charged.</strong> Your order summary is shown so you can check items, sizes, shipping and totals.</p>
        <p class="fine">Shop owner: add Stripe Payment Links to <code>js/data/products.js</code> to take real payments. See README.md, section "Stripe Payment Links".</p>
        <a class="btn" href="shop.html">Continue shopping</a>
      </div>`;
  } else {
    const multi = payable.length > 1;
    main = `<div class="pay-box">
        <h2>Pay securely with Stripe</h2>
        <p>Payment happens on Stripe's secure checkout page. We never see or store your card details.</p>
        ${
          multi
            ? `<p class="notice"><strong>Your cart has ${payable.length} different items.</strong> Each item is paid separately on Stripe, one payment per item. After each payment you come back here to pay for the next one. Stripe shows the final shipping and total for each payment.</p>`
            : '<p class="fine">Stripe shows the final shipping cost and total before you pay.</p>'
        }
        <ol class="pay-steps">${payable.map(payStep).join('')}</ol>
        <p class="fine">After paying you will receive a receipt from Stripe by email.</p>
      </div>`;
  }

  root.innerHTML = `${noticesHtml(notices)}<h1 class="page-title">Checkout</h1>
    <div class="checkout">
      <section class="checkout__main" aria-label="Payment">${main}</section>
      ${summary}
    </div>`;
}

root.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-pay]');
  if (a) rememberPending(a.dataset.pay);
});

store.subscribe(render);
render();
