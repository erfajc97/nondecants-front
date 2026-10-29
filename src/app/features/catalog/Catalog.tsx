import { useEffect, useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import { useCatalogHook } from './hooks/useCatalogHook';
import { CategoryHeader, BrandHeader } from './components/CatalogHeader';
import CategoryPills from './components/CategoryPills';
import CatalogFilters from './components/CatalogFilters';
import SortMenu from './components/SortMenu';
import ProductGrid from './components/ProductGrid';
import type { CategoryKey } from './types';

interface CatalogProps {
  /** Categoría por defecto de la página (/bajo-pedido → 'bajo-pedido'). */
  initialCategory?: CategoryKey;
  /** `Astro.url.search`: servidor y cliente arrancan con el mismo estado. */
  initialQuery?: string;
}

const STYLES = `
@keyframes ndCatIn { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@keyframes ndBump { 0% { transform: scale(1); } 40% { transform: scale(1.22) translateY(-2px); } 100% { transform: scale(1); } }
.nd-cat-in { animation: ndCatIn .5s cubic-bezier(.2,.8,.2,1) both; }
.nd-bump { display: inline-block; animation: ndBump .32s ease-out; }
@media (prefers-reduced-motion: reduce) { .nd-cat-in, .nd-bump { animation: none; } }
`;

const plural = (n: number) => `${n} ${n === 1 ? 'perfume' : 'perfumes'}`;

function CatalogContent({ initialCategory, initialQuery }: CatalogProps) {
  const cat = useCatalogHook({ initialCategory, initialQuery });
  const [sheetOpen, setSheetOpen] = useState(false);

  // Hoja móvil de filtros: bloquea el scroll del fondo y cierra con Escape.
  useEffect(() => {
    if (!sheetOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setSheetOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [sheetOpen]);

  const filtersNode = (
    <CatalogFilters
      criteria={cat.criteria}
      counts={cat.counts}
      casaOptions={cat.casaOptions}
      hideCasas={cat.isBrandView}
      onToggle={cat.toggle}
    />
  );

  const showCounts = cat.hasData;

  return (
    <div className="bg-bg">
      <style>{STYLES}</style>
      <div className="mx-auto max-w-[1400px] px-4 pb-16 md:px-14">
        {cat.isBrandView && cat.marca ? (
          <BrandHeader
            name={cat.marca.name}
            categoryName={cat.marca.categoryName}
            from3ml={cat.brandFrom3ml}
            otherHouses={cat.otherHouses}
            onSelectHouse={cat.selectMarca}
            onBack={() => cat.selectMarca(undefined)}
          />
        ) : (
          <>
            <CategoryHeader category={cat.category} />
            <CategoryPills active={cat.category} counts={cat.categoryCounts} showCounts={showCounts} onSelect={cat.setCategory} />
          </>
        )}

        <div className="mt-5 grid items-start md:mt-8 md:grid-cols-[260px_minmax(0,1fr)] md:gap-[clamp(28px,3.4vw,52px)]">
          {/* Escritorio: columna fija a la izquierda */}
          <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-1.5 md:block" aria-label="Filtros">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <b className="font-display text-[26px] font-normal">Filtrar</b>
              <button
                type="button"
                onClick={cat.clearFilters}
                disabled={cat.activeCount === 0}
                className="font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text disabled:opacity-40"
              >
                Limpiar
              </button>
            </div>
            {filtersNode}
          </aside>

          <div className="min-w-0">
            {/* Barra: Filtrar · Ordenar · total. Pegada arriba en móvil. */}
            <div className="sticky top-[var(--hdr,0px)] z-30 -mx-4 flex items-center gap-2 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur-sm md:static md:mx-0 md:gap-3 md:bg-transparent md:px-0 md:pb-4 md:pt-0 md:backdrop-blur-none">
              <button
                type="button"
                onClick={() => setSheetOpen(true)}
                className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-4 font-body text-sm font-semibold text-text transition-colors hover:border-text md:hidden"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                  <path d="M4 6h16M7 12h10M10 18h4" />
                </svg>
                Filtrar
                {cat.activeCount > 0 && (
                  <b className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-accent px-1.5 text-xs text-text">{cat.activeCount}</b>
                )}
              </button>
              <SortMenu value={cat.sort} onChange={cat.setSort} />
              <span className="ml-auto whitespace-nowrap font-body text-sm text-text-muted" aria-live="polite">
                {cat.isLoading ? ' ' : <b className="font-semibold text-text">{plural(cat.total)}</b>}
              </span>
            </div>

            {cat.chips.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-4">
                {cat.chips.map((chip) => (
                  <button
                    key={chip.key}
                    type="button"
                    onClick={chip.onRemove}
                    aria-label={`Quitar ${chip.label}`}
                    className="inline-flex h-9 items-center gap-2 rounded-full border border-accent/45 bg-gold-light pl-3.5 pr-3 font-body text-sm font-semibold text-text transition-colors hover:border-accent"
                  >
                    {chip.label} <span aria-hidden className="text-[11px] opacity-60">✕</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={cat.clearFilters}
                  className="font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
                >
                  Limpiar todo
                </button>
              </div>
            )}

            <div className="mt-5">
              <ProductGrid products={cat.shown} isLoading={cat.isLoading} onClear={cat.clearFilters} />
              {cat.hasMore && (
                <div className="mt-10 flex justify-center border-t border-border pt-6">
                  <button
                    type="button"
                    onClick={cat.loadMore}
                    className="h-[52px] rounded-full bg-text px-8 font-body text-[14.5px] font-semibold text-white transition-[background-color,transform] hover:bg-text-soft active:scale-[0.985]"
                  >
                    Ver más
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Móvil: hoja de filtros (siempre montada para animar) */}
      <div
        className={`fixed inset-0 z-[86] md:hidden ${sheetOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Filtrar"
        aria-hidden={!sheetOpen}
      >
        <div
          className={`absolute inset-0 bg-text/45 transition-opacity duration-300 ${sheetOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSheetOpen(false)}
          aria-hidden="true"
        />
        <div
          className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[18px] bg-white transition-transform duration-[450ms] ease-[cubic-bezier(.2,.9,.25,1)] ${
            sheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          <div className="relative flex items-center justify-between border-b border-border pb-2.5 pl-5 pr-3 pt-[18px]">
            <span className="absolute left-1/2 top-[7px] -ml-5 h-1 w-10 rounded-sm bg-border" aria-hidden />
            <b className="font-display text-[26px] font-normal">Filtrar</b>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="grid h-11 w-11 place-items-center text-text-muted transition-colors hover:text-text"
              aria-label="Cerrar filtros"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
          <div className="overflow-auto overscroll-contain px-5">{filtersNode}</div>
          <div className="grid grid-cols-[auto_1fr] gap-2.5 border-t border-border bg-white px-4 pb-[calc(12px+env(safe-area-inset-bottom,0px))] pt-3">
            <button
              type="button"
              onClick={cat.clearFilters}
              disabled={cat.activeCount === 0}
              className="h-[54px] rounded-full border border-border px-5 font-body text-[15px] font-semibold text-text transition-colors hover:border-text disabled:opacity-40"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={() => setSheetOpen(false)}
              className="h-[54px] rounded-full bg-text font-body text-base font-semibold text-white transition-[background-color,transform] hover:bg-text-soft active:scale-[0.985]"
            >
              Ver <span key={cat.total} className="nd-bump">{cat.total}</span> {cat.total === 1 ? 'perfume' : 'perfumes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog(props: CatalogProps) {
  return (
    <AppProviders>
      <CatalogContent {...props} />
    </AppProviders>
  );
}
