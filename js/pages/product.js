import { initLayout, fillConfigSlots } from '../layout.js';
import { config } from '../config.js';
import { products, categories, sizeGuides } from '../data/products.js';
import { colourSiblings, isSoldOut, filterAndSort } from '../catalog.js';
import { effectivePrice } from '../pricing.js';
import { centsToDecimalString } from '../money.js';
import { productImages } from '../images.js';
import { priceHtml, productCard, productUrl, imgTag, badgesHtml } from '../components.js';
import { setJsonLd } from '../seo.js';
import { store } from '../store.js';
import { openCart } from '../cart-drawer.js';
import { esc, $, $$, announce } from '../dom.js';

const id = new URLSearchParams(location.search).get('id');
const product = products.find((p) => p.id === id);
const root = $('[data-product]');

if (!product) {
  initLayout({ title: 'Product not found', noindex: true });
  root.innerHTML = `<div class="container empty empty--page">
    <h1>Product not found</h1>
    <p>This product does not exist or is no longer available.</p>
    <a class="btn btn--primary" href="shop.html">Shop all</a>
  </div>`;
} else {
  initLayout({
    title: `${product.name} - ${product.colour.name}`,
    description: product.description,
    canonicalParams: ['id'],
    active: product.category,
  });
  renderProduct(product);
}

