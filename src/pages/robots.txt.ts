export const prerender = true;

import type { APIRoute } from 'astro';
import { SITE_ORIGIN } from '@/app/helpers/seoMeta';

export const GET: APIRoute = () => {
  const body = [
    'User-agent: *',
    'Allow: /',
    'Disallow: /carrito',
    'Disallow: /carrito/',
    'Disallow: /checkout',
    'Disallow: /checkout/',
    'Disallow: /cuenta',
    'Disallow: /mi-cuenta',
    'Disallow: /mi-cuenta/',
    'Disallow: /orden/',
    'Disallow: /confirmacion',
    'Disallow: /confirmacion/',
    'Disallow: /verificar-email',
    'Disallow: /restablecer-contrasena',
    'Disallow: /rastrear',
    '',
    `Sitemap: ${SITE_ORIGIN}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
