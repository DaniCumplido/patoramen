import type { APIRoute } from 'astro';
import { isProduction, siteUrl } from '../lib/seo';

export const GET: APIRoute = () =>
  new Response(
    isProduction
      ? `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap-index.xml\n`
      : `User-agent: *\nDisallow: /\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