function sizeGuideHtml(key) {
  const g = sizeGuides[key];
  if (!g) return '';
  return `<details class="disclosure">
    <summary>Size guide</summary>
    <div class="disclosure__body">
      <p class="fine">${esc(g.note)}</p>
      <div class="table-wrap">
        <table class="size-table">
          <caption class="sr-only">${esc(g.title)}</caption>
          <thead><tr>${g.columns.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead>
          <tbody>${g.rows.map((r) => `<tr>${r.map((v, i) => (i === 0 ? `<th scope="row">${esc(v)}</th>` : `<td>${esc(v)}</td>`)).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    </div>
  </details>`;
}

function renderProduct(p) {
  const images = productImages(p);
  const category = categories.find((c) => c.id === p.category);
  const siblings = colourSiblings(products, p);
  const oneSize = p.sizes.length === 1;
  const soldOut = isSoldOut(p);

  const thumbs =
    images.length > 1
      ? `<div class="gallery__thumbs">${images
          .map(
            (img, i) => `<button type="button" class="gallery__thumb${img.view === 'flash' ? ' gallery__thumb--flash' : ''}" data-index="${i}" aria-label="Show image ${i + 1} of ${images.length}${img.view === 'flash' ? ': under a flash' : ''}"${i === 0 ? ' aria-current="true"' : ''}>
              <img src="${esc(img.src)}" alt="" width="80" height="100" loading="lazy">
            </button>`
          )
          .join('')}</div>`
      : '';

  const swatches =
    siblings.length > 1
      ? `<div class="colours">
          <p class="field-label">Colour: <strong>${esc(p.colour.name)}</strong></p>
          <ul class="colours__list">${siblings
            .map(
              (s) => `<li><a class="colour-link" href="${productUrl(s)}"${s.id === p.id ? ' aria-current="true"' : ''} aria-label="${esc(s.colour.name)}${isSoldOut(s) ? ' (sold out)' : ''}" title="${esc(s.colour.name)}">
                <span class="swatch swatch--lg" style="--swatch:${esc(s.colour.hex)}"></span></a></li>`
            )
            .join('')}</ul>
        </div>`
      : `<p class="field-label">Colour: <strong>${esc(p.colour.name)}</strong></p>`;

  const sizeOptions = p.sizes
    .map((s, i) => {
      const disabled = s.stock <= 0;
      const checked = oneSize && !disabled ? ' checked' : '';
      return `<label class="size-opt">
        <input type="radio" name="size" value="${esc(s.size)}"${disabled ? ' disabled' : ''}${checked} aria-describedby="stock-msg">
        <span>${esc(s.size)}${disabled ? '<span class="sr-only"> (sold out)</span>' : ''}</span>
      </label>`;
    })
    .join('');

  const related = filterAndSort(
    products.filter((x) => x.id !== p.id && x.group !== p.group && !isSoldOut(x)),
    { category: 'all', sort: 'featured' }
  )
    .sort((a, b) => Number(b.category === p.category) - Number(a.category === p.category))
    .slice(0, 4);

  root.innerHTML = `<div class="container">
    <nav class="breadcrumb" aria-label="Breadcrumb">
      <ol>
        <li><a href="shop.html">Shop</a></li>
        ${category ? `<li><a href="shop.html?category=${encodeURIComponent(category.id)}">${esc(category.label)}</a></li>` : ''}
        <li><a href="${productUrl(p)}" aria-current="page">${esc(p.name)}</a></li>
      </ol>
    </nav>
    <div class="pdp">
      <div class="gallery">
        <div class="gallery__main">
          ${imgTag(images[0], { className: 'gallery__img', eager: true })}
          ${badgesHtml(p)}
        </div>
        ${thumbs}
      </div>
      <div class="pdp__info">
        <h1 class="pdp__title">${esc(p.name)}</h1>
        ${priceHtml(p, { large: true })}
        <p class="fine">${config.pricesIncludeVat ? 'Incl. VAT. ' : ''}<a href="shipping.html">Shipping</a> calculated in cart.</p>
        ${
          p.drop
            ? `<p class="drop-note"><strong>Hour Drop ${esc(p.drop.hour)}</strong> &middot; Numbered run of ${p.drop.run} &middot; Never restocked</p>`
            : `<p class="drop-note drop-note--essential"><strong>Essential</strong> &middot; Always restocked</p>`
        }
        ${swatches}
        <form class="buy" novalidate data-buy>
          <fieldset class="sizes">
            <legend class="field-label">Size${oneSize ? '' : ' <span class="sr-only">(required)</span>'}</legend>
            <div class="sizes__grid${oneSize ? ' sizes__grid--one' : ''}">${sizeOptions}</div>
          </fieldset>
          <p id="stock-msg" class="stock-msg" aria-live="polite"></p>
          <p class="form-error" data-error role="alert"></p>
          <button class="btn btn--primary btn--block" type="submit" ${soldOut ? 'disabled' : ''}>${soldOut ? 'Sold out' : 'Add to cart'}</button>
        </form>
        ${sizeGuideHtml(p.sizeGuide)}
        ${
          p.nightMark
            ? `<div class="night-mark">
                <h2 class="h-small">The Night Mark</h2>
                <p>${esc(p.nightMark)}</p>
                <p class="fine">Reflective print, not certified high-visibility safety clothing. Wash inside out at 30&deg;C, no tumble dryer: the mark dulls slowly over time, like road paint.</p>
              </div>`
            : ''
        }
        <div class="pdp__desc">
          <h2 class="h-small">Description</h2>
          <p>${esc(p.description)}</p>
          <ul class="ticks">${p.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
        </div>
        <details class="disclosure">
          <summary>Shipping &amp; returns</summary>
          <div class="disclosure__body">
            <p>Free shipping in the ${esc(config.shipping.region)} on orders over <span data-fill="free-threshold"></span>, otherwise <span data-fill="flat-fee"></span>. Delivery in ${esc(config.shipping.deliveryEstimate)}. ${config.returnsDays}-day returns. <a href="shipping.html">Shipping</a> &middot; <a href="returns.html">Returns</a></p>
          </div>
        </details>
      </div>
    </div>
    ${
      related.length
        ? `<section class="section" aria-labelledby="related-h"><h2 id="related-h" class="section__title">You might also like</h2><ul class="grid">${related.map((r) => productCard(r)).join('')}</ul></section>`
        : ''
    }
  </div>`;

  // config slots inside the injected markup
  fillConfigSlots(root);

  // gallery
  const mainImg = $('.gallery__img', root);
  for (const btn of $$('.gallery__thumb', root)) {
    btn.addEventListener('click', () => {
      const img = images[Number(btn.dataset.index)];
      mainImg.src = img.src;
      mainImg.alt = img.alt;
      $$('.gallery__thumb', root).forEach((b) => b.removeAttribute('aria-current'));
      btn.setAttribute('aria-current', 'true');
    });
  }

  // size picker + add to cart
  const form = $('[data-buy]', root);
  const stockMsg = $('#stock-msg', root);
  const errorEl = $('[data-error]', root);

  function selectedSize() {
    const checked = form.querySelector('input[name="size"]:checked');
    return checked ? checked.value : null;
  }

  function updateStockMsg() {
    const size = selectedSize();
    if (!size) {
      stockMsg.textContent = soldOut ? 'This product is sold out.' : '';
      return;
    }
    const v = p.sizes.find((s) => s.size === size);
    const inCart = store.qtyOf(p.id, size);
    if (v.stock <= 3) stockMsg.textContent = `Only ${v.stock} left${oneSize ? '' : ` in ${size}`}.`;
    else stockMsg.textContent = 'In stock.';
    if (inCart) stockMsg.textContent += ` ${inCart} in your cart.`;
  }

  form.addEventListener('change', () => {
    errorEl.textContent = '';
    updateStockMsg();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const size = selectedSize();
    if (!size) {
      errorEl.textContent = 'Please choose a size.';
      const first = form.querySelector('input[name="size"]:not(:disabled)');
      if (first) first.focus();
      return;
    }
    const result = store.add(p.id, size);
    if (!result.added) {
      errorEl.textContent =
        result.reason === 'max-stock'
          ? `You already have all ${p.sizes.find((s) => s.size === size).stock} in stock in your cart.`
          : 'Sorry, this size is sold out.';
      return;
    }
    errorEl.textContent = '';
    updateStockMsg();
    openCart(form.querySelector('button[type="submit"]'));
    announce(`Added ${p.name}, ${p.colour.name}, size ${size} to your cart.`);
  });

  store.subscribe(updateStockMsg);
  updateStockMsg();

  // structured data (Product JSON-LD)
  const absolute = (src) => new URL(src, location.href).toString();
  const realImages = images.filter((i) => !i.placeholder).map((i) => absolute(i.src));
  const price = centsToDecimalString(effectivePrice(p));
  const url = absolute(productUrl(p));
  setJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.name} - ${p.colour.name}`,
    description: p.description,
    sku: p.id,
    color: p.colour.name,
    category: category ? category.label : undefined,
    brand: { '@type': 'Brand', name: config.brand.name },
    ...(realImages.length ? { image: realImages } : {}),
    offers: p.sizes.map((s) => ({
      '@type': 'Offer',
      sku: s.sku,
      name: `Size ${s.size}`,
      price,
      priceCurrency: config.currency,
      availability: s.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url,
    })),
  });
}
