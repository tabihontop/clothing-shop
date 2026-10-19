// Small DOM helpers shared by all pages.

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Escape text before putting it into innerHTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ESC[c]);
}

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** Announce a message to screen readers via the shared live region. */
export function announce(message) {
  // While a modal dialog is open the rest of the page is inert, so speak from
  // inside the dialog.
  const dialogRegion = document.querySelector('dialog[open] [data-status]');
  if (dialogRegion) {
    dialogRegion.textContent = '';
    setTimeout(() => {
      dialogRegion.textContent = message;
    }, 50);
    return;
  }
  let region = document.getElementById('a11y-status');
  if (!region) {
    region = document.createElement('div');
    region.id = 'a11y-status';
    region.className = 'sr-only';
    region.setAttribute('role', 'status');
    region.setAttribute('aria-live', 'polite');
    document.body.append(region);
  }
  region.textContent = '';
  // a tick later so repeated identical messages are still read
  setTimeout(() => {
    region.textContent = message;
  }, 50);
}
