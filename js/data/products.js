// ---------------------------------------------------------------------------
// PRODUCT DATA. Edit this file to add, change or remove products.
//
// Product fields:
//   id          unique, lowercase-with-dashes. Used in the URL: product.html?id=<id>
//               Changing an id breaks old links and drops it from carts.
//   name        product name (without colour)
//   colour      { name, hex }  hex also colours the placeholder drawing
//   group       products with the same group are shown as colour options of each other
//   category    one of the category ids below
//   garment     placeholder drawing used when images is empty:
//               hoodie | zip-hoodie | tee | jacket | cargo | shorts | cap | beanie
//   print       optional big front print text for the placeholder (graphic tees)
//   price       regular price in integer cents (8900 = €89.00)
//   salePrice   sale price in cents, or null when not on sale (NOCTURN doesn't
//               discount, see BRAND.md, but the shop still supports it)
//   featured    true = shown on the home page
//   createdAt   'YYYY-MM-DD', used for "Newest" sorting and the NEW badge
//   images      list of image paths, e.g. ['images/products/shift-hoodie-black-1.jpg']
//               leave empty [] to use the generated placeholder drawing
//   nightMark   where the reflective Night Mark sits on this piece and why
//               (shown on the product page)
//   drop        null for Essentials (restocked), or { hour: '22:00', run: 60 }
//               for a numbered Hour Drop that is never restocked
//   description, details   shown on the product page
//   sizeGuide   'tops' | 'bottoms' | 'headwear' (see sizeGuides below)
//   paymentLink optional product-level Stripe Payment Link, used for any size
//               that has no paymentLink of its own (see README)
//   sizes       one entry per size: { size, sku, stock, paymentLink }
//               stock 0 = sold out (size is shown but cannot be picked)
//               paymentLink = Stripe Payment Link for exactly this size (best)
// ---------------------------------------------------------------------------

export const categories = [
  { id: 'hoodies', label: 'Hoodies', blurb: 'Heavyweight fleece for the walk home. Night Mark across the back yoke.' },
  { id: 'tees', label: 'Tees', blurb: 'Boxy 240 gsm cotton. Quiet by day, lit under the flash.' },
  { id: 'pants', label: 'Pants & Shorts', blurb: 'Ripstop cargos with reflective tape hidden in the hem.' },
  { id: 'outerwear', label: 'Outerwear', blurb: 'Light layers that disappear by day and light up in a headlight.' },
  { id: 'headwear', label: 'Headwear', blurb: 'Caps and beanies with a reflective rear mark.' },
];

export const sizeGuides = {
  tops: {
    title: 'Tops size guide',
    note: 'Flat-lay measurements in cm (±2 cm). Boxy fit: take your usual size for a relaxed look, size down for a closer fit.',
    columns: ['Size', 'Chest (half)', 'Length', 'Sleeve'],
    rows: [
      ['XS', 54, 66, 58],
      ['S', 57, 68, 60],
      ['M', 60, 70, 62],
      ['L', 63, 72, 63],
      ['XL', 66, 74, 64],
      ['XXL', 69, 76, 65],
    ],
  },
  bottoms: {
    title: 'Bottoms size guide',
    note: 'Flat-lay measurements in cm (±2 cm). Relaxed fit with an adjustable hem.',
    columns: ['Size', 'Waist (half)', 'Inseam', 'Leg opening'],
    rows: [
      ['XS', 36, 76, 19],
      ['S', 38, 78, 20],
      ['M', 40, 80, 21],
      ['L', 42, 81, 22],
      ['XL', 44, 82, 23],
      ['XXL', 46, 83, 24],
    ],
  },
  headwear: {
    title: 'Headwear size guide',
    note: 'One size fits most: 56-60 cm head circumference.',
    columns: ['Size', 'Head circumference'],
    rows: [['One size', '56-60 cm']],
  },
};

