import type { PhosphorIconName } from '@/assets/svg/PhosphorIcon';
import { HOME_FAQ, SITE_FAQ, type FaqItem } from '@/app/features/landing/data/faqItems';
import { getSetting, useSetting, type SettingsMap } from './siteSettings';

/**
 * Contenido editorial del home editable desde el admin (tabla `settings`).
 * Los defectos son el contenido que antes estaba quemado en los componentes;
 * con la clave ausente el HTML no cambia. El primer render siempre usa el
 * defecto (sin hydration mismatch) y se reemplaza cuando llegan los ajustes.
 */

/* ── Momentos ─────────────────────────────────────────────────────────── */
export type MomentIconKey = 'luna' | 'sol' | 'copa' | 'maletin' | 'regalo';

export interface MomentSetting {
  title: string;
  text: string;
  href: string;
  icon: MomentIconKey | string;
}

export const MOMENT_ICONS: Record<MomentIconKey, PhosphorIconName> = {
  luna: 'moonStars',
  sol: 'sun',
  copa: 'wine',
  maletin: 'briefcase',
  regalo: 'gift',
};

/** Ícono genérico existente para claves desconocidas. */
export const MOMENT_FALLBACK_ICON: PhosphorIconName = 'sprayBottle';

export const DEFAULT_MOMENTS: MomentSetting[] = [
  { icon: 'maletin', title: 'Para la oficina', text: 'Frescos y limpios, que no incomodan en espacios cerrados.', href: '/catalogo/perfumes?momento=DIA' },
  { icon: 'luna', title: 'Para la noche', text: 'Dulces y especiados, con más presencia y duración.', href: '/catalogo/perfumes?momento=NOCHE' },
  { icon: 'copa', title: 'Para una cita', text: 'Los que dejan rastro y hacen que te pregunten cuál llevas.', href: '/catalogo/perfumes?momento=NOCHE' },
  { icon: 'sol', title: 'Para el calor', text: 'Cítricos y marinos que aguantan la costa.', href: '/catalogo/perfumes?momento=DIA' },
  { icon: 'regalo', title: 'Para regalar', text: 'Combos de 3 o 4 decants, listos para sorprender.', href: '/catalogo/combos' },
];

export function momentIcon(key: string): PhosphorIconName {
  return (MOMENT_ICONS as Record<string, PhosphorIconName>)[key] ?? MOMENT_FALLBACK_ICON;
}

export function momentCta(href: string): string {
  return href.includes('/combos') ? 'Ver combos →' : 'Ver opciones →';
}

/* ── Banda de compromiso ──────────────────────────────────────────────── */
export interface CommitmentSetting {
  /** Cifra grande. `{count}` se sustituye por el total real del catálogo (API). */
  value: string;
  label: string;
  /** Línea de apoyo (opcional). */
  text?: string;
}

export const COMMITMENT_COUNT_TOKEN = '{count}';

export const DEFAULT_COMMITMENT: CommitmentSetting[] = [
  { value: '100%', label: 'Originales y sellados', text: 'De boutiques y distribuidores oficiales' },
  { value: '3 · 5 · 10', label: 'ml en decant', text: 'Con la etiqueta de la casa' },
  { value: '24–72 h', label: 'Envío a todo Ecuador', text: 'Por Servientrega' },
  { value: COMMITMENT_COUNT_TOKEN, label: 'Perfumes en catálogo', text: 'Diseñador, nicho y árabes' },
];

/** Íconos por posición (los cuatro pilares de la banda). */
export const COMMITMENT_ICONS: PhosphorIconName[] = ['sealCheck', 'dropHalf', 'truck', 'sprayBottle'];

export function resolveCommitmentValue(value: string, catalogCount?: number | null): string {
  return value.replace(COMMITMENT_COUNT_TOKEN, catalogCount ? String(catalogCount) : '+100');
}

/* ── Banda de promesa (home y ficha de producto) ──────────────────────── */
export interface PromiseSetting {
  title: string;
  text: string;
}

export const DEFAULT_PROMISE: PromiseSetting[] = [
  {
    title: 'El frasco original',
    text: 'Solo trabajamos con perfumes reales, de boutiques oficiales y distribuidores autorizados. Cada frasco es verificado por nosotros.',
  },
  {
    title: 'El proceso',
    text: 'Cada decant se extrae de una botella 100% auténtica y se decanta con su propio instrumento, para que ningún aroma se mezcle con otro.',
  },
  {
    title: 'La etiqueta de la casa',
    text: 'Cada decant sale rotulado con el nombre del perfume y sus ml, listo para reconocerlo, usarlo y volver a pedirlo.',
  },
];

/* ── FAQ ──────────────────────────────────────────────────────────────── */
export interface FaqSetting {
  q: string;
  a: string;
}

const toFaq = (rows: FaqSetting[]): FaqItem[] =>
  rows.filter((r) => r && typeof r.q === 'string' && typeof r.a === 'string').map((r) => ({ question: r.q, answer: r.a }));

const toSettingRows = (items: FaqItem[]): FaqSetting[] => items.map((i) => ({ q: i.question, a: i.answer }));

const DEFAULT_HOME_FAQ_ROWS = toSettingRows(HOME_FAQ);
const DEFAULT_SITE_FAQ_ROWS = toSettingRows(SITE_FAQ);

/* ── Hooks (React) ────────────────────────────────────────────────────── */
export const useMoments = () => useSetting<MomentSetting[]>('home_moments', DEFAULT_MOMENTS);
export const useCommitment = () => useSetting<CommitmentSetting[]>('home_commitment', DEFAULT_COMMITMENT);
export const usePromise = () => useSetting<PromiseSetting[]>('home_promise', DEFAULT_PROMISE);
/** FAQ del home: `faq_items` si existe; si no, las 8 dudas de siempre. */
export const useHomeFaq = (): FaqItem[] => toFaq(useSetting<FaqSetting[]>('faq_items', DEFAULT_HOME_FAQ_ROWS));

/* ── Variantes servidor (.astro) ──────────────────────────────────────── */
export const getPromiseFrom = (map: SettingsMap) => getSetting<PromiseSetting[]>(map, 'home_promise', DEFAULT_PROMISE);
/** FAQ de /faq (y JSON-LD): `faq_items` si existe; si no, la lista completa de siempre. */
export const getSiteFaqFrom = (map: SettingsMap): FaqItem[] =>
  toFaq(getSetting<FaqSetting[]>(map, 'faq_items', DEFAULT_SITE_FAQ_ROWS));
