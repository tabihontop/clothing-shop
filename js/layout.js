// Shared page chrome: header, footer, cart drawer, page meta and config slots.
// Every page script calls initLayout() first.

import { config } from './config.js';
import { categories, products, sizeGuides } from './data/products.js';
import { validateCatalog } from './catalog.js';
import { store } from './store.js';
import { esc, $, $$ } from './dom.js';
import { formatMoney } from './money.js';
import { setPageMeta } from './seo.js';
import { mountCartDrawer, openCart } from './cart-drawer.js';

const ICON_BAG = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 8h12l-1 12H7L6 8z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 8V6a3 3 0 0 1 6 0v2" fill="none" stroke="currentColor" stroke-width="2"/></svg>`;
const ICON_MENU = `<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>`;

function headerHtml(active) {
  const link = (href, label, key) =>
    `<li><a href="${href}"${active === key ? ' aria-current="page"' : ''}>${esc(label)}</a></li>`;
  return `<div class="announce"><p>Free ${esc(config.shipping.region)} shipping over ${formatMoney(config.shipping.freeThreshold)} &middot; ${config.returnsDays}-day returns</p></div>
  <header class="site-header">
    <div class="container header__row">
      <button type="button" class="icon-btn menu-toggle" aria-expanded="false" aria-controls="site-nav">
        ${ICON_MENU}<span class="sr-only">Menu</span>
      </button>
      <a class="logo" href="index.html">${esc(config.brand.name)}</a>
      <nav id="site-nav" class="site-nav" aria-label="Main">
        <ul>
          ${link('shop.html', 'Shop all', 'all')}
          ${categories.map((c) => link(`shop.html?category=${encodeURIComponent(c.id)}`, c.label, c.id)).join('')}
        </ul>
      </nav>
      <button type="button" class="cart-btn" data-open-cart aria-haspopup="dialog">
        ${ICON_BAG}<span class="cart-btn__label">Cart</span><span class="cart-count" data-cart-count>0</span>
      </button>
    </div>
  </header>`;
}

function footerHtml() {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <p class="logo logo--footer">${esc(config.brand.name)}</p>
        <p>${esc(config.brand.description)}</p>
      </div>
      <nav aria-label="Shop categories">
        <h2 class="footer__h">Shop</h2>
        <ul>
          <li><a href="shop.html">Shop all</a></li>
          ${categories.map((c) => `<li><a href="shop.html?category=${encodeURIComponent(c.id)}">${esc(c.label)}</a></li>`).join('')}
        </ul>
      </nav>
      <nav aria-label="Help and policies">
        <h2 class="footer__h">Help</h2>
        <ul>
          <li><a href="shipping.html">Shipping</a></li>
          <li><a href="returns.html">Returns</a></li>
          <li><a href="privacy.html">Privacy</a></li>
          <li><a href="terms.html">Terms</a></li>
        </ul>
      </nav>
      <div>
        <h2 class="footer__h">Contact</h2>
        <p><a href="mailto:${esc(config.brand.email)}">${esc(config.brand.email)}</a></p>
      </div>
    </div>
    <div class="container footer__base">
      <p>&copy; ${year} ${esc(config.brand.name)}. Prices in ${esc(config.currency)}${config.pricesIncludeVat ? ' incl. VAT' : ''}.</p>
    </div>
  </footer>`;
}

function updateCartCount() {
  const n = store.count();
  for (const el of $$('[data-cart-count]')) {
    el.textContent = String(n);
    el.hidden = n === 0;
  }
  for (const btn of $$('[data-open-cart]')) {
    btn.setAttribute('aria-label', `Cart, ${n} ${n === 1 ? 'item' : 'items'}`);
  }
}

function setupMenu() {
  const toggle = $('.menu-toggle');
  const nav = $('#site-nav');
  if (!toggle || !nav) return;
  const set = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => set(toggle.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      set(false);
      toggle.focus();
    }
  });
}

/** Fill <span data-fill="..."> slots on static pages from config. */
export function fillConfigSlots(root = document) {
  const values = {
    brand: config.brand.name,
    email: config.brand.email,
    'free-threshold': formatMoney(config.shipping.freeThreshold),
    'flat-fee': formatMoney(config.shipping.flatFee),
    'delivery-estimate': config.shipping.deliveryEstimate,
    region: config.shipping.region,
    'returns-days': String(config.returnsDays),
    year: String(new Date().getFullYear()),
  };
  for (const el of $$('[data-fill]', root)) {
    const v = values[el.dataset.fill];
    if (v != null) el.textContent = v;
  }
  for (const a of $$('a[data-fill-href="email"]', root)) a.href = `mailto:${config.brand.email}`;
}

/**
 * options: { title, description, active, canonicalParams, noindex }
 * active: 'all' | category id | null (highlights the nav link)
 */
export function initLayout(options = {}) {
  setPageMeta(options);
  const header = $('#site-header');
  const footer = $('#site-footer');
  if (header) header.innerHTML = headerHtml(options.active);
  if (footer) footer.innerHTML = footerHtml();
  fillConfigSlots();
  mountCartDrawer();
  setupMenu();
  updateCartCount();
  store.subscribe(updateCartCount);
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-cart]');
    if (btn) openCart(btn);
  });

  const problems = validateCatalog(products, categories, sizeGuides);
  if (problems.length) console.warn(`Product data problems (js/data/products.js):\n- ${problems.join('\n- ')}`);
}
