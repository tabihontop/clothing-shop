import { initLayout } from '../layout.js';
import { config } from '../config.js';
import { products, categories } from '../data/products.js';
import { SORTS, parseShopParams, shopParamsToSearch, filterAndSort } from '../catalog.js';
import { productCard } from '../components.js';
import { setPageMeta } from '../seo.js';
import { esc, $, $$ } from '../dom.js';

let state = parseShopParams(location.search, categories);

initLayout(metaFor(state));

const nav = $('[data-category-nav]');
const sortSelect = $('#sort');
const grid = $('[data-grid]');
const count = $('[data-count]');
const heading = $('[data-shop-title]');
const blurb = $('[data-shop-blurb]');

function metaFor({ category }) {
  const cat = categories.find((c) => c.id === category);
  return {
    title: cat ? cat.label : 'Shop all',
    description: cat
      ? `${cat.label} from ${config.brand.name}. ${cat.blurb}`
      : `Shop all ${config.brand.name} streetwear: hoodies, tees, cargos, outerwear and caps.`,
    canonicalParams: ['category'],
    active: cat ? cat.id : 'all',
  };
}

sortSelect.innerHTML = SORTS.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('');

function renderNav() {
  const items = [{ id: 'all', label: 'All' }, ...categories];
  nav.innerHTML = `<ul class="pills">${items
    .map((c) => {
      const href = `shop.html${shopParamsToSearch({ category: c.id, sort: state.sort })}`;
      const current = state.category === c.id ? ' aria-current="page"' : '';
      return `<li><a class="pill" href="${href}" data-category="${c.id}"${current}>${esc(c.label)}</a></li>`;
    })
    .join('')}</ul>`;
}

function render() {
  const cat = categories.find((c) => c.id === state.category);
  heading.textContent = cat ? cat.label : 'Shop all';
  blurb.textContent = cat ? cat.blurb : config.brand.description;
  sortSelect.value = state.sort;
  renderNav();
  const list = filterAndSort(products, state);
  grid.innerHTML = list.map((p, i) => productCard(p, { eager: i < 4 })).join('');
  count.textContent = `${list.length} ${list.length === 1 ? 'product' : 'products'}`;
  // keep header nav highlight in sync
  for (const a of $$('#site-nav a')) a.removeAttribute('aria-current');
  const active = cat ? `shop.html?category=${cat.id}` : 'shop.html';
  const navLink = $$('#site-nav a').find((a) => a.getAttribute('href') === active);
  if (navLink) navLink.setAttribute('aria-current', 'page');
}

function update(next, { push = true } = {}) {
  state = { ...state, ...next };
  const url = `shop.html${shopParamsToSearch(state)}`;
  if (push) history.pushState(state, '', url);
  setPageMeta(metaFor(state));
  render();
}

nav.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-category]');
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  update({ category: a.dataset.category });
  const current = nav.querySelector(`a[data-category="${a.dataset.category}"]`);
  if (current) current.focus();
});

sortSelect.addEventListener('change', () => update({ sort: sortSelect.value }));

window.addEventListener('popstate', () => {
  state = parseShopParams(location.search, categories);
  setPageMeta(metaFor(state));
  render();
});

render();
