// Pure catalog helpers: filtering, sorting, URL params, data validation.

import { effectivePrice } from './pricing.js';

export const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
];

export const DEFAULT_PARAMS = { category: 'all', sort: 'featured' };

export function totalStock(product) {
  return product.sizes.reduce((sum, s) => sum + Math.max(0, s.stock), 0);
}

export function isSoldOut(product) {
  return totalStock(product) === 0;
}

/** NEW badge: created within the last `days` days. */
export function isNew(product, now = Date.now(), days = 30) {
  const t = Date.parse(product.createdAt);
  return Number.isFinite(t) && now - t >= 0 && now - t < days * 86400000;
}

/** Read ?category=&sort= safely; unknown values fall back to defaults. */
export function parseShopParams(search, categories) {
  const params = new URLSearchParams(search);
  const category = params.get('category');
  const sort = params.get('sort');
  return {
    category: categories.some((c) => c.id === category) ? category : DEFAULT_PARAMS.category,
    sort: SORTS.some((s) => s.id === sort) ? sort : DEFAULT_PARAMS.sort,
  };
}

/** Build a query string, leaving out defaults so URLs stay short. */
export function shopParamsToSearch({ category, sort }) {
  const params = new URLSearchParams();
  if (category && category !== DEFAULT_PARAMS.category) params.set('category', category);
  if (sort && sort !== DEFAULT_PARAMS.sort) params.set('sort', sort);
  const s = params.toString();
  return s ? `?${s}` : '';
}

export function filterAndSort(products, { category = 'all', sort = 'featured' } = {}) {
  const list = products.filter((p) => category === 'all' || p.category === category);
  const byPrice = (a, b) => effectivePrice(a) - effectivePrice(b);
  switch (sort) {
    case 'newest':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case 'price-asc':
      return list.sort(byPrice);
    case 'price-desc':
      return list.sort((a, b) => byPrice(b, a));
    default:
      // data-file order, featured first, sold-out last
      return list.sort(
        (a, b) =>
          Number(isSoldOut(a)) - Number(isSoldOut(b)) || Number(!!b.featured) - Number(!!a.featured)
      );
  }
}

export function colourSiblings(products, product) {
  if (!product.group) return [product];
  return products.filter((p) => p.group === product.group);
}

/** Returns a list of human-readable problems in the product data. */
export function validateCatalog(products, categories, sizeGuides = {}) {
  const errors = [];
  const ids = new Set();
  const skus = new Set();
  const isLink = (v) => v === '' || v == null || /^https:\/\/\S+$/.test(v);
  for (const p of products) {
    const where = `Product "${p.id}"`;
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) errors.push(`${where}: id must be lowercase letters, numbers and dashes`);
    if (ids.has(p.id)) errors.push(`${where}: duplicate id`);
    ids.add(p.id);
    if (!p.name) errors.push(`${where}: missing name`);
    if (!p.colour || !p.colour.name || !/^#[0-9a-fA-F]{6}$/.test(p.colour.hex || '')) errors.push(`${where}: colour needs a name and a 6-digit hex`);
    if (!categories.some((c) => c.id === p.category)) errors.push(`${where}: unknown category "${p.category}"`);
    if (!Number.isInteger(p.price) || p.price <= 0) errors.push(`${where}: price must be a positive integer in cents`);
    if (p.salePrice != null && (!Number.isInteger(p.salePrice) || p.salePrice <= 0 || p.salePrice >= p.price)) {
      errors.push(`${where}: salePrice must be null or an integer in cents below price`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(p.createdAt || '')) errors.push(`${where}: createdAt must be YYYY-MM-DD`);
    if (!Array.isArray(p.images)) errors.push(`${where}: images must be a list (can be empty)`);
    if (p.sizeGuide && !sizeGuides[p.sizeGuide]) errors.push(`${where}: unknown sizeGuide "${p.sizeGuide}"`);
    if (!isLink(p.paymentLink)) errors.push(`${where}: paymentLink must be an https:// URL or empty`);
    if (!Array.isArray(p.sizes) || p.sizes.length === 0) {
      errors.push(`${where}: needs at least one size`);
      continue;
    }
    const sizeNames = new Set();
    for (const s of p.sizes) {
      if (!s.size) errors.push(`${where}: a size has no name`);
      if (sizeNames.has(s.size)) errors.push(`${where}: duplicate size "${s.size}"`);
      sizeNames.add(s.size);
      if (!s.sku) errors.push(`${where} size ${s.size}: missing sku`);
      if (skus.has(s.sku)) errors.push(`${where} size ${s.size}: duplicate sku "${s.sku}"`);
      skus.add(s.sku);
      if (!Number.isInteger(s.stock) || s.stock < 0) errors.push(`${where} size ${s.size}: stock must be a whole number >= 0`);
      if (!isLink(s.paymentLink)) errors.push(`${where} size ${s.size}: paymentLink must be an https:// URL or empty`);
    }
  }
  return errors;
}