const sizes = (code, stock) =>
  ['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size, i) => ({ size, sku: `${code}-${size}`, stock: stock[i], paymentLink: '' }));

export const products = [
  // ---- Hour Drop 22:00 (numbered, never restocked) -------------------------
  {
    id: 'headlight-coach-jacket-black',
    name: 'Headlight Coach Jacket',
    colour: { name: 'Night Black', hex: '#141416' },
    group: 'headlight-coach-jacket',
    category: 'outerwear',
    garment: 'jacket',
    price: 13000,
    salePrice: null,
    featured: true,
    createdAt: '2026-10-02',
    images: [],
    drop: { hour: '22:00', run: 40 },
    nightMark:
      'Full-back wordmark in reflective ink. In daylight it is a plain black jacket. In a headlight or a camera flash the whole back lights up.',
    description:
      'The whole idea of NOCTURN in one jacket. A water-resistant coach jacket with no visible logo by day, and a full-back reflective print that only shows when light hits it. Numbered run of 40 for the 22:00 Hour Drop; it will not be restocked.',
    details: [
      'Water-resistant nylon shell, mesh lining',
      'Snap front, drawcord hem',
      'Full-back reflective print',
      'Reflective key loop at the left hem',
      'Run number and Sodium Orange hour stamp printed inside the neck',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-HCJ-BLK', [0, 2, 4, 5, 3, 1]),
  },
  {
    id: 'night-shift-tee-sodium',
    name: 'Night Shift Tee',
    colour: { name: 'Sodium Orange', hex: '#ff7a1a' },
    group: 'night-shift-tee',
    category: 'tees',
    garment: 'tee',
    print: 'NIGHT SHIFT',
    price: 4500,
    salePrice: null,
    featured: true,
    createdAt: '2026-10-02',
    images: [],
    drop: { hour: '22:00', run: 60 },
    nightMark: 'A reflective "22:00" across the back, for the walk to the shift change.',
    description:
      'The first Hour Drop. 22:00 is when the night shift starts: buses change drivers, kitchens close, wards hand over. A loud puff-print front for the people who work it, and a reflective hour on the back. Numbered run of 60, never restocked.',
    details: [
      '240 gsm cotton jersey, boxy fit',
      'Puff-print front graphic',
      'Reflective "22:00" back print',
      'Run number printed inside the neck',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-NST-SOD', [0, 3, 7, 6, 4, 2]),
  },

  // ---- Essentials (restocked) ---------------------------------------------
  {
    id: 'shift-hoodie-black',
    name: 'Shift Hoodie',
    colour: { name: 'Night Black', hex: '#141416' },
    group: 'shift-hoodie',
    category: 'hoodies',
    garment: 'hoodie',
    price: 8900,
    salePrice: null,
    featured: true,
    createdAt: '2026-09-20',
    images: [],
    drop: null,
    nightMark: 'A reflective band across the back yoke, exactly where a car behind you looks.',
    description:
      'The everyday uniform. 480 gsm brushed-back cotton with dropped shoulders, a double-layer hood and a kangaroo pocket for everything you carry to work. Always restocked.',
    details: [
      '480 gsm 100% organic cotton fleece',
      'Boxy, dropped-shoulder fit',
      'Reflective back-yoke band',
      'Reflective key loop at the left hem',
      'Sodium Orange hour stamp inside the hood',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-SHD-BLK', [2, 7, 12, 10, 6, 3]),
  },
  {
    id: 'shift-hoodie-fog',
    name: 'Shift Hoodie',
    colour: { name: 'Fog', hex: '#d9d6cf' },
    group: 'shift-hoodie',
    category: 'hoodies',
    garment: 'hoodie',
    price: 8900,
    salePrice: null,
    featured: false,
    createdAt: '2026-09-20',
    images: [],
    drop: null,
    nightMark: 'A reflective band across the back yoke, almost invisible on fog-grey by day.',
    description:
      'The Shift Hoodie in fog grey: the colour of a street at 05:00. Same 480 gsm fleece, double-layer hood and reflective back-yoke band. Always restocked.',
    details: [
      '480 gsm 100% organic cotton fleece',
      'Boxy, dropped-shoulder fit',
      'Reflective back-yoke band',
      'Reflective key loop at the left hem',
      'Sodium Orange hour stamp inside the hood',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-SHD-FOG', [1, 4, 7, 6, 4, 2]),
  },
  {
    id: 'courier-zip-hoodie-asphalt',
    name: 'Courier Zip Hoodie',
    colour: { name: 'Wet Asphalt', hex: '#3a3d41' },
    group: 'courier-zip-hoodie',
    category: 'hoodies',
    garment: 'zip-hoodie',
    price: 9500,
    salePrice: null,
    featured: false,
    createdAt: '2026-09-20',
    images: [],
    drop: null,
    nightMark: 'Reflective back-yoke band plus reflective zip pulls you can find in the dark.',
    description:
      'Built for riding. A two-way zip opens from the bottom so it sits right on a bike, with split front pockets and a reflective back. Always restocked.',
    details: [
      '420 gsm cotton fleece',
      'Two-way metal zip with reflective pulls',
      'Reflective back-yoke band',
      'Reflective key loop at the left hem',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-CZH-ASP', [1, 4, 7, 6, 4, 2]),
  },
  {
    id: 'essential-tee-black',
    name: 'Essential Tee',
    colour: { name: 'Night Black', hex: '#141416' },
    group: 'essential-tee',
    category: 'tees',
    garment: 'tee',
    price: 3900,
    salePrice: null,
    featured: false,
    createdAt: '2026-08-15',
    images: [],
    drop: null,
    nightMark: 'Tone-on-tone wordmark on the chest and back. You only read it under a flash.',
    description:
      'A wide, slightly cropped tee in 240 gsm cotton. No loud logo: the wordmark is printed in reflective ink, grey-on-black by day and white under a flash. Always restocked.',
    details: [
      '240 gsm cotton jersey',
      'Boxy, slightly cropped fit',
      'Reflective tone-on-tone print, front and back',
      'Sodium Orange hour stamp inside the neck',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-EST-BLK', [3, 8, 11, 10, 6, 2]),
  },
  {
    id: 'essential-tee-fog',
    name: 'Essential Tee',
    colour: { name: 'Fog', hex: '#d9d6cf' },
    group: 'essential-tee',
    category: 'tees',
    garment: 'tee',
    price: 3900,
    salePrice: null,
    featured: false,
    createdAt: '2026-08-15',
    images: [],
    drop: null,
    nightMark: 'Tone-on-tone wordmark on the chest and back. You only read it under a flash.',
    description:
      'The Essential Tee in fog grey. 240 gsm cotton, boxy cut, reflective wordmark that stays quiet until the light hits it. Always restocked.',
    details: [
      '240 gsm cotton jersey',
      'Boxy, slightly cropped fit',
      'Reflective tone-on-tone print, front and back',
      'Sodium Orange hour stamp inside the neck',
    ],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: sizes('NCT-EST-FOG', [3, 8, 10, 10, 6, 3]),
  },
  {
    id: 'last-train-cargo-black',
    name: 'Last Train Cargo',
    colour: { name: 'Night Black', hex: '#141416' },
    group: 'last-train-cargo',
    category: 'pants',
    garment: 'cargo',
    price: 11000,
    salePrice: null,
    featured: true,
    createdAt: '2026-10-01',
    images: [],
    drop: null,
    nightMark: 'Reflective tape hidden inside the toggle hem. Roll the hem up for the ride home.',
    description:
      'Relaxed cargos in tough cotton ripstop for the last train and the walk after it. Bellowed thigh pockets, and a toggle hem with reflective tape inside. Always restocked.',
    details: [
      'Cotton ripstop, 280 gsm',
      'Relaxed, straight leg',
      'Six pockets incl. two bellowed cargo pockets',
      'Toggle hem with reflective tape inside',
      'Reflective key loop at the left belt loop',
    ],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: sizes('NCT-LTC-BLK', [1, 4, 7, 6, 4, 2]),
  },
  {
    id: 'last-train-cargo-concrete',
    name: 'Last Train Cargo',
    colour: { name: 'Concrete', hex: '#8f8c86' },
    group: 'last-train-cargo',
    category: 'pants',
    garment: 'cargo',
    price: 11000,
    salePrice: null,
    featured: false,
    createdAt: '2026-10-01',
    images: [],
    drop: null,
    nightMark: 'Reflective tape hidden inside the toggle hem. Roll the hem up for the ride home.',
    description:
      'The Last Train Cargo in concrete grey. Cotton ripstop, bellowed pockets, and reflective tape inside the toggle hem. Always restocked.',
    details: [
      'Cotton ripstop, 280 gsm',
      'Relaxed, straight leg',
      'Six pockets incl. two bellowed cargo pockets',
      'Toggle hem with reflective tape inside',
      'Reflective key loop at the left belt loop',
    ],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: sizes('NCT-LTC-CON', [0, 3, 5, 4, 3, 1]),
  },
  {
    id: 'night-run-shorts-charcoal',
    name: 'Night Run Shorts',
    colour: { name: 'Charcoal', hex: '#3d3f42' },
    group: 'night-run-shorts',
    category: 'pants',
    garment: 'shorts',
    price: 6500,
    salePrice: null,
    featured: false,
    createdAt: '2026-06-01',
    images: [],
    drop: null,
    nightMark: 'A reflective stripe down each side seam, for summer runs after dark.',
    description:
      'Quick-dry nylon shorts with an elastic waist, internal drawcord, zip cargo pocket and reflective side stripes. A summer piece: back in May.',
    details: ['100% recycled nylon', 'Elastic waist with drawcord', 'Zip cargo pocket', 'Reflective side stripes', '7" inseam'],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: sizes('NCT-NRS-CHR', [0, 0, 0, 0, 0, 0]),
  },
  {
    id: 'back-mark-cap-black',
    name: 'Back-Mark Cap',
    colour: { name: 'Night Black', hex: '#141416' },
    group: 'back-mark-cap',
    category: 'headwear',
    garment: 'cap',
    price: 3500,
    salePrice: null,
    featured: false,
    createdAt: '2026-08-01',
    images: [],
    drop: null,
    nightMark: 'A reflective rear strap and a small reflective wordmark at the back of the crown.',
    description:
      'A low-profile six-panel cap in washed cotton twill. Plain from the front; the back catches the light. Always restocked.',
    details: ['Washed cotton twill', 'Low-profile, curved brim', 'Reflective tone-on-tone front wordmark', 'Reflective rear strap'],
    sizeGuide: 'headwear',
    paymentLink: '',
    sizes: [{ size: 'One size', sku: 'NCT-BMC-BLK-OS', stock: 30, paymentLink: '' }],
  },
  {
    id: 'sodium-beanie',
    name: 'Sodium Beanie',
    colour: { name: 'Sodium Orange', hex: '#ff7a1a' },
    group: 'sodium-beanie',
    category: 'headwear',
    garment: 'beanie',
    price: 2900,
    salePrice: null,
    featured: false,
    createdAt: '2026-10-10',
    images: [],
    drop: null,
    nightMark: 'A reflective woven label on the cuff.',
    description:
      'A chunky rib-knit beanie in the colour of old sodium street lamps, with a deep turn-up cuff and a reflective woven label. Warm without the itch. Always restocked.',
    details: ['Merino wool blend', 'Deep turn-up cuff', 'Reflective woven label', 'One size'],
    sizeGuide: 'headwear',
    paymentLink: '',
    sizes: [{ size: 'One size', sku: 'NCT-SOB-SOD-OS', stock: 30, paymentLink: '' }],
  },
];
