// Product images.
// If a product has real image paths in `images`, those are used.
// Otherwise we draw a placeholder garment silhouette (SVG) in the product colour.

import { config } from './config.js';

export const IMAGE_WIDTH = 400;
export const IMAGE_HEIGHT = 500;

// ---- colour helpers --------------------------------------------------------
function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(rgb) {
  return '#' + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
}
function mix(hex, target, t) {
  const a = hexToRgb(hex);
  const b = hexToRgb(target);
  return rgbToHex(a.map((v, i) => v + (b[i] - v) * t));
}
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

function paletteFor(fill) {
  const lum = luminance(fill);
  const dark = lum < 0.06;
  const light = '#f6f4ef';
  const ink = '#151515';
  return {
    fill,
    bg: lum > 0.55 ? '#d6d2c9' : '#e9e6df',
    shade: dark ? mix(fill, '#ffffff', 0.07) : mix(fill, '#000000', 0.14),
    inner: mix(fill, '#000000', dark ? 0.5 : 0.38),
    line: dark ? mix(fill, '#ffffff', 0.2) : mix(fill, '#000000', 0.3),
    text: contrast(fill, light) >= contrast(fill, ink) ? light : ink,
  };
}

const escXml = (s) => String(s).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);

// ---- garment drawings (viewBox 0 0 400 500) ---------------------------------
const FONT = `font-family="Arial Black, Arial, Helvetica, sans-serif" font-weight="900" text-anchor="middle"`;
const TOP_BODY =
  'M165 110 C185 125 215 125 235 110 L290 128 C318 138 330 160 335 190 L348 368 L305 378 L284 222 L282 410 L282 432 L118 432 L118 410 L116 222 L95 378 L52 368 L65 190 C70 160 82 138 110 128 Z';

function stroke(c) {
  return `stroke="${c.line}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"`;
}
function text(x, y, size, label, colour, extra = '') {
  return `<text x="${x}" y="${y}" font-size="${size}" fill="${colour}" ${FONT} ${extra}>${escXml(label)}</text>`;
}
// Shrink a small logo so longer brand names still fit (base size fits maxChars).
function fitSize(base, brand, maxChars) {
  return brand.length <= maxChars ? base : Math.max(8, Math.floor((base * maxChars) / brand.length));
}
function backPrint(c, brand, y = 290) {
  const size = Math.max(22, Math.min(54, Math.floor(300 / Math.max(3, brand.length) * 1.25)));
  return text(200, y, size, brand, c.text, 'letter-spacing="2"');
}

