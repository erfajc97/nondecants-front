/**
 * Buscador del sitio (G1–G3): trabaja sobre la lista ya cargada de productos,
 * sin consultar al backend al escribir. Busca en nombre, marca, notas de las
 * 3 etapas, ocasión, género, categoría y descripción, sin importar tildes.
 * Un número filtra por precio del 3 ml hasta ese valor.
 * Acepta tanto el Product mapeado como la forma cruda del backend/fixtures.
 */

export const norm = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

type Any = any;

export type ReasonKind = 'name' | 'brand' | 'note' | 'occasion' | 'gender' | 'category' | 'price' | 'desc';
export interface Reason {
  kind: ReasonKind;
  label: string;
  color?: string;
}
export interface Hit<P = Any> {
  product: P;
  reason: Reason;
  score: number;
}
export interface NoteCount {
  name: string;
  color?: string;
  count: number;
}
export interface SearchOutput<P = Any> {
  hits: Hit<P>[];
  houses: { name: string; count: number }[];
  notes: NoteCount[];
  suggestion?: string;
}

const GENDER_WORDS: Record<string, string[]> = {
  HOMBRE: ['hombre', 'hombres', 'el', 'masculino', 'caballero'],
  MUJER: ['mujer', 'mujeres', 'ella', 'femenino', 'dama'],
  UNISEX: ['unisex'],
};
const GENDER_LABEL: Record<string, string> = { HOMBRE: 'Para él', MUJER: 'Para ella', UNISEX: 'Unisex' };

export const brandOf = (p: Any): string => {
  const m = p?.marca;
  return typeof m === 'string' ? m : (m?.name ?? '');
};

export function notesOf(p: Any): { name: string; color?: string }[] {
  const out: { name: string; color?: string }[] = [];
  for (const sec of p?.scentSections ?? []) {
    for (const n of sec?.notes ?? []) if (n?.name) out.push({ name: n.name, color: n.color });
  }
  return out;
}

/** Precio del decant de 3 ml (o el formato más barato si no existe). */
export function price3ml(p: Any): number {
  const d = Number(p?.discount);
  const k = d > 0 ? 1 - d / 100 : 1;
  return rawPrice3ml(p) * k;
}

