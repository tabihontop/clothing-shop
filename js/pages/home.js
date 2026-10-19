import { initLayout } from '../layout.js';
import { config } from '../config.js';
import { products, categories } from '../data/products.js';
import { productCard, imgTag } from '../components.js';
import { productImages } from '../images.js';
import { isSoldOut } from '../catalog.js';
import { esc, $ } from '../dom.js';

initLayout({ title: null, description: config.brand.description });

// Hero artwork: first two featured products
const featured = products.filter((p) => p.featured && !isSoldOut(p));
const heroArt = $('[data-hero-art]');
if (heroArt) {
  heroArt.innerHTML = featured
    .slice(0, 2)
    .map((p, i) => `<div class="hero__tile hero__tile--${i + 1}">${imgTag(productImages(p)[0], { eager: true })}</div>`)
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
