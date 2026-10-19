# KERB streetwear shop (static)

A small online clothing shop built with plain HTML, CSS and JavaScript (ES modules).
There is no server and no build step, so any static host can serve it, including
GitHub Pages for free.

- Products live in `js/data/products.js`.
- Brand name, currency, shipping rules and checkout mode live in `js/config.js`.
- The cart is saved in the visitor's browser (`localStorage`).
- Payment uses **Stripe Payment Links** (hosted by Stripe). Until you add links,
  checkout runs in a clearly labelled **demo mode** and charges nothing.

---

## 1. Run it locally

ES modules do not load from `file://`, so open the site through a local web server.
On Windows, with nothing to install: **double-click `start.bat`**. It serves the
shop at http://localhost:8090 and opens your browser.

Or, from inside this folder, if you have Node.js or Python:

```bash
npx serve .                 # Node.js, then open the URL it prints
python -m http.server 8000  # Python, then open http://localhost:8000
```

Stop the server with Ctrl+C.

Logic tests (pricing, cart, catalog, payment links):

```bash
node tests/logic.test.js    # Node 18+
npm run check               # node --check on every JS file
```

or open `http://localhost:<port>/tests/` in a browser while the server runs.

## 2. Files

```
index.html          Home: hero, featured products, categories
shop.html           Catalog: ?category=hoodies&sort=price-asc (shareable URLs)
product.html        Product page: product.html?id=<product id>
checkout.html       Order summary + Stripe payment buttons (or demo mode)
thank-you.html      Where Stripe sends customers after paying
shipping.html, returns.html, privacy.html, terms.html   Policy TEMPLATES - edit before launch
css/styles.css      All styles (colours and fonts at the top in :root)
js/config.js        Brand, currency, locale, shipping, checkout mode
js/data/products.js Products, categories, size guides
js/images.js        Real photos or generated placeholder drawings
js/cart.js, js/pricing.js, js/catalog.js, js/payment.js   Pure logic (tested)
js/store.js         Cart in localStorage
js/layout.js, js/cart-drawer.js, js/components.js, js/seo.js, js/dom.js   UI
js/pages/*.js       One script per page
tests/              Logic tests (Node or browser)
images/products/    Put your product photos here
```

## 3. Change the brand name, shipping and returns

Open `js/config.js`:

| Setting | What it does |
| --- | --- |
| `brand.name` | Shop name everywhere: header, footer, titles, placeholder prints, policy pages |
| `brand.tagline`, `brand.description` | Home page title and default meta description |
| `brand.email` | Contact email in footer and policy pages |
| `currency`, `locale` | `EUR` and `en-IE` (shows `€89.00`). Keep one locale. |
| `shipping.flatFee` | Shipping in **cents** below the threshold (495 = €4.95) |
| `shipping.freeThreshold` | Free shipping at or above this subtotal in **cents** (10000 = €100) |
| `shipping.region`, `shipping.deliveryEstimate` | Text on the banner and shipping page |
| `returnsDays` | Return window shown on the site |
| `checkout.mode` | `'auto'` (default) or `'demo'` (always demo) |

The home page hero text is plain HTML in `index.html`. Colours and fonts are at the
top of `css/styles.css`.

## 4. Edit products

Open `js/data/products.js`. The comment at the top explains every field. Rules:

- **Prices are integer cents.** `8900` means €89.00. Never write `89.00`.
- `salePrice` is `null`, or a cents value lower than `price` (shows a red sale price
  and a % badge).
- Each entry in `sizes` is one variant with its own `sku` and `stock`.
  `stock: 0` shows the size crossed out and it cannot be picked. If every size is 0
  the product shows "Sold out".
- Caps and other one-size items have a single size: `{ size: 'One size', ... }`.
- Products with the same `group` are linked as colour options of each other
  (e.g. the black and bone hoodie).
- `featured: true` puts a product on the home page.
- `createdAt` drives "Newest" sorting and the NEW badge (30 days).
- Categories and size-guide tables are at the top of the same file.

If you make a mistake (duplicate id, decimal price, unknown category...), the browser
console shows a warning listing the problems, and `node tests/logic.test.js` fails.

**Stock is not updated automatically.** With no server, nothing decrements stock
when someone pays. Update the numbers yourself after orders (see "Limitations").

## 5. Add real photos

1. Save photos in `images/products/`, ideally 4:5 portrait (e.g. 1200 x 1500 px),
   compressed JPG or WebP under ~300 KB each.
2. List them on the product, first one is the main image:

   ```js
   images: ['images/products/heavyweight-hoodie-black-1.jpg',
            'images/products/heavyweight-hoodie-black-2.jpg'],
   ```

3. Leave `images: []` to keep the generated placeholder drawing.

Alt text is generated from the product name and colour. Real photos are also added
to the product's structured data (Google needs a real image for rich results;
placeholders are left out on purpose).

## 6. Take payments with Stripe Payment Links

### Why Payment Links

A static site has no server, so it cannot safely calculate a price and create a
payment: anything the browser sends could be edited. A Stripe **Payment Link** is a
checkout page hosted by Stripe whose price is fixed in your Stripe Dashboard. The
customer cannot change it, and card details never touch this site.

### Set it up (test mode first)

1. Create a Stripe account at https://dashboard.stripe.com and switch on
   **Test mode** (toggle in the Dashboard).
2. **Product catalog > Add product.** Create one product per item **and size**,
   e.g. "Heavyweight Hoodie - Black - M", price €89.00 (one-off, EUR). Use the sale
   price if the item is on sale.