function rawPrice3ml(p: Any): number {
  const vars: Any[] = p?.variants ?? p?.variations ?? [];
  const v3 = vars.find((v) => Number(v.mlSize ?? v.ml) === 3);
  if (v3 && Number(v3.price) > 0) return Number(v3.price);
  const f = (p?.formats ?? []).find((x: Any) => Number(x.ml) === 3);
  if (f && Number(f.price) > 0) return Number(f.price);
  if (Number(p?.minFormatPrice) > 0) return Number(p.minFormatPrice);
  const prices = vars.map((v) => Number(v.price)).filter((n) => n > 0);
  return prices.length ? Math.min(...prices) : Number(p?.price ?? 0);
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

/** "¿Quisiste decir…?": la marca, nota o nombre más cercano. */
export function suggest(list: Any[], q: string): string | undefined {
  const nq = norm(q);
  if (nq.length < 3) return undefined;
  const cands = new Set<string>();
  for (const p of list) {
    if (brandOf(p)) cands.add(brandOf(p));
    cands.add(p.name);
    for (const w of String(p.name).split(/\s+/)) if (w.length > 3) cands.add(w);
    for (const n of notesOf(p)) cands.add(n.name);
  }
  let best: string | undefined;
  let bestD = nq.length <= 4 ? 1 : 2;
  for (const c of cands) {
    const nc = norm(c);
    if (nc === nq) continue;
    const d = levenshtein(nq, nc);
    if (d < bestD || (d === bestD && !best)) {
      best = c;
      bestD = d;
    }
  }
  return best;
}

/** Notas más frecuentes de la lista (para "Busca por nota"). */
export function topNotes(list: Any[], limit = 8): NoteCount[] {
  const map = new Map<string, NoteCount>();
  for (const p of list) {
    const seen = new Set<string>();
    for (const n of notesOf(p)) {
      const k = norm(n.name);
      if (seen.has(k)) continue;
      seen.add(k);
      const cur = map.get(k);
      if (cur) cur.count++;
      else map.set(k, { name: n.name, color: n.color, count: 1 });
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, limit);
}

export function searchProducts<P = Any>(
  list: P[],
  query: string,
  opts: { categoryNames?: Record<string, string> } = {},
): SearchOutput<P> {
  const q = norm(query);
  if (!q) return { hits: [], houses: [], notes: [] };

  const numeric = /^\d+([.,]\d+)?$/.test(q) ? Number(q.replace(',', '.')) : null;
  const toks = q.split(/\s+/).filter(Boolean);
  const hits: Hit<P>[] = [];
  const houseCount = new Map<string, number>();
  const noteCount = new Map<string, NoteCount>();

  for (const p of list as Any[]) {
    const name = norm(p.name);
    const brandName = brandOf(p);
    const brand = norm(brandName);
    let reason: Reason | null = null;
    let score = 0;
    const set = (r: Reason, s: number) => {
      if (s > score) {
        score = s;
        reason = r;
      }
    };

    if (numeric !== null) {
      const pr = price3ml(p);
      if (pr > 0 && pr <= numeric) {
        set({ kind: 'price', label: `3 ml · $${pr.toFixed(2).replace('.', ',')}` }, 100 - pr / 1000);
      }
    } else {
      const all = (hay: string) => toks.every((t) => hay.includes(t));
      if (name.startsWith(q)) set({ kind: 'name', label: 'Nombre' }, 100);
      else if (all(name)) set({ kind: 'name', label: 'Nombre' }, 90);
      if (brand && all(brand)) set({ kind: 'brand', label: `Casa: ${brandName}` }, 80);
      else if (brand && all(`${brand} ${name}`)) set({ kind: 'brand', label: `Casa: ${brandName}` }, 78);

      const seenNotes = new Set<string>();
      for (const n of notesOf(p)) {
        const k = norm(n.name);
        if (!all(k)) continue;
        set({ kind: 'note', label: `Nota: ${n.name}`, color: n.color }, 70);
        if (!seenNotes.has(k)) {
          seenNotes.add(k);
          const cur = noteCount.get(k);
          if (cur) cur.count++;
          else noteCount.set(k, { name: n.name, color: n.color, count: 1 });
        }
      }
      for (const o of p.occasion ?? []) {
        if (all(norm(o))) {
          set({ kind: 'occasion', label: `Ocasión: ${o}` }, 55);
          break;
        }
      }
      if (p.timeOfDay === 'NOCHE' && q === 'noche') set({ kind: 'occasion', label: 'Ocasión: Noche' }, 55);
      if (p.timeOfDay === 'DIA' && q === 'dia') set({ kind: 'occasion', label: 'Ocasión: Día' }, 55);
      if ((GENDER_WORDS[p.gender as string] ?? []).includes(q)) {
        set({ kind: 'gender', label: GENDER_LABEL[p.gender] ?? String(p.gender) }, 45);
      }
      const catName = opts.categoryNames?.[String(p.categoryId)];
      if (catName && all(norm(catName))) set({ kind: 'category', label: `Categoría: ${catName}` }, 40);
      const desc = norm(`${p.description ?? ''} ${p.detailDescription ?? ''}`);
      if (desc && all(desc)) set({ kind: 'desc', label: 'Lo mencionamos en su ficha' }, 20);
    }

    if (reason) {
      hits.push({ product: p as P, reason, score });
      if (numeric === null && brandName && brand.includes(q)) {
        houseCount.set(brandName, (houseCount.get(brandName) ?? 0) + 1);
      }
    }
  }

  hits.sort((a, b) => b.score - a.score);

  return {
    hits,
    houses: [...houseCount].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 2),
    notes: [...noteCount.values()].sort((a, b) => b.count - a.count).slice(0, 2),
    suggestion: hits.length === 0 ? suggest(list as Any[], query) : undefined,
  };
}
