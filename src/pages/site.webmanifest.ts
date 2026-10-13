import type { APIRoute } from 'astro';
import brand from '../data/brand.json';
import { withBase } from '../lib/seo';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      name: 'Pato Ramen · 缘味 | Restaurante asiático en Barcelona',
      short_name: 'Pato Ramen',
      description: brand.seo.description,
      lang: brand.seo.lang,
      start_url: withBase(''),
      scope: withBase(''),
      display: 'standalone',
      background_color: brand.colors.background,
      theme_color: brand.seo.themeColor,
      icons: [
        { src: withBase('icon-192.png'), sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: withBase('icon-512.png'), sizes: '512x512', type: 'image/png', purpose: 'any' },
      ],
    }),
    { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } },
  );
