import { CATEGORY_COPY } from '../data';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { CategoryKey } from '../types';

const H1 =
  'mt-3 font-display text-[clamp(40px,11vw,56px)] font-normal leading-[0.98] tracking-[-0.01em] text-text md:text-[clamp(46px,6vw,84px)]';
const SUB = 'mt-4 max-w-[56ch] font-body text-[15px] leading-relaxed text-text-muted md:text-base';

/** Encabezado sin foto: antetítulo + H1 Gloock + subtítulo por categoría. */
export function CategoryHeader({ category }: { category: CategoryKey }) {
  const copy = CATEGORY_COPY[category];
  return (
    <header className="pb-6 pt-8 md:pb-8 md:pt-14">
      <span className="eyebrow k">Catálogo</span>
      <h1 className={H1}>{copy.title}</h1>
      <p className={SUB}>{copy.subtitle}</p>
    </header>
  );
}

interface BrandHeaderProps {
  name: string;
  categoryName: string;
  from3ml: number | null;
  otherHouses: { id: number; name: string; slug: string }[];
  onSelectHouse: (slug: string) => void;
  onBack: () => void;
}

/** Vista de marca (K12): «Casa · Diseñador», nombre grande, precio de entrada y otras casas. */
export function BrandHeader({ name, categoryName, from3ml, otherHouses, onSelectHouse, onBack }: BrandHeaderProps) {
  return (
    <header className="pb-6 pt-6 md:pb-8 md:pt-10">
      <button
        type="button"
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Volver al catálogo
      </button>
      <span className="eyebrow k">Casa · {categoryName}</span>
      <h1 className={H1}>{name}</h1>
      {from3ml != null && (
        <p className={SUB}>
          Pruébalo desde <b className="font-semibold text-text">{formatCurrency(from3ml)}</b> en decant de 3 ml
        </p>
      )}
      {otherHouses.length > 0 && (
        <div className="mt-7">
          <p className="mb-3 font-body text-[12.5px] font-semibold uppercase tracking-[0.12em] text-text">
            Otras casas de {categoryName}
          </p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:px-0 [&::-webkit-scrollbar]:hidden">
            {otherHouses.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => onSelectHouse(h.slug)}
                className="inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full border border-border bg-white px-4 font-body text-sm font-semibold text-text transition-colors hover:border-text"
              >
                {h.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
