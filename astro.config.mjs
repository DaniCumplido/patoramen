import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

const brand = JSON.parse(readFileSync(new URL('./src/data/brand.json', import.meta.url), 'utf-8'));

// Astro 4 "hybrid": every page is prerendered (SSG) by default; only
// src/pages/api/reservar.ts opts out with `export const prerender = false`.
export default defineConfig({
  site: brand.seo.siteUrl,
  output: 'hybrid',
  adapter: node({ mode: 'standalone' }),
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  devToolbar: { enabled: false },
});
