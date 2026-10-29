/**
 * M3 · srcset de banners (768 / 1280 / 1920 px, WebP ≤ 250 KB). Solo aplica a
 * las imágenes locales que tienen variantes generadas en /public; para
 * cualquier otra URL (CDN del admin, etc.) devuelve undefined y el <img> usa su src.
 */
const WITH_VARIANTS = new Set(['home', 'banner-catalog', 'confirmation-banner', 'img-subs', 'footer', 'bg-black-feature']);

export function bannerSrcSet(url?: string | null): string | undefined {
  const m = url?.match(/^\/([\w-]+)\.webp$/);
  if (!m || !WITH_VARIANTS.has(m[1])) return undefined;
  return [768, 1280, 1920].map((w) => `/${m[1]}-${w}.webp ${w}w`).join(', ');
}

export const BANNER_SIZES = '100vw';