function hoodie(c, view, brand, { zip = false } = {}) {
  if (view === 'back') {
    return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
      <path d="M150 116 C148 58 252 58 250 116 L238 206 C222 222 178 222 162 206 Z" fill="${c.shade}" ${stroke(c)}/>
      <path d="M200 70 L200 214" stroke="${c.line}" stroke-width="2"/>
      ${backPrint(c, brand, 300)}
      <path d="M118 410 H282 M54 352 L97 360 M346 352 L303 360" fill="none" ${stroke(c)}/>`;
  }
  const front = zip
    ? `<path d="M200 140 V432" stroke="${c.line}" stroke-width="4"/>
       <path d="M146 330 L166 400 M254 330 L234 400" fill="none" ${stroke(c)}/>
       ${text(150, 236, 13, brand, c.text)}`
    : `<path d="M140 330 H260 L276 404 H124 Z" fill="none" ${stroke(c)}/>
       ${text(200, 262, 20, brand, c.text, 'letter-spacing="1"')}`;
  return `<path d="M148 122 C132 52 268 52 252 122 Z" fill="${c.shade}" ${stroke(c)}/>
    <path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
    <path d="M160 112 C172 152 228 152 240 112 C226 96 174 96 160 112 Z" fill="${c.inner}"/>
    ${front}
    <path d="M186 142 L183 200 M214 142 L217 200" stroke="${c.text}" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M118 410 H282 M54 352 L97 360 M346 352 L303 360" fill="none" ${stroke(c)}/>`;
}

function tee(c, view, brand, print) {
  const body =
    view === 'back'
      ? 'M160 105 C180 114 220 114 240 105 L292 122 L350 175 L322 215 L290 195 L288 420 L112 420 L110 195 L78 215 L50 175 L108 122 Z'
      : 'M160 105 C180 132 220 132 240 105 L292 122 L350 175 L322 215 L290 195 L288 420 L112 420 L110 195 L78 215 L50 175 L108 122 Z';
  const collar = view === 'back' ? 'M160 105 C180 114 220 114 240 105' : 'M160 105 C180 132 220 132 240 105';
  let graphic;
  if (view === 'back') graphic = backPrint(c, brand, 270);
  else if (print) {
    const words = String(print).split(' ');
    graphic = words.map((w, i) => text(200, 240 + i * 52, 46, w, c.text, 'letter-spacing="1"')).join('');
  } else graphic = text(200, 200, 18, brand, c.text, 'letter-spacing="1"');
  return `<path d="${body}" fill="${c.fill}" ${stroke(c)}/>
    <path d="${collar}" fill="none" stroke="${c.shade}" stroke-width="9" stroke-linecap="round"/>
    <path d="${collar}" fill="none" ${stroke(c)}/>
    <path d="M114 404 H286 M60 168 L84 204 M340 168 L316 204" fill="none" ${stroke(c)} opacity=".7"/>
    ${graphic}`;
}

function jacket(c, view, brand) {
  if (view === 'back') {
    return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
      <path d="M160 112 C180 98 220 98 240 112 L236 128 C220 118 180 118 164 128 Z" fill="${c.shade}" ${stroke(c)}/>
      ${backPrint(c, brand, 280)}
      <path d="M118 414 H282" fill="none" ${stroke(c)}/>`;
  }
  const snaps = [182, 232, 282, 332, 382].map((y) => `<circle cx="200" cy="${y}" r="5" fill="${c.shade}" ${stroke(c)}/>`).join('');
  return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
    <path d="M200 150 V432" stroke="${c.line}" stroke-width="3"/>
    <path d="M163 108 L200 152 L237 108 L254 118 L216 170 L200 154 L184 170 L146 118 Z" fill="${c.shade}" ${stroke(c)}/>
    ${snaps}
    <path d="M136 320 L160 312 M264 320 L240 312 M118 414 H282" fill="none" ${stroke(c)}/>
    ${text(150, 222, 12, brand, c.text)}`;
}

function bottoms(c, view, brand, { shorts = false } = {}) {
  const legs = shorts
    ? 'M128 96 H272 L286 300 H208 L200 214 L192 300 H114 Z'
    : 'M128 96 H272 L294 452 H212 L200 196 L188 452 H106 Z';
  const pockets = shorts
    ? `<rect x="122" y="196" width="40" height="58" rx="4" fill="${c.shade}" ${stroke(c)}/><path d="M122 208 H162" ${stroke(c)}/>
       <rect x="238" y="196" width="40" height="58" rx="4" fill="${c.shade}" ${stroke(c)}/><path d="M238 208 H278" ${stroke(c)}/>`
    : `<rect x="124" y="246" width="46" height="72" rx="4" fill="${c.shade}" ${stroke(c)}/><path d="M124 260 H170" ${stroke(c)}/>
       <rect x="230" y="246" width="46" height="72" rx="4" fill="${c.shade}" ${stroke(c)}/><path d="M230 260 H276" ${stroke(c)}/>
       <path d="M108 436 H188 M212 436 H292" fill="none" ${stroke(c)}/>`;
  const detail =
    view === 'back'
      ? `<rect x="142" y="122" width="40" height="44" rx="3" fill="none" ${stroke(c)}/><rect x="218" y="122" width="40" height="44" rx="3" fill="none" ${stroke(c)}/>`
      : `<path d="M212 96 V160 Q212 176 200 180 M150 96 C150 124 140 140 124 146 M250 96 C250 124 260 140 276 146" fill="none" ${stroke(c)}/>`;
  const loops = [146, 200, 254].map((x) => `<rect x="${x - 3}" y="66" width="6" height="32" rx="2" fill="${c.shade}" ${stroke(c)}/>`).join('');
  const tag = view === 'back' ? text(200, 90, 11, brand, c.text) : '';
  return `<path d="${legs}" fill="${c.fill}" ${stroke(c)}/>
    <rect x="128" y="70" width="144" height="26" rx="3" fill="${c.shade}" ${stroke(c)}/>
    ${loops}${detail}${pockets}${tag}`;
}

function cap(c, view, brand) {
  if (view === 'back') {
    return `<path d="M104 300 C150 312 250 312 296 300" fill="none" stroke="${c.shade}" stroke-width="10" stroke-linecap="round"/>
      <path d="M112 300 C112 168 288 168 288 300 Z" fill="${c.fill}" ${stroke(c)}/>
      <path d="M200 176 V244 M200 176 C165 192 150 238 152 300 M200 176 C235 192 250 238 248 300" fill="none" ${stroke(c)}/>
      <path d="M166 300 C166 262 234 262 234 300 Z" fill="${c.inner}"/>
      <rect x="160" y="278" width="80" height="10" rx="3" fill="${c.shade}" ${stroke(c)}/>
      <circle cx="200" cy="175" r="8" fill="${c.shade}" ${stroke(c)}/>`;
  }
  // three-quarter side view: crown on the left, brim pointing right
  return `<g transform="translate(-44 6)">
    <path d="M100 300 C96 200 170 158 236 168 C286 176 304 232 298 300 Z" fill="${c.fill}" ${stroke(c)}/>
    <path d="M200 166 C204 206 206 254 206 300 M200 166 C160 184 142 236 142 300" fill="none" ${stroke(c)} opacity=".8"/>
    <circle cx="200" cy="165" r="7" fill="${c.shade}" ${stroke(c)}/>
    <circle cx="170" cy="214" r="3" fill="${c.inner}"/>
    <path d="M96 300 H300" fill="none" stroke="${c.shade}" stroke-width="8" stroke-linecap="round"/>
    <path d="M278 292 C326 290 366 304 392 328 C368 340 322 334 282 314 Z" fill="${c.shade}" ${stroke(c)}/>
    ${text(254, 256, fitSize(17, brand, 5), brand, c.text, 'letter-spacing="1"')}
  </g>`;
}

function beanie(c, view, brand) {
  const ribs = Array.from({ length: 12 }, (_, i) => 128 + i * 13.5)
    .map((x) => `M${x} 310 V366`)
    .join(' ');
  const label =
    view === 'back'
      ? ''
      : `<rect x="168" y="320" width="64" height="26" rx="2" fill="${c.text}"/>${text(200, 338, fitSize(11, brand, 6), brand, c.fill)}`;
  return `<circle cx="200" cy="196" r="32" fill="${c.shade}" ${stroke(c)}/>
    <path d="M122 330 C112 178 288 178 278 330 Z" fill="${c.fill}" ${stroke(c)}/>
    <rect x="112" y="300" width="176" height="74" rx="10" fill="${c.shade}" ${stroke(c)}/>
    <path d="${ribs}" fill="none" stroke="${c.line}" stroke-width="2" opacity=".55"/>
    ${label}`;
}

export function placeholderSvg(product, view = 'front') {
  const c = paletteFor(product.colour.hex);
  const brand = config.brand.name.toUpperCase();
  const small = product.garment === 'cap' || product.garment === 'beanie';
  let shape;
  switch (product.garment) {
    case 'hoodie': shape = hoodie(c, view, brand); break;
    case 'zip-hoodie': shape = hoodie(c, view, brand, { zip: true }); break;
    case 'tee': shape = tee(c, view, brand, product.print); break;
    case 'jacket': shape = jacket(c, view, brand); break;
    case 'cargo': shape = bottoms(c, view, brand); break;
    case 'shorts': shape = bottoms(c, view, brand, { shorts: true }); break;
    case 'cap': shape = cap(c, view, brand); break;
    case 'beanie': shape = beanie(c, view, brand); break;
    default: shape = tee(c, view, brand);
  }
  const shadowY = { cap: 356, beanie: 392, shorts: 320 }[product.garment] || 466;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
    <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="${c.bg}"/>
    <ellipse cx="200" cy="${shadowY}" rx="${small ? 100 : 130}" ry="10" fill="#000" opacity=".08"/>
    ${shape}
  </svg>`;
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}`;
}

const cache = new Map();

/**
 * All images for a product as [{ src, alt, placeholder }].
 * Real photos (product.images) always win over placeholders.
 */
export function productImages(product) {
  if (cache.has(product.id)) return cache.get(product.id);
  const label = `${product.name} in ${product.colour.name}`;
  let list;
  if (Array.isArray(product.images) && product.images.length) {
    list = product.images.map((src, i) => ({
      src,
      alt: i === 0 ? label : `${label}, image ${i + 1}`,
      placeholder: false,
    }));
  } else {
    list = ['front', 'back'].map((view) => ({
      src: svgDataUri(placeholderSvg(product, view)),
      alt: `${label}, ${view} view (illustration)`,
      placeholder: true,
    }));
  }
  cache.set(product.id, list);
  return list;
}
