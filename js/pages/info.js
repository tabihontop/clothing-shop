// Shipping / returns / privacy / terms pages: static HTML content,
// title and description come from data attributes on <main>.

import { initLayout } from '../layout.js';

const main = document.getElementById('main');
initLayout({
  title: main.dataset.title,
  description: main.dataset.description,
});
