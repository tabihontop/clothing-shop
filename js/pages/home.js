import { initLayout } from '../layout.js';
import { config } from '../config.js';
import { products, categories } from '../data/products.js';
import { productCard, imgTag } from '../components.js';
import { productImages } from '../images.js';
import { isSoldOut } from '../catalog.js';
import { esc, $ } from '../dom.js';

initLayout({ title: null, description: config.brand.description });

// Hero artwork: the first featured product by day and under a flash (the Night Mark).
// With real photos, the first two photos are used instead.
const featured = products.filter((p) => p.featured && !isSoldOut(p));
const hero = featured[0];
const heroImgs = hero ? productImages(hero) : [];
const byView = (view, fallback) => heroImgs.find((img) => img.view === view) || heroImgs[fallback] || heroImgs[0];

const heroArt = $('[data-hero-art]');
if (heroArt && hero) {
  heroArt.innerHTML = [byView('front', 0), byView('flash', 1)]
    .map((img, i) => `<div class="hero__tile hero__tile--${i + 1}">${imgTag(img, { eager: true })}</div>`)
    .join('');
}

const pair = $('[data-nightmark-pair]');
if (pair && hero) {
  pair.innerHTML = [
    [byView('back', 0), 'Daylight'],
    [byView('flash', 1), 'Under a flash'],
  ]
    .map(([img, caption]) => `<figure class="nightmark__fig">${imgTag(img)}<figcaption>${esc(caption)}</figcaption></figure>`)
    .join('');
}

const grid = $('[data-featured]');
if (grid) grid.innerHTML = featured.slice(0, 4).map((p) => productCard(p)).join('');

const cats = $('[data-categories]');
if (cats) {
  cats.innerHTML = categories
    .map((c) => {
      const sample = products.find((p) => p.category === c.id);
      const count = products.filter((p) => p.category === c.id).length;
      const img = sample ? imgTag({ ...productImages(sample)[0], alt: '' }, { className: 'cat__img' }) : '';
      return `<li class="cat">
        <a class="cat__link" href="shop.html?category=${encodeURIComponent(c.id)}">
          ${img}
          <span class="cat__label">${esc(c.label)} <span class="cat__count">${count}</span></span>
        </a>
      </li>`;
    })
    .join('');
}
