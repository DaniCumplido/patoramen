import { defineConfig } from 'astro/config';
import { readFileSync } from 'node:fs';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const brand = JSON.parse(readFileSync(new URL('./src/data/brand.json', import.meta.url), 'utf-8'));

// Production URL by default; the GitHub Pages preview overrides it with SITE_URL.
const siteUrl = process.env.SITE_URL || brand.seo.siteUrl;
// '/' on a custom domain, '/patoramen/' on the GitHub Pages preview
const base = new URL(siteUrl).pathname;
const basePrefix = base.replace(/\/$/, '');

// Local asset paths in brand.json ('/foo.jpg' or the legacy '/patoramen/foo.jpg') get the deploy base prepended.
const ASSET = /^\/[\w./-]+\.(?:jpe?g|png|webp|svg|avif|gif)$/i;
const brandBase = () => ({
  name: 'brand-base-path',
  enforce: 'pre',
  transform(code, id) {
    if (!id.split('?')[0].endsWith('src/data/brand.json')) return null;
    const walk = (v) => {
      if (typeof v === 'string') return ASSET.test(v) ? basePrefix + v.replace(/^\/patoramen(?=\/)/, '') : v;
      if (Array.isArray(v)) return v.map(walk);
      if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, walk(x)]));
      return v;
    };
    return { code: JSON.stringify(walk(JSON.parse(code))), map: null };
  },
});

export default defineConfig({
  site: siteUrl,
  base,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    sitemap({
      filter: (page) => !/\/(404|aviso-legal|politica-de-privacidad|politica-de-cookies)\/?$/.test(page),
      changefreq: 'weekly',
      priority: 0.8,
      lastmod: new Date(),
    }),
  ],
  vite: { plugins: [brandBase()] },
  devToolbar: { enabled: false },
});
