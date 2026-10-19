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
//   salePrice   sale price in cents, or null when not on sale
//   featured    true = shown on the home page
//   createdAt   'YYYY-MM-DD', used for "Newest" sorting and the NEW badge
//   images      list of image paths, e.g. ['images/products/heavyweight-hoodie-black-1.jpg']
//               leave empty [] to use the generated placeholder drawing
//   description, details   shown on the product page
//   sizeGuide   'tops' | 'bottoms' | 'headwear' (see sizeGuides below)
//   paymentLink optional product-level Stripe Payment Link, used for any size
//               that has no paymentLink of its own (see README)
//   sizes       one entry per size: { size, sku, stock, paymentLink }
//               stock 0 = sold out (size is shown but cannot be picked)
//               paymentLink = Stripe Payment Link for exactly this size (best)
// ---------------------------------------------------------------------------

export const categories = [
  { id: 'hoodies', label: 'Hoodies', blurb: 'Heavyweight fleece, built to be lived in.' },
  { id: 'tees', label: 'Tees', blurb: 'Boxy cuts, thick cotton, clean prints.' },
  { id: 'pants', label: 'Pants & Shorts', blurb: 'Cargos and shorts with room to move.' },
  { id: 'outerwear', label: 'Outerwear', blurb: 'Light layers for city weather.' },
  { id: 'headwear', label: 'Headwear', blurb: 'Caps and beanies to finish the fit.' },
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

export const products = [
  {
    id: 'heavyweight-hoodie-black',
    name: 'Heavyweight Hoodie',
    colour: { name: 'Black', hex: '#1c1c1e' },
    group: 'heavyweight-hoodie',
    category: 'hoodies',
    garment: 'hoodie',
    price: 8900,
    salePrice: null,
    featured: true,
    createdAt: '2026-09-20',
    images: [],
    description:
      'Our signature hoodie in 480 gsm brushed-back cotton. Dropped shoulders, a double-layer hood and a kangaroo pocket deep enough for everything you carry.',
    details: ['480 gsm 100% organic cotton fleece', 'Boxy, dropped-shoulder fit', 'Double-layer hood, flat drawcords', 'Garment-dyed and pre-shrunk'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-HHD-BLK-XS', stock: 2, paymentLink: '' },
      { size: 'S', sku: 'KRB-HHD-BLK-S', stock: 7, paymentLink: '' },
      { size: 'M', sku: 'KRB-HHD-BLK-M', stock: 12, paymentLink: '' },
      { size: 'L', sku: 'KRB-HHD-BLK-L', stock: 9, paymentLink: '' },
      { size: 'XL', sku: 'KRB-HHD-BLK-XL', stock: 4, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-HHD-BLK-XXL', stock: 0, paymentLink: '' },
    ],
  },
  {
    id: 'heavyweight-hoodie-bone',
    name: 'Heavyweight Hoodie',
    colour: { name: 'Bone', hex: '#e6dfcf' },
    group: 'heavyweight-hoodie',
    category: 'hoodies',
    garment: 'hoodie',
    price: 8900,
    salePrice: null,
    featured: false,
    createdAt: '2026-09-20',
    images: [],
    description:
      'Our signature hoodie in 480 gsm brushed-back cotton, in a warm off-white. Dropped shoulders, double-layer hood, kangaroo pocket.',
    details: ['480 gsm 100% organic cotton fleece', 'Boxy, dropped-shoulder fit', 'Double-layer hood, flat drawcords', 'Garment-dyed and pre-shrunk'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-HHD-BNE-XS', stock: 0, paymentLink: '' },
      { size: 'S', sku: 'KRB-HHD-BNE-S', stock: 3, paymentLink: '' },
      { size: 'M', sku: 'KRB-HHD-BNE-M', stock: 6, paymentLink: '' },
      { size: 'L', sku: 'KRB-HHD-BNE-L', stock: 5, paymentLink: '' },
      { size: 'XL', sku: 'KRB-HHD-BNE-XL', stock: 2, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-HHD-BNE-XXL', stock: 1, paymentLink: '' },
    ],
  },
  {
    id: 'zip-hoodie-olive',
    name: 'Zip Hoodie',
    colour: { name: 'Washed Olive', hex: '#5f6447' },
    group: 'zip-hoodie',
    category: 'hoodies',
    garment: 'zip-hoodie',
    price: 9500,
    salePrice: 7600,
    featured: false,
    createdAt: '2026-07-02',
    images: [],
    description:
      'A full-zip take on our heavyweight fleece with a two-way metal zip and split front pockets. Washed for a lived-in colour from day one.',
    details: ['420 gsm cotton fleece', 'Two-way metal zip', 'Split front pockets', 'Ribbed cuffs and hem'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-ZHD-OLV-XS', stock: 1, paymentLink: '' },
      { size: 'S', sku: 'KRB-ZHD-OLV-S', stock: 4, paymentLink: '' },
      { size: 'M', sku: 'KRB-ZHD-OLV-M', stock: 5, paymentLink: '' },
      { size: 'L', sku: 'KRB-ZHD-OLV-L', stock: 3, paymentLink: '' },
      { size: 'XL', sku: 'KRB-ZHD-OLV-XL', stock: 0, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-ZHD-OLV-XXL', stock: 0, paymentLink: '' },
    ],
  },
  {
    id: 'boxy-tee-white',
    name: 'Boxy Logo Tee',
    colour: { name: 'White', hex: '#f4f3ef' },
    group: 'boxy-tee',
    category: 'tees',
    garment: 'tee',
    price: 3900,
    salePrice: null,
    featured: true,
    createdAt: '2026-08-15',
    images: [],
    description:
      'A wide, cropped tee in 240 gsm cotton jersey with a small chest logo and a bold back print. Holds its shape wash after wash.',
    details: ['240 gsm cotton jersey', 'Boxy, slightly cropped fit', 'Thick ribbed collar', 'Screen-printed front and back'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-BXT-WHT-XS', stock: 5, paymentLink: '' },
      { size: 'S', sku: 'KRB-BXT-WHT-S', stock: 12, paymentLink: '' },
      { size: 'M', sku: 'KRB-BXT-WHT-M', stock: 15, paymentLink: '' },
      { size: 'L', sku: 'KRB-BXT-WHT-L', stock: 14, paymentLink: '' },
      { size: 'XL', sku: 'KRB-BXT-WHT-XL', stock: 8, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-BXT-WHT-XXL', stock: 4, paymentLink: '' },
    ],
  },
  {
    id: 'boxy-tee-black',
    name: 'Boxy Logo Tee',
    colour: { name: 'Black', hex: '#1c1c1e' },
    group: 'boxy-tee',
    category: 'tees',
    garment: 'tee',
    price: 3900,
    salePrice: null,
    featured: false,
    createdAt: '2026-08-15',
    images: [],
    description:
      'A wide, cropped tee in 240 gsm cotton jersey with a small chest logo and a bold back print. Holds its shape wash after wash.',
    details: ['240 gsm cotton jersey', 'Boxy, slightly cropped fit', 'Thick ribbed collar', 'Screen-printed front and back'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-BXT-BLK-XS', stock: 3, paymentLink: '' },
      { size: 'S', sku: 'KRB-BXT-BLK-S', stock: 10, paymentLink: '' },
      { size: 'M', sku: 'KRB-BXT-BLK-M', stock: 11, paymentLink: '' },
      { size: 'L', sku: 'KRB-BXT-BLK-L', stock: 9, paymentLink: '' },
      { size: 'XL', sku: 'KRB-BXT-BLK-XL', stock: 6, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-BXT-BLK-XXL', stock: 2, paymentLink: '' },
    ],
  },
  {
    id: 'night-shift-tee-orange',
    name: 'Night Shift Graphic Tee',
    colour: { name: 'Signal Orange', hex: '#ff5a1f' },
    group: 'night-shift-tee',
    category: 'tees',
    garment: 'tee',
    print: 'NIGHT SHIFT',
    price: 4500,
    salePrice: 3400,
    featured: false,
    createdAt: '2026-06-10',
    images: [],
    description:
      'Loud colour, louder print. Our boxy tee in high-visibility orange with an oversized puff-print graphic on the front.',
    details: ['240 gsm cotton jersey', 'Boxy fit', 'Oversized puff print', 'Limited run'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-NST-ORG-XS', stock: 0, paymentLink: '' },
      { size: 'S', sku: 'KRB-NST-ORG-S', stock: 2, paymentLink: '' },
      { size: 'M', sku: 'KRB-NST-ORG-M', stock: 4, paymentLink: '' },
      { size: 'L', sku: 'KRB-NST-ORG-L', stock: 3, paymentLink: '' },
      { size: 'XL', sku: 'KRB-NST-ORG-XL', stock: 1, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-NST-ORG-XXL', stock: 0, paymentLink: '' },
    ],
  },
  {
    id: 'utility-cargo-black',
    name: 'Utility Cargo Pants',
    colour: { name: 'Black', hex: '#232325' },
    group: 'utility-cargo',
    category: 'pants',
    garment: 'cargo',
    price: 11000,
    salePrice: null,
    featured: true,
    createdAt: '2026-10-01',
    images: [],
    description:
      'Relaxed cargos in a tough cotton ripstop with bellowed thigh pockets and toggle hems you can cinch or leave wide.',
    details: ['Cotton ripstop, 280 gsm', 'Relaxed, straight leg', 'Six pockets incl. two bellowed cargo pockets', 'Adjustable toggle hem'],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-UCP-BLK-XS', stock: 2, paymentLink: '' },
      { size: 'S', sku: 'KRB-UCP-BLK-S', stock: 6, paymentLink: '' },
      { size: 'M', sku: 'KRB-UCP-BLK-M', stock: 8, paymentLink: '' },
      { size: 'L', sku: 'KRB-UCP-BLK-L', stock: 7, paymentLink: '' },
      { size: 'XL', sku: 'KRB-UCP-BLK-XL', stock: 3, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-UCP-BLK-XXL', stock: 1, paymentLink: '' },
    ],
  },
  {
    id: 'utility-cargo-stone',
    name: 'Utility Cargo Pants',
    colour: { name: 'Stone', hex: '#b9ad92' },
    group: 'utility-cargo',
    category: 'pants',
    garment: 'cargo',
    price: 11000,
    salePrice: null,
    featured: false,
    createdAt: '2026-10-01',
    images: [],
    description:
      'Relaxed cargos in a tough cotton ripstop with bellowed thigh pockets and toggle hems you can cinch or leave wide.',
    details: ['Cotton ripstop, 280 gsm', 'Relaxed, straight leg', 'Six pockets incl. two bellowed cargo pockets', 'Adjustable toggle hem'],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-UCP-STN-XS', stock: 0, paymentLink: '' },
      { size: 'S', sku: 'KRB-UCP-STN-S', stock: 2, paymentLink: '' },
      { size: 'M', sku: 'KRB-UCP-STN-M', stock: 0, paymentLink: '' },
      { size: 'L', sku: 'KRB-UCP-STN-L', stock: 1, paymentLink: '' },
      { size: 'XL', sku: 'KRB-UCP-STN-XL', stock: 3, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-UCP-STN-XXL', stock: 0, paymentLink: '' },
    ],
  },
  {
    id: 'nylon-cargo-shorts-charcoal',
    name: 'Nylon Cargo Shorts',
    colour: { name: 'Charcoal', hex: '#3d3f42' },
    group: 'nylon-cargo-shorts',
    category: 'pants',
    garment: 'shorts',
    price: 6500,
    salePrice: null,
    featured: false,
    createdAt: '2026-06-01',
    images: [],
    description:
      'Quick-dry nylon shorts with an elastic waist, internal drawcord and a zip cargo pocket. Back in stock next summer.',
    details: ['100% recycled nylon', 'Elastic waist with drawcord', 'Zip cargo pocket', '7" inseam'],
    sizeGuide: 'bottoms',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-NCS-CHR-XS', stock: 0, paymentLink: '' },
      { size: 'S', sku: 'KRB-NCS-CHR-S', stock: 0, paymentLink: '' },
      { size: 'M', sku: 'KRB-NCS-CHR-M', stock: 0, paymentLink: '' },
      { size: 'L', sku: 'KRB-NCS-CHR-L', stock: 0, paymentLink: '' },
      { size: 'XL', sku: 'KRB-NCS-CHR-XL', stock: 0, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-NCS-CHR-XXL', stock: 0, paymentLink: '' },
    ],
  },
  {
    id: 'coach-jacket-cobalt',
    name: 'Coach Jacket',
    colour: { name: 'Cobalt', hex: '#1f4fd8' },
    group: 'coach-jacket',
    category: 'outerwear',
    garment: 'jacket',
    price: 13000,
    salePrice: 9900,
    featured: true,
    createdAt: '2026-09-05',
    images: [],
    description:
      'A water-resistant coach jacket with a soft mesh lining, snap front and a drawcord hem. Big back print, easy layer.',
    details: ['Water-resistant nylon shell', 'Mesh lining', 'Snap front, drawcord hem', 'Large back print'],
    sizeGuide: 'tops',
    paymentLink: '',
    sizes: [
      { size: 'XS', sku: 'KRB-CJK-COB-XS', stock: 1, paymentLink: '' },
      { size: 'S', sku: 'KRB-CJK-COB-S', stock: 3, paymentLink: '' },
      { size: 'M', sku: 'KRB-CJK-COB-M', stock: 4, paymentLink: '' },
      { size: 'L', sku: 'KRB-CJK-COB-L', stock: 4, paymentLink: '' },
      { size: 'XL', sku: 'KRB-CJK-COB-XL', stock: 2, paymentLink: '' },
      { size: 'XXL', sku: 'KRB-CJK-COB-XXL', stock: 1, paymentLink: '' },
    ],
  },
  {
    id: 'six-panel-cap-black',
    name: 'Six-Panel Cap',
    colour: { name: 'Black', hex: '#1c1c1e' },
    group: 'six-panel-cap',
    category: 'headwear',
    garment: 'cap',
    price: 3500,
    salePrice: null,
    featured: false,
    createdAt: '2026-08-01',
    images: [],
    description:
      'A low-profile six-panel cap in washed cotton twill with an embroidered front logo and a metal-buckle strap.',
    details: ['Washed cotton twill', 'Low-profile, curved brim', 'Embroidered logo', 'Adjustable metal-buckle strap'],
    sizeGuide: 'headwear',
    paymentLink: '',
    sizes: [{ size: 'One size', sku: 'KRB-6PC-BLK-OS', stock: 20, paymentLink: '' }],
  },
  {
    id: 'ribbed-beanie-rust',
    name: 'Ribbed Beanie',
    colour: { name: 'Rust', hex: '#b5502a' },
    group: 'ribbed-beanie',
    category: 'headwear',
    garment: 'beanie',
    price: 2900,
    salePrice: null,
    featured: false,
    createdAt: '2026-10-10',
    images: [],
    description:
      'A chunky rib-knit beanie with a deep turn-up cuff and a woven label. Warm without the itch.',
    details: ['Merino wool blend', 'Deep turn-up cuff', 'Woven label', 'One size'],
    sizeGuide: 'headwear',
    paymentLink: '',
    sizes: [{ size: 'One size', sku: 'KRB-RBN-RST-OS', stock: 3, paymentLink: '' }],
  },
];
