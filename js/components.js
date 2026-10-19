// Reusable HTML snippets.

import { esc } from './dom.js';
import { formatMoney } from './money.js';
import { effectivePrice, isOnSale, discountPercent } from './pricing.js';
import { isSoldOut, isNew } from './catalog.js';
import { productImages, IMAGE_WIDTH, IMAGE_HEIGHT } from './images.js';

export function productUrl(product) {
  return `product.html?id=${encodeURIComponent(product.id)}`;
}

export function priceHtml(product, { large = false } = {}) {
  const cls = large ? 'price price--lg' : 'price';
  if (isOnSale(product)) {
    return `<p class="${cls}">
      <span class="sr-only">Sale price</span><span class="price__now price__now--sale">${formatMoney(effectivePrice(product))}</span>
      <span class="sr-only">Regular price</span><s class="price__was">${formatMoney(product.price)}</s>
    </p>`;
  }
  return `<p class="${cls}"><span class="price__now">${formatMoney(product.price)}</span></p>`;
}

export function imgTag(image, { className = '', eager = false, sizes = '' } = {}) {
  return `<img class="${className}" src="${esc(image.src)}" alt="${esc(image.alt)}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async"${sizes ? ` sizes="${sizes}"` : ''}>`;
}

export function badgesHtml(product) {
  const badges = [];
  if (isSoldOut(product)) badges.push('<span class="badge badge--dark">Sold out</span>');
  else if (isOnSale(product)) badges.push(`<span class="badge badge--sale">-${discountPercent(product)}%</span>`);
  if (!isSoldOut(product) && isNew(product)) badges.push('<span class="badge badge--accent">New</span>');
  return badges.length ? `<div class="badges">${badges.join('')}</div>` : '';
}

export function productCard(product, { eager = false } = {}) {
  const [image] = productImages(product);
  return `<li class="card${isSoldOut(product) ? ' card--soldout' : ''}">
    <a class="card__link" href="${productUrl(product)}">
      <div class="card__media">
        ${imgTag(image, { className: 'card__img', eager })}
        ${badgesHtml(product)}
      </div>
      <div class="card__body">
        <h3 class="card__title">${esc(product.name)}</h3>
        <p class="card__colour"><span class="swatch" style="--swatch:${esc(product.colour.hex)}" aria-hidden="true"></span>${esc(product.colour.name)}</p>
        ${priceHtml(product)}
      </div>
    </a>
  </li>`;
}
