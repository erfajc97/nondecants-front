import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import {
  MOCK_BANNERS_RAW,
  MOCK_BLOG_RAW,
  MOCK_CATEGORIES_RAW,
  MOCK_COMBOS_RAW,
  MOCK_PRODUCTS_RAW,
  MOCK_REVIEWS_RAW,
  MOCK_SECTIONS_RAW,
  MOCK_SETTINGS_RAW,
} from './fixtures';
import { searchProducts } from '../lib/searchIndex';

/**
 * Adaptador de axios para el ambiente de demostración (VITE_DEMO=true): responde
 * las lecturas públicas con los datos de `fixtures.ts`, con el mismo envoltorio
 * que el backend ({ statusCode, message, data }). Funciona igual en SSR y en el
 * navegador, así que el backend y los .env no hacen falta.
 */

const ok = (config: InternalAxiosRequestConfig, data: unknown): AxiosResponse => ({
  data: { statusCode: 200, message: 'Success', data },
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
});

const fail = (config: InternalAxiosRequestConfig, status: number, message: string) => {
  const response: AxiosResponse = {
    data: { statusCode: status, message },
    status,
    statusText: message,
    headers: {},
    config,
  };
  return new AxiosError(message, AxiosError.ERR_BAD_RESPONSE, config, null, response);
};

const num = (v: unknown): number | undefined => (v === undefined || v === '' || v === null ? undefined : Number(v));

function listProducts(q: Record<string, any>) {
  let rows = MOCK_PRODUCTS_RAW.filter((p) => p.isActive);

  const search = String(q.search ?? '').trim();
  if (search) {
    // Mismo criterio que el buscador (G1): nombre, marca, notas, ocasión, género, descripción y precio 3 ml.
    const ids = new Set(searchProducts(rows, search).hits.map((h) => (h.product as { id: unknown }).id));
    rows = rows.filter((p) => ids.has(p.id));
  }
  if (q.bajoPedido !== undefined) rows = rows.filter((p) => p.bajoPedido === (String(q.bajoPedido) === 'true'));
  if (q.categoryId) rows = rows.filter((p) => p.categoryId === String(q.categoryId));
  if (q.marcaId) rows = rows.filter((p) => p.marcaId === String(q.marcaId));
  if (q.gender) rows = rows.filter((p) => p.gender === q.gender);
  if (q.timeOfDay) rows = rows.filter((p) => p.timeOfDay === q.timeOfDay);
  if (q.concentration) rows = rows.filter((p) => p.concentration === q.concentration);
  if (q.projection) rows = rows.filter((p) => p.projection === q.projection);
  // Filtros del catálogo nuevo (valores separados por coma).
  const list = (v: unknown) => String(v ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const nrm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  const marcaIds = list(q.marcaIds);
  if (marcaIds.length) rows = rows.filter((p) => marcaIds.includes(p.marcaId));
  const momentos = list(q.momentos).map(nrm);
  if (momentos.length) rows = rows.filter((p) => p.occasion.some((o) => momentos.includes(nrm(o))));
  const notes = list(q.notes).map(nrm);
  if (notes.length)
    rows = rows.filter((p) => p.scentSections.some((s) => s.notes.some((n) => notes.includes(nrm(n.name)))));
  const price3 = list(q.price3); // hasta5 | 5a8 | mas8
  if (price3.length)
    rows = rows.filter((p) => {
      const f = p.formats.find((x) => !x.isFullBottle && x.ml === 3);
      if (!f) return false;
      return (
        (price3.includes('hasta5') && f.price <= 5) ||
        (price3.includes('5a8') && f.price > 5 && f.price <= 8) ||
        (price3.includes('mas8') && f.price > 8)
      );
    });
  if (String(q.inStock) === 'true') rows = rows.filter((p) => p.stock > 0 || p.availableMl > 0);
  if (String(q.hasDiscount) === 'true') rows = rows.filter((p) => Number(p.discount) > 0);
  const min = num(q.minPrice);
  const max = num(q.maxPrice);
  if (min !== undefined) rows = rows.filter((p) => p.price >= min);
  if (max !== undefined) rows = rows.filter((p) => p.price <= max);

  const dir = String(q.sortOrder ?? 'DESC').toUpperCase() === 'ASC' ? 1 : -1;
  const by = String(q.sortBy ?? '');
  if (by === 'price') rows = [...rows].sort((a, b) => (a.price - b.price) * dir);
  else if (by === 'name') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name) * dir);
  else if (by === 'salesCount') rows = [...rows].sort((a, b) => (a.salesCount - b.salesCount) * dir);
  else if (by === 'createdAt') rows = [...rows].sort((a, b) => (Date.parse(a.createdAt) - Date.parse(b.createdAt)) * dir);

  const limit = num(q.limit) ?? 12;
  const page = num(q.page) ?? 1;
  const total = rows.length;
  return {
    data: rows.slice((page - 1) * limit, page * limit),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  };
}

