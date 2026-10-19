// ---------------------------------------------------------------------------
// Shop settings. This is the ONE place to change the brand name, currency,
// shipping rules and checkout mode. Every page reads from here.
// Money values are integer cents (e.g. 495 = €4.95). Never use decimals.
// ---------------------------------------------------------------------------

export const config = {
  brand: {
    name: 'NOCTURN',
    tagline: 'Street-level essentials',
    description:
      'Clothes for the hours after 22:00. Every piece carries a reflective Night Mark: quiet by day, lit by headlights.',
    email: 'hello@example.com', // shown in the footer and on the policy pages
  },

  // Currency and number formatting. Pick one locale and keep it.
  // 'en-IE' shows euros as "€89.00".
  currency: 'EUR',
  locale: 'en-IE',

  // EU shops show prices including VAT.
  pricesIncludeVat: true,

  shipping: {
    flatFee: 495, // cents, charged when the subtotal is below freeThreshold
    freeThreshold: 10000, // cents, subtotal at or above this ships free (€100)
    region: 'EU',
    deliveryEstimate: '2-5 working days',
  },

  returnsDays: 30,

  checkout: {
    // 'auto': use Stripe Payment Links for items that have one; if no item in
    //         the cart has a link, show the demo-mode order summary.
    // 'demo': always show the demo-mode order summary (no payment buttons).
    mode: 'auto',
  },

  // localStorage key for the cart. Changing it empties everyone's cart.
  cartStorageKey: 'streetwear-shop-cart-v1',
};
