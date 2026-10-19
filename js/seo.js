// Per-page <title>, meta description, canonical URL and JSON-LD.

import { config } from './config.js';

function ensureMeta(attr, key) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.append(el);
  }
  return el;
}

/**
 * title: page title without the brand (brand is appended), or null for home.
 * canonicalParams: query params that belong in the canonical URL (e.g. ['id']).
 */
export function setPageMeta({ title, description, canonicalParams = [], noindex = false } = {}) {
  const brand = config.brand.name;
  const fullTitle = title ? `${title} | ${brand}` : `${brand} | ${config.brand.tagline}`;
  document.title = fullTitle;
  const desc = description || config.brand.description;
  ensureMeta('name', 'description').setAttribute('content', desc);
  ensureMeta('property', 'og:title').setAttribute('content', fullTitle);
  ensureMeta('property', 'og:description').setAttribute('content', desc);
  ensureMeta('property', 'og:site_name').setAttribute('content', brand);

  const url = new URL(location.href);
  const keep = new URLSearchParams();
  for (const p of canonicalParams) if (url.searchParams.has(p)) keep.set(p, url.searchParams.get(p));
  url.search = keep.toString();
  url.hash = '';
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.append(link);
  }
  link.href = url.toString();

  if (noindex) ensureMeta('name', 'robots').setAttribute('content', 'noindex');
}

export function setJsonLd(data) {
  let el = document.getElementById('jsonld');
  if (!el) {
    el = document.createElement('script');
    el.type = 'application/ld+json';
    el.id = 'jsonld';
    document.head.append(el);
  }
  el.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
}