function productReviews(productId: string) {
  const reviews = MOCK_REVIEWS_RAW.filter((r) => String(r.productId) === productId);
  const count = reviews.length;
  const average = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
  return { average, count, reviews };
}

export async function mockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? 'get').toLowerCase();
  const url = new URL(config.url ?? '', 'http://mock');
  const path = url.pathname.replace(/\/+$/, '');
  const q: Record<string, any> = { ...Object.fromEntries(url.searchParams), ...(config.params ?? {}) };
  let m: RegExpMatchArray | null;

  if (method !== 'get') {
    return Promise.reject(fail(config, 503, 'Ambiente de demostración: esta acción está deshabilitada.'));
  }

  if (path === '/products') return ok(config, listProducts(q));
  if ((m = path.match(/^\/products\/(\d+)$/))) {
    const p = MOCK_PRODUCTS_RAW.find((x) => x.id === m![1]);
    return p ? ok(config, p) : Promise.reject(fail(config, 404, 'Producto no encontrado'));
  }

  if (path === '/categories') return ok(config, MOCK_CATEGORIES_RAW);

  if (path === '/landing-sections/active') {
    const placement = q.placement ?? 'home';
    return ok(config, MOCK_SECTIONS_RAW.filter((s) => s.placement === placement));
  }

  if (path === '/combos/active') return ok(config, MOCK_COMBOS_RAW);
  if ((m = path.match(/^\/combos\/(\d+)$/))) {
    const c = MOCK_COMBOS_RAW.find((x) => x.id === m![1]);
    return c ? ok(config, c) : Promise.reject(fail(config, 404, 'Combo no encontrado'));
  }

  if (path === '/banners/visible') return ok(config, MOCK_BANNERS_RAW.filter((b) => b.type === 'hero'));
  if (path === '/banners/by-type') return ok(config, MOCK_BANNERS_RAW.filter((b) => b.type === q.type));

  if (path === '/blog/published') return ok(config, MOCK_BLOG_RAW);
  if ((m = path.match(/^\/blog\/slug\/(.+)$/))) {
    const post = MOCK_BLOG_RAW.find((x) => x.slug === decodeURIComponent(m![1]));
    return post ? ok(config, post) : Promise.reject(fail(config, 404, 'Artículo no encontrado'));
  }

  if (path === '/reviews/latest') return ok(config, MOCK_REVIEWS_RAW.slice(0, num(q.limit) ?? 9));
  if ((m = path.match(/^\/reviews\/product\/(\d+)$/))) return ok(config, productReviews(m[1]));

  if (path === '/coupons/exclusive') return ok(config, { products: [], variations: [] });

  if (path === '/settings') {
    return ok(config, Object.entries(MOCK_SETTINGS_RAW).map(([key, value]) => ({ key, value })));
  }
  if ((m = path.match(/^\/settings\/(.+)$/))) {
    const value = MOCK_SETTINGS_RAW[m[1]];
    return value === undefined
      ? Promise.reject(fail(config, 404, 'Ajuste no encontrado'))
      : ok(config, { key: m[1], value });
  }

  if (path === '/delivery-methods') return ok(config, []);

  // Cuenta, pedidos, carrito del servidor, etc.: no existen en la demo.
  return Promise.reject(fail(config, 401, 'Disponible solo con sesión iniciada'));
}
