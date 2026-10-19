// Product images.
// If a product has real image paths in `images`, those are used.
// Otherwise we draw a placeholder garment silhouette (SVG) in the product colour,
// in three views: front, back, and "flash" (the garment at night under a camera
// flash, where the reflective Night Mark lights up - see BRAND.md).

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

// mark = colour of the reflective Night Mark: a quiet grey tone-on-tone by day,
// near-white with a glow under the flash. glow = SVG attribute for mark elements.
function paletteFor(fill, flash = false) {
  const lum = luminance(fill);
  const dark = lum < 0.06;
  const light = '#f6f4ef';
  const ink = '#151515';
  const text = contrast(fill, light) >= contrast(fill, ink) ? light : ink;
  if (flash) {
    return {
      fill: mix(fill, '#000000', 0.8),
      bg: '#0c0c0f',
      shade: mix(fill, '#000000', 0.72),
      inner: '#050505',
      line: '#34343a',
      text: mix(text, '#000000', 0.7),
      mark: '#fffdf2',
      glow: 'filter="url(#nm-glow)"',
    };
  }
  return {
    fill,
    bg: lum > 0.55 ? '#d6d2c9' : '#e9e6df',
    shade: dark ? mix(fill, '#ffffff', 0.07) : mix(fill, '#000000', 0.14),
    inner: mix(fill, '#000000', dark ? 0.5 : 0.38),
    line: dark ? mix(fill, '#ffffff', 0.2) : mix(fill, '#000000', 0.3),
    text,
    mark: mix(fill, '#a9a9a6', dark ? 0.2 : 0.38),
    glow: '',
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
// Night Mark text: reflective ink, tone-on-tone by day, glowing under flash.
function markText(c, x, y, size, label, extra = '') {
  return text(x, y, size, label, c.mark, `${c.glow} ${extra}`);
}
// Shrink a small logo so longer brand names still fit (base size fits maxChars).
function fitSize(base, brand, maxChars) {
  return brand.length <= maxChars ? base : Math.max(8, Math.floor((base * maxChars) / brand.length));
}
function backPrint(c, label, y = 290) {
  const size = Math.max(22, Math.min(54, Math.floor(300 / Math.max(3, label.length) * 1.25)));
  return markText(c, 200, y, size, label, 'letter-spacing="2"');
}
// Back-yoke band: where the light from a car behind you lands.
function yokeBand(c) {
  return `<rect x="122" y="150" width="156" height="10" rx="2" fill="${c.mark}" ${c.glow}/>`;
}
// Reflective webbing key loop at the wearer's left hem (viewer's right from the front).
function keyLoop(c, view, y = 410) {
  const x = view === 'back' ? 112 : 280;
  return `<rect x="${x}" y="${y}" width="8" height="22" rx="4" fill="none" stroke="${c.mark}" stroke-width="4" ${c.glow}/>`;
}

function hoodie(c, view, brand, { zip = false } = {}) {
  if (view === 'back') {
    return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
      <path d="M150 116 C148 58 252 58 250 116 L238 206 C222 222 178 222 162 206 Z" fill="${c.shade}" ${stroke(c)}/>
      <path d="M200 70 L200 214" stroke="${c.line}" stroke-width="2"/>
      ${yokeBand(c)}
      ${backPrint(c, brand, 300)}
      <path d="M118 410 H282 M54 352 L97 360 M346 352 L303 360" fill="none" ${stroke(c)}/>
      ${keyLoop(c, view)}`;
  }
  const front = zip
    ? `<path d="M200 140 V432" stroke="${c.line}" stroke-width="4"/>
       <rect x="194" y="146" width="12" height="18" rx="3" fill="${c.mark}" ${c.glow}/>
       <rect x="194" y="410" width="12" height="18" rx="3" fill="${c.mark}" ${c.glow}/>
       <path d="M146 330 L166 400 M254 330 L234 400" fill="none" ${stroke(c)}/>
       ${markText(c, 150, 236, 13, brand)}`
    : `<path d="M140 330 H260 L276 404 H124 Z" fill="none" ${stroke(c)}/>
       ${markText(c, 200, 262, 20, brand, 'letter-spacing="1"')}`;
  return `<path d="M148 122 C132 52 268 52 252 122 Z" fill="${c.shade}" ${stroke(c)}/>
    <path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
    <path d="M160 112 C172 152 228 152 240 112 C226 96 174 96 160 112 Z" fill="${c.inner}"/>
    ${front}
    <path d="M186 142 L183 200 M214 142 L217 200" stroke="${c.text}" stroke-width="4" stroke-linecap="round" opacity=".85"/>
    <path d="M118 410 H282 M54 352 L97 360 M346 352 L303 360" fill="none" ${stroke(c)}/>
    ${keyLoop(c, view)}`;
}

function tee(c, view, brand, print, backLabel) {
  const body =
    view === 'back'
      ? 'M160 105 C180 114 220 114 240 105 L292 122 L350 175 L322 215 L290 195 L288 420 L112 420 L110 195 L78 215 L50 175 L108 122 Z'
      : 'M160 105 C180 132 220 132 240 105 L292 122 L350 175 L322 215 L290 195 L288 420 L112 420 L110 195 L78 215 L50 175 L108 122 Z';
  const collar = view === 'back' ? 'M160 105 C180 114 220 114 240 105' : 'M160 105 C180 132 220 132 240 105';
  let graphic;
  if (view === 'back') graphic = backPrint(c, backLabel || brand, 270);
  else if (print) {
    const words = String(print).split(' ');
    graphic = words.map((w, i) => text(200, 240 + i * 52, 46, w, c.text, 'letter-spacing="1"')).join('');
  } else graphic = markText(c, 200, 200, 18, brand, 'letter-spacing="1"');
  return `<path d="${body}" fill="${c.fill}" ${stroke(c)}/>
    <path d="${collar}" fill="none" stroke="${c.shade}" stroke-width="9" stroke-linecap="round"/>
    <path d="${collar}" fill="none" ${stroke(c)}/>
    <path d="M114 404 H286 M60 168 L84 204 M340 168 L316 204" fill="none" ${stroke(c)} opacity=".7"/>
    ${graphic}`;
}

function jacket(c, view, brand, hour) {
  if (view === 'back') {
    // full-back wordmark: the Headlight jacket's whole point
    return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
      <path d="M160 112 C180 98 220 98 240 112 L236 128 C220 118 180 118 164 128 Z" fill="${c.shade}" ${stroke(c)}/>
      ${yokeBand(c)}
      ${backPrint(c, brand, 270)}
      <rect x="128" y="300" width="144" height="16" rx="2" fill="${c.mark}" ${c.glow}/>
      ${hour ? markText(c, 200, 350, 18, hour, 'letter-spacing="3"') : ''}
      <path d="M118 414 H282" fill="none" ${stroke(c)}/>
      ${keyLoop(c, view)}`;
  }
  const snaps = [182, 232, 282, 332, 382].map((y) => `<circle cx="200" cy="${y}" r="5" fill="${c.shade}" ${stroke(c)}/>`).join('');
  return `<path d="${TOP_BODY}" fill="${c.fill}" ${stroke(c)}/>
    <path d="M200 150 V432" stroke="${c.line}" stroke-width="3"/>
    <path d="M163 108 L200 152 L237 108 L254 118 L216 170 L200 154 L184 170 L146 118 Z" fill="${c.shade}" ${stroke(c)}/>
    ${snaps}
    <path d="M136 320 L160 312 M264 320 L240 312 M118 414 H282" fill="none" ${stroke(c)}/>
    ${markText(c, 150, 222, 12, brand)}
    ${keyLoop(c, view)}`;
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
  // shorts: side-seam stripes; cargos: reflective tape inside the rolled-up hem
  const marks = shorts
    ? `<path d="M131 100 L118 296 M269 100 L282 296" fill="none" stroke="${c.mark}" stroke-width="6" stroke-linecap="round" ${c.glow}/>`
    : `<rect x="107" y="438" width="80" height="10" rx="2" fill="${c.mark}" ${c.glow}/><rect x="213" y="438" width="80" height="10" rx="2" fill="${c.mark}" ${c.glow}/>`;
  const detail =
    view === 'back'
      ? `<rect x="142" y="122" width="40" height="44" rx="3" fill="none" ${stroke(c)}/><rect x="218" y="122" width="40" height="44" rx="3" fill="none" ${stroke(c)}/>`
      : `<path d="M212 96 V160 Q212 176 200 180 M150 96 C150 124 140 140 124 146 M250 96 C250 124 260 140 276 146" fill="none" ${stroke(c)}/>`;
  const loops = [146, 200, 254].map((x) => `<rect x="${x - 3}" y="66" width="6" height="32" rx="2" fill="${c.shade}" ${stroke(c)}/>`).join('');
  const tag = view === 'back' ? markText(c, 200, 90, 11, brand) : '';
  return `<path d="${legs}" fill="${c.fill}" ${stroke(c)}/>
    <rect x="128" y="70" width="144" height="26" rx="3" fill="${c.shade}" ${stroke(c)}/>
    ${loops}${detail}${pockets}${marks}${tag}`;
}

function cap(c, view, brand) {
  if (view === 'back') {
    return `<path d="M104 300 C150 312 250 312 296 300" fill="none" stroke="${c.shade}" stroke-width="10" stroke-linecap="round"/>
      <path d="M112 300 C112 168 288 168 288 300 Z" fill="${c.fill}" ${stroke(c)}/>
      <path d="M200 176 V244 M200 176 C165 192 150 238 152 300 M200 176 C235 192 250 238 248 300" fill="none" ${stroke(c)}/>
      <path d="M166 300 C166 262 234 262 234 300 Z" fill="${c.inner}"/>
      <rect x="160" y="278" width="80" height="10" rx="3" fill="${c.mark}" ${c.glow}/>
      ${markText(c, 200, 254, fitSize(13, brand, 6), brand, 'letter-spacing="1"')}
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
    ${markText(c, 254, 256, fitSize(17, brand, 5), brand, 'letter-spacing="1"')}
  </g>`;
}

function beanie(c, view, brand) {
  const ribs = Array.from({ length: 12 }, (_, i) => 128 + i * 13.5)
    .map((x) => `M${x} 310 V366`)
    .join(' ');
  const label =
    view === 'back'
      ? ''
      : `<rect x="168" y="320" width="64" height="26" rx="2" fill="${c.mark}" ${c.glow}/>${text(200, 338, fitSize(11, brand, 6), brand, c.inner)}`;
  return `<circle cx="200" cy="196" r="32" fill="${c.shade}" ${stroke(c)}/>
    <path d="M122 330 C112 178 288 178 278 330 Z" fill="${c.fill}" ${stroke(c)}/>
    <rect x="112" y="300" width="176" height="74" rx="10" fill="${c.shade}" ${stroke(c)}/>
    <path d="${ribs}" fill="none" stroke="${c.line}" stroke-width="2" opacity=".55"/>
    ${label}`;
}

const GLOW_DEFS = `<defs><filter id="nm-glow" x="-50%" y="-50%" width="200%" height="200%">
  <feGaussianBlur stdDeviation="5" result="b"/>
  <feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
</filter></defs>`;

/** view: 'front' | 'back' | 'flash' (night, under a camera flash). */
export function placeholderSvg(product, view = 'front') {
  const flash = view === 'flash';
  const c = paletteFor(product.colour.hex, flash);
  const brand = config.brand.name.toUpperCase();
  const small = product.garment === 'cap' || product.garment === 'beanie';
  // Under the flash we show the side where the Night Mark lives.
  const side = flash ? (product.garment === 'beanie' || product.garment === 'shorts' ? 'front' : 'back') : view;
  const backLabel = product.drop ? product.drop.hour : brand;
  let shape;
  switch (product.garment) {
    case 'hoodie': shape = hoodie(c, side, brand); break;
    case 'zip-hoodie': shape = hoodie(c, side, brand, { zip: true }); break;
    case 'tee': shape = tee(c, side, brand, product.print, backLabel); break;
    case 'jacket': shape = jacket(c, side, brand, product.drop && product.drop.hour); break;
    case 'cargo': shape = bottoms(c, side, brand); break;
    case 'shorts': shape = bottoms(c, side, brand, { shorts: true }); break;
    case 'cap': shape = cap(c, side, brand); break;
    case 'beanie': shape = beanie(c, side, brand); break;
    default: shape = tee(c, side, brand, null, backLabel);
  }
  const shadowY = { cap: 356, beanie: 392, shorts: 320 }[product.garment] || 466;
  const ground = flash
    ? `<ellipse cx="200" cy="${shadowY}" rx="${small ? 120 : 160}" ry="14" fill="#ffffff" opacity=".05"/>`
    : `<ellipse cx="200" cy="${shadowY}" rx="${small ? 100 : 130}" ry="10" fill="#000" opacity=".08"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${IMAGE_WIDTH} ${IMAGE_HEIGHT}" width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}">
    ${flash ? GLOW_DEFS : ''}
    <rect width="${IMAGE_WIDTH}" height="${IMAGE_HEIGHT}" fill="${c.bg}"/>
    ${ground}
    ${shape}
  </svg>`;
}

function svgDataUri(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg.replace(/\s{2,}/g, ' '))}`;
}

const cache = new Map();
const VIEW_LABELS = { front: 'front view', back: 'back view', flash: 'at night under a camera flash, Night Mark lit' };

/**
 * All images for a product as [{ src, alt, placeholder, view }].
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
      view: null,
    }));
  } else {
    list = ['front', 'back', 'flash'].map((view) => ({
      src: svgDataUri(placeholderSvg(product, view)),
      alt: `${label}, ${VIEW_LABELS[view]} (illustration)`,
      placeholder: true,
      view,
    }));
  }
  cache.set(product.id, list);
  return list;
}
