import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const brand = JSON.parse(readFileSync(new URL('./src/data/brand.json', import.meta.url), 'utf-8'));

export default defineConfig({
  site: brand.seo.siteUrl,
  base: '/patoramen/',
  output: 'static',
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  devToolbar: { enabled: false },
});