3. **Payment Links > New.** Pick that product, then:
   - **Collect customers' addresses**: on, shipping address, allowed countries =
     the countries you ship to.
   - **Shipping rates**: add your rate (e.g. €4.95 "Standard", and/or €0 "Free").
     See the limitation below.
   - **Let customers adjust quantity**: on, with a maximum equal to your stock.
   - **Limit the number of payments** (Advanced options): set it to your stock for
     that size, so Stripe stops selling when you run out.
   - **After payment**: "Don't show confirmation page", redirect to
     `https://<your-site>/thank-you.html`.
   - Optional: enable Stripe Tax or add your VAT details in Settings.
4. Copy the link (starts with `https://buy.stripe.com/test_...`).
5. Paste it into `js/data/products.js` on the matching size:

   ```js
   { size: 'M', sku: 'KRB-HHD-BLK-M', stock: 12, paymentLink: 'https://buy.stripe.com/test_abc123' },
   ```

   You can instead put one link on the product (`paymentLink` next to `price`) and
   add a **custom field** "Size" (dropdown) to that link, but per-size links are
   safer because the customer cannot pick the wrong size.
6. Reload the checkout page: the demo box is replaced by "Pay on Stripe" buttons.
   Pay with Stripe's test card `4242 4242 4242 4242`, any future date, any CVC.
7. Check the payment in the Dashboard (**Payments**). The SKU is attached to each
   payment as `client_reference_id`, so you can see which size was bought.
8. When it all works, switch Stripe to **live mode**, recreate the products and
   links there (test links do not work live), and paste the live links.

Orders are confirmed by Stripe (Dashboard and email receipt), **not** by the
thank-you page: anyone can open that URL. Fulfil orders from the Stripe Dashboard
(you can turn on email notifications for successful payments).

### Limitations of Payment Links (read this)

- **One payment per item.** A Payment Link sells one product. A cart with three
  different items means three separate payments: the checkout page lists a "Pay on
  Stripe" button for each, and the thank-you page takes paid items out of the cart.
  This is honest and safe, but clunky for big carts.
- **Shipping is per payment.** The "free over €100" rule shown in the cart cannot be
  applied across separate payments. Stripe charges whatever shipping rate you put on
  each link. Simple workarounds: offer free shipping on every link and build it into
  prices, or put a flat rate on cheap items and free shipping on items over €100.
- **Quantity is set on Stripe's page.** The checkout tells customers how many to choose.
- **Stock is not synced.** Use "Limit the number of payments" on each link and update
  `stock` in `products.js` after sales.
- **No discount codes** from this site (Stripe Promotion codes can be enabled per link).

### The upgrade path: one checkout for the whole cart

When one-payment-per-item is no longer good enough, add a single small serverless
function (Netlify Functions, Vercel, or a Cloudflare Worker, all with free tiers):

1. The browser sends only `[{ sku, qty }]` to the function.
2. The function looks up prices **on the server** (from Stripe Prices or its own copy
   of the catalog), checks stock, and creates a **Stripe Checkout Session** with all
   items and the correct shipping rate (free over €100).
3. The browser is redirected to the Checkout Session URL.
4. A **webhook** (`checkout.session.completed`, signature verified) records the order
   and decrements stock.

The secret Stripe key lives only in the function's environment variables, never in
this repository. The cart, product data and pages of this site can stay as they are;
only `js/pages/checkout.js` changes to call the function.

Other no-code options with a real multi-item cart: Shopify Buy Button (Starter plan)
or Snipcart, both of which check prices on their own servers.

## 7. Publish on GitHub Pages (free)

1. Create a repository on GitHub, e.g. `kerb-shop`, and push this folder's contents
   to it (the files must be at the repository root, so `index.html` is at the top).
   ```bash
   git init
   git add .
   git commit -m "First version of the shop"
   git branch -M main
   git remote add origin https://github.com/<you>/kerb-shop.git
   git push -u origin main
   ```
2. On GitHub: **Settings > Pages > Build and deployment > Source: Deploy from a branch**,
   branch `main`, folder `/ (root)`, Save.
3. After a minute the site is live at `https://<you>.github.io/kerb-shop/`.
4. Update the Stripe Payment Links' redirect to
   `https://<you>.github.io/kerb-shop/thank-you.html`.

All links in the site are relative, so it works in a sub-folder like `/kerb-shop/`.
The empty `.nojekyll` file tells GitHub Pages to serve the files as they are.
For a custom domain, see Settings > Pages > Custom domain.

## 8. Before you go live: checklist

- [ ] Brand name, email, shipping rules in `js/config.js`
- [ ] Real products, prices (cents), stock and photos
- [ ] Rewrite `shipping.html`, `returns.html`, `privacy.html`, `terms.html` (they are
      marked as templates; add your legal business details; EU law applies)
- [ ] Stripe live mode links pasted, tested once with a real small payment and refunded
- [ ] Test on a phone: add to cart, change quantity, checkout

## Limitations of a static shop

- Prices on the page and in the cart are for display; the amount actually charged is
  always the one set in Stripe. Keep them in sync.
- Stock is a number in a file: two customers can buy the last item at the same time
  unless the Payment Link's payment limit stops it.
- No customer accounts, order history or admin screen: Stripe's Dashboard is your
  order list.
- Product pages are rendered with JavaScript. Google renders JavaScript and reads
  the titles, descriptions and Product JSON-LD, but some other crawlers and link
  previews may only see the generic page title. There is no sitemap yet, because it
  needs your final domain: add a `sitemap.xml` listing `product.html?id=...` URLs
  once you know it.
- Fonts load from Google Fonts (mentioned in the privacy template). Self-host them if
  you prefer not to.
