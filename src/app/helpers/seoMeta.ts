import { productUrl } from '@/app/helpers/productUrl';
import type { Combo, Product } from '@/app/types/global.types';
import { CONTACT_DEFAULTS, type Contact } from '@/app/lib/contact';

export const SITE_ORIGIN = 'https://nondecants.com';

/** Copy de la tarjeta al compartir (WhatsApp, Linktree, Facebook). */
export const SHARE_DESCRIPTION =
  'Perfumes y decants sellados al mejor precio 100% originales.';
export const SHARE_TITLE = `NonDecants — ${SHARE_DESCRIPTION.replace(/\.$/, '')}`;

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalized, SITE_ORIGIN).href;
}

export function absoluteImageUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  return absoluteUrl(url);
}

export function clipMeta(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`;
}

/** TypeORM `decimal` llega como string en JSON. Number() antes de toFixed. */
export function formatUsd(amount: number | string): string {
  const n = Number(amount);
  return Number.isFinite(n) ? n.toFixed(2).replace('.', ',') : '0,00';
}

const GENDER_LABEL: Record<string, string> = {
  HOMBRE: 'hombre',
  MUJER: 'mujer',
  UNISEX: 'unisex',
};

const CONCENTRATION_LABEL: Record<string, string> = {
  EAU_DE_PARFUM: 'Eau de Parfum',
  EAU_DE_TOILETTE: 'Eau de Toilette',
  EAU_DE_TOILETTE_INTENSE: 'Eau de Toilette Intense',
  EAU_DE_COLOGNE: 'Eau de Cologne',
  BODY_MIST: 'Body mist',
  ELIXIR: 'Elixir',
  PARFUM: 'Parfum',
  EXTRAIT_DE_PARFUM: 'Extrait de Parfum',
};

export function organizationJsonLd(contact: Contact = CONTACT_DEFAULTS) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NonDecants',
    url: SITE_ORIGIN,
    logo: absoluteUrl('/favicon.png'),
    sameAs: [contact.instagram, contact.tiktok],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: `+${contact.whatsapp}`,
      contactType: 'customer service',
      areaServed: 'EC',
      availableLanguage: ['Spanish'],
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EC',
    },
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'NonDecants',
    url: SITE_ORIGIN,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_ORIGIN}/catalogo?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };
}

/** Imágenes del home para que Google pueda armar miniaturas en la SERP. */
export function homepageBannersJsonLd(
  banners: Array<{ title?: string; subtitle?: string; imageUrl?: string; image?: string }>,
) {
  const images = banners
    .map((banner) => ({
      url: absoluteImageUrl(banner.imageUrl || banner.image),
      name: (banner.title || 'NonDecants').trim(),
      description: (banner.subtitle || banner.title || 'Perfumes originales en Ecuador').trim(),
    }))
    .filter((item): item is { url: string; name: string; description: string } => Boolean(item.url));

  if (!images.length) return undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Banners NonDecants',
    numberOfItems: images.length,
    itemListElement: images.map((image, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'ImageObject',
        contentUrl: image.url,
        url: image.url,
        name: image.name,
        description: image.description,
      },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function productDisplayName(product: Product): string {
  const marca = product.marca?.name?.trim();
  const name = product.name.trim();
  if (marca && name.toLowerCase().startsWith(marca.toLowerCase())) return name;
  return [marca, name].filter(Boolean).join(' ');
}

export function minOfferPrice(product: Product): number | undefined {
  const prices = [
    product.minFormatPrice,
    product.price,
    ...(product.formats ?? []).map((format) => format.price),
    ...(product.variants ?? []).map((variant) => variant.price),
  ].filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  return prices.length > 0 ? Math.min(...prices) : undefined;
}

export function maxOfferPrice(product: Product): number | undefined {
  const prices = [
    product.maxFormatPrice,
    product.price,
    ...(product.formats ?? []).map((format) => format.price),
    ...(product.variants ?? []).map((variant) => variant.price),
  ].filter((value): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0);
  return prices.length > 0 ? Math.max(...prices) : undefined;
}

function schemaAvailability(inStock: boolean, backorder: boolean): string {
  if (inStock) return 'https://schema.org/InStock';
  if (backorder) return 'https://schema.org/BackOrder';
  return 'https://schema.org/OutOfStock';
}

export function productSeoTitle(product: Product): string {
  return `${productDisplayName(product)} original | NonDecants`;
}

export function productSeoDescription(product: Product): string {
  const name = productDisplayName(product);
  const raw = (product.description || product.detailDescription || '')
    .replace(/\s+/g, ' ')
    .trim();
  // El bloque editorial "El proceso" está quemado en todas las PDP; si alguien
  // lo pegó en la descripción del producto, no debe salir en Google/WhatsApp.
  const body =
    raw && !/^el proceso\b/i.test(raw) && !/cada decant se extrae/i.test(raw)
      ? raw
      : '';
  const bits = [
    product.concentration ? CONCENTRATION_LABEL[product.concentration] : '',
    product.gender ? GENDER_LABEL[product.gender] : '',
  ].filter(Boolean);
  const min = minOfferPrice(product);
  const priceBit = min != null ? `desde $${formatUsd(min)}` : 'decant o frasco sellado';
  if (body) return clipMeta(`${name}. ${body}`);
  return clipMeta(
    `${name} original en Ecuador. ${bits.join(', ')}${bits.length ? '. ' : ''}${priceBit}.`,
  );
}

export function productJsonLd(product: Product) {
  const images = [
    product.image,
    product.imageUrl,
    ...(product.images ?? []),
  ]
    .map((url) => absoluteImageUrl(url))
    .filter((url, index, list): url is string => !!url && list.indexOf(url) === index);

  const formats = (product.formats?.length ? product.formats : undefined) ??
    product.variants.map((variant) => ({
      id: variant.id,
      ml: variant.ml || variant.mlSize,
      price: variant.price,
      isFullBottle: variant.isFullBottle,
      availableQuantity: variant.availableQuantity,
    }));

  const offers = formats.map((format) => {
    const isDecant = !format.isFullBottle;
    const inStock = isDecant
      ? (product.availableMl ?? 0) > 0 || ('availableQuantity' in format && Number(format.availableQuantity) > 0)
      : ('availableQuantity' in format && Number(format.availableQuantity) > 0) || (product.stock ?? 0) > 0;
    return {
      '@type': 'Offer',
      name: isDecant ? `Decant ${format.ml} ml` : `Frasco sellado ${format.ml} ml`,
      price: Number(format.price).toFixed(2),
      priceCurrency: 'USD',
      availability: schemaAvailability(inStock, !!product.bajoPedido || (!inStock && !isDecant)),
      url: absoluteUrl(productUrl(product)),
    };
  });

  const low = minOfferPrice(product);
  const high = maxOfferPrice(product);
  const anyInStock = offers.some((offer) => offer.availability === 'https://schema.org/InStock');
  const aggregateOffers = offers.length
    ? {
        '@type': 'AggregateOffer',
        priceCurrency: 'USD',
        lowPrice: low != null ? low.toFixed(2) : undefined,
        highPrice: high != null ? high.toFixed(2) : undefined,
        offerCount: offers.length,
        availability: schemaAvailability(anyInStock, !!product.bajoPedido),
        offers,
      }
    : undefined;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: productDisplayName(product),
    description: clipMeta(product.description || product.detailDescription || productDisplayName(product), 300),
    image: images,
    brand: product.marca?.name
      ? { '@type': 'Brand', name: product.marca.name }
      : undefined,
    sku: String(product.id),
    url: absoluteUrl(productUrl(product)),
    additionalProperty: [
      product.concentration
        ? { '@type': 'PropertyValue', name: 'Concentración', value: CONCENTRATION_LABEL[product.concentration] ?? product.concentration }
        : undefined,
      product.gender
        ? { '@type': 'PropertyValue', name: 'Género', value: GENDER_LABEL[product.gender] ?? product.gender }
        : undefined,
    ].filter((item) => item != null),
    offers: aggregateOffers,
  };
}

export function comboSeoDescription(combo: Combo): string {
  const base = combo.description?.trim() || `Combo ${combo.name} de perfumes originales en Ecuador.`;
  const price = Number(combo.finalPrice);
  const priceBit = Number.isFinite(price) && price > 0 ? ` Desde $${formatUsd(price)}` : '';
  return clipMeta(`${base}${priceBit} · envío 24–72 h.`);
}

export function articleJsonLd(post: {
  title: string;
  excerpt?: string | null;
  imageUrl?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  slug: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: clipMeta(post.excerpt || post.title),
    image: absoluteImageUrl(post.imageUrl),
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt || post.publishedAt || post.createdAt,
    author: { '@type': 'Organization', name: 'NonDecants' },
    publisher: {
      '@type': 'Organization',
      name: 'NonDecants',
      logo: { '@type': 'ImageObject', url: absoluteUrl('/favicon.png') },
    },
    mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
