import { useEffect, useState } from 'react';
import AppProviders from '@/app/providers/AppProviders';
import { useCatalogHook } from './hooks/useCatalogHook';
import { useCategoriesWithMarcasQuery } from '@/app/tanstack-queries/categoriesQuery';
import type { CatalogBannerSlot } from '@/app/tanstack-queries/bannersQuery';
import CatalogBanner from './components/CatalogBanner';
import CatalogFilters from './components/CatalogFilters';
import ProductGrid from './components/ProductGrid';
import CatalogPagination from './components/CatalogPagination';
import CatalogQuickFilters from './components/CatalogQuickFilters';
import CatalogBrandBackorder from './components/CatalogBrandBackorder';
import {
  CATALOG_GENDERS,
  CATALOG_TIME_OF_DAY,
  CATALOG_CONCENTRATIONS,
  CATALOG_PROJECTIONS,
  SORT_OPTIONS,
} from './data';

interface CatalogContentProps {
  tipo?: 'perfumes' | 'combos';
  bajoPedido?: boolean;
  bannerTitle?: string;
  bannerDescription?: string;
  bannerSlot?: CatalogBannerSlot;
  initialCategoryId?: number;
  initialMarcaId?: number;
}

const labelOf = (opts: { value: string; label: string }[], v?: string) =>
  opts.find((o) => o.value === v)?.label ?? v ?? '';

function LoadMoreButton({
  onPress,
  isFetching,
}: {
  onPress: () => void;
  isFetching: boolean;
}) {
  return (
    <div className="mt-10 flex justify-center border-t border-border pt-6">
      <button
        type="button"
        onClick={onPress}
        disabled={isFetching}
        className="h-[52px] rounded-[3px] bg-text px-8 font-body text-[14.5px] font-semibold text-white transition-[background-color,transform] hover:bg-[#34312f] active:scale-[0.985] disabled:opacity-40"
      >
        {isFetching ? 'Cargando…' : 'Ver más'}
      </button>
    </div>
  );
}

function CatalogContent({
  tipo,
  bajoPedido,
  bannerTitle = 'Perfumes',
  bannerDescription = 'Curamos fragancias de las casas más codiciadas del mundo. Descubre, prueba y colecciona.',
  bannerSlot,
  initialCategoryId,
  initialMarcaId,
}: CatalogContentProps) {
  const {
    filters,
    products,
    pagination,
    isLoading,
    isFetching,
    sortValue,
    hasActiveFilters,
    isBrandView,
    hasMore,
    loadMore,
    setSearch,
    setSort,
    setPage,
    setGender,
    setTimeOfDay,
    setConcentration,
    setProjection,
    setPriceRange,
    setCategoryId,
    setMarcaId,
    clearFilters,
    showBrandBackorder,
    brandBackorderProducts,
    brandBackorderTotal,
    brandBackorderLoading,
    brandBackorderFetching,
    selectedMarca,
  } = useCatalogHook({ tipo, bajoPedido, initialCategoryId, initialMarcaId });

  const { data: categories = [] } = useCategoriesWithMarcasQuery();
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Hoja móvil abierta: bloquea el scroll del fondo y cierra con Escape.
  useEffect(() => {
    if (!filtersOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFiltersOpen(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [filtersOpen]);

  const resultCount =
    (pagination?.total ?? products.length) + (showBrandBackorder ? brandBackorderTotal : 0);

  const activeChips: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.gender)
    activeChips.push({ key: 'gender', label: labelOf(CATALOG_GENDERS, filters.gender), onRemove: () => setGender('') });
  if (filters.timeOfDay)
    activeChips.push({ key: 'time', label: labelOf(CATALOG_TIME_OF_DAY, filters.timeOfDay), onRemove: () => setTimeOfDay('') });
  if (filters.concentration)
    activeChips.push({ key: 'conc', label: labelOf(CATALOG_CONCENTRATIONS, filters.concentration), onRemove: () => setConcentration('') });
  if (filters.projection)
    activeChips.push({ key: 'proj', label: labelOf(CATALOG_PROJECTIONS, filters.projection), onRemove: () => setProjection('') });
  if (filters.maxPrice)
    activeChips.push({ key: 'price', label: `Hasta $${filters.maxPrice}`, onRemove: () => setPriceRange(undefined, undefined) });
  if (filters.search)
    activeChips.push({ key: 'search', label: `“${filters.search}”`, onRemove: () => setSearch('') });
  if (filters.categoryId && filters.categoryId !== initialCategoryId) {
    const cat = categories.find((c) => Number(c.id) === filters.categoryId);
    if (cat) activeChips.push({ key: 'cat', label: cat.name, onRemove: () => setCategoryId(initialCategoryId) });
  }
  if (filters.marcaId && filters.marcaId !== initialMarcaId) {
    const marca = categories.flatMap((c) => c.marcas).find((m) => Number(m.id) === filters.marcaId);
    if (marca) activeChips.push({ key: 'marca', label: marca.name, onRemove: () => setMarcaId(initialMarcaId) });
  }

  const filtersNode = (
    <CatalogFilters
      gender={filters.gender}
      onGenderChange={setGender}
      timeOfDay={filters.timeOfDay}
      onTimeOfDayChange={setTimeOfDay}
      concentration={filters.concentration}
      onConcentrationChange={setConcentration}
      projection={filters.projection}
      onProjectionChange={setProjection}
      minPrice={filters.minPrice}
      maxPrice={filters.maxPrice}
      onPriceRangeChange={setPriceRange}
      categoryId={filters.categoryId}
      onCategoryChange={setCategoryId}
      marcaId={filters.marcaId}
      onMarcaChange={setMarcaId}
      hasActiveFilters={hasActiveFilters}
      onClearFilters={clearFilters}
    />
  );

  const productBlock = (
    <>
      <ProductGrid
        products={products}
        isLoading={isLoading}
        isFetching={isFetching}
        hideEmpty={showBrandBackorder}
      />
      {showBrandBackorder &&
        !isLoading &&
        !brandBackorderLoading &&
        products.length === 0 &&
        brandBackorderProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center md:py-20">
            <p className="font-display text-[28px] text-text">Sin resultados</p>
            <p className="mt-2 font-body text-sm text-text-muted">
              No se encontraron productos con esos filtros.
            </p>
          </div>
        )}
      {isBrandView && hasMore && <LoadMoreButton onPress={loadMore} isFetching={isFetching} />}
      {!isBrandView && pagination && <CatalogPagination pagination={pagination} onPageChange={setPage} />}
      {showBrandBackorder && (
        <CatalogBrandBackorder
          products={brandBackorderProducts}
          isLoading={brandBackorderLoading}
          isFetching={brandBackorderFetching}
          marcaName={selectedMarca?.name}
          marcaSlug={selectedMarca?.slug}
          total={brandBackorderTotal}
        />
      )}
    </>
  );

  const sheetTitle = tipo === 'combos' ? 'Filtrar combos' : 'Filtrar perfumes';

  const sortSelect = (
    <label className="inline-flex items-center gap-2 font-body text-sm text-text-muted">
      <span className="hidden sm:inline">Ordenar</span>
      <select
        value={sortValue}
        onChange={(e) => setSort(e.target.value)}
        aria-label="Ordenar productos"
        className="h-11 cursor-pointer rounded-full border border-border bg-white px-4 font-body text-sm font-semibold text-text transition-colors hover:border-text focus:border-text focus:outline-none md:h-[46px]"
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <div className="bg-bg">
      <CatalogBanner
        defaultTitle={bannerTitle}
        defaultDescription={bannerDescription}
        categoryId={filters.categoryId}
        marcaId={filters.marcaId}
        bannerSlot={bannerSlot}
      />

      {isBrandView ? (
        <div className="mx-auto max-w-[1400px] px-4 py-6 md:px-14 md:py-10">
          <button
            type="button"
            onClick={clearFilters}
            className="mb-8 inline-flex items-center gap-2 font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M19 12H5M11 18l-6-6 6-6" />
            </svg>
            Volver al catálogo
          </button>

          {bajoPedido !== true && (products.length > 0 || isLoading) && (
            <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-display text-[clamp(26px,3vw,38px)] font-normal leading-none text-text">
                Para probar en decant hoy
              </h2>
              <span className="font-body text-sm text-text-muted">Entrega en 24–72 h</span>
            </div>
          )}

          {productBlock}
        </div>
      ) : (
        <div className="mx-auto max-w-[1400px] px-4 pb-16 md:px-14">
          <div className="grid items-start gap-0 md:grid-cols-[260px_minmax(0,1fr)] md:gap-[clamp(24px,3vw,44px)]">
            {/* Desktop: panel lateral fijo */}
            <aside className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pr-1.5 md:block" aria-label="Filtros">
              <div className="flex items-center justify-between pb-1.5">
                <b className="font-display text-[26px] font-normal">{sheetTitle}</b>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <p className="border-b border-border pb-3 font-body text-sm text-text-muted">
                <b className="text-base text-text">{resultCount}</b> {resultCount === 1 ? 'resultado' : 'resultados'}
              </p>
              {filtersNode}
            </aside>

            <div className="min-w-0 pt-4 md:pt-6">
              {/* Barra de herramientas */}
              <div className="sticky top-[var(--hdr,0px)] z-20 -mx-4 flex flex-wrap items-center gap-2 border-b border-border bg-white/95 px-4 py-2.5 backdrop-blur-sm md:static md:mx-0 md:gap-3 md:bg-transparent md:px-0 md:pb-3.5 md:pt-0 md:backdrop-blur-none">
                <button
                  type="button"
                  onClick={() => setFiltersOpen(true)}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-border bg-white px-3.5 font-body text-sm font-semibold transition-colors hover:border-text md:hidden"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
                    <path d="M4 6h16M7 12h10M10 18h4" />
                  </svg>
                  Filtros
                  {activeChips.length > 0 && (
                    <b className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-accent px-1.5 text-xs text-text">
                      {activeChips.length}
                    </b>
                  )}
                </button>
                <input
                  type="search"
                  value={filters.search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar fragancia o casa…"
                  aria-label="Buscar fragancia o casa"
                  className="order-last h-11 w-full min-w-0 rounded-full border border-border bg-white px-4 font-body text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none md:order-none md:h-[46px] md:w-auto md:max-w-sm md:flex-none"
                />
                <div className="ml-auto flex items-center gap-3">
                  <span className="hidden whitespace-nowrap font-body text-sm text-text-muted sm:inline" aria-live="polite">
                    <b className="text-base text-text">{resultCount}</b> {resultCount === 1 ? 'resultado' : 'resultados'}
                  </span>
                  {sortSelect}
                </div>
              </div>

              {/* Móvil: accesos rápidos */}
              <div className="mt-3 md:hidden">
                <CatalogQuickFilters
                  gender={filters.gender}
                  onGenderChange={setGender}
                  marcaId={filters.marcaId}
                  onMarcaChange={setMarcaId}
                  categoryId={filters.categoryId}
                  onCategoryChange={setCategoryId}
                  categories={categories}
                  showCategory={tipo !== 'combos'}
                />
              </div>

              {activeChips.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-3.5">
                  {activeChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={chip.onRemove}
                      className={`h-9 items-center gap-2 rounded-full border border-accent/45 bg-gold-light pl-3.5 pr-3 font-body text-sm font-semibold text-text transition-colors hover:border-accent ${
                        chip.key === 'gender' || chip.key === 'marca' || chip.key === 'cat'
                          ? 'hidden md:inline-flex'
                          : 'inline-flex'
                      }`}
                    >
                      {chip.label} <span aria-hidden className="text-[11px] opacity-60">✕</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="font-body text-sm font-semibold text-text-soft underline underline-offset-[3px] transition-colors hover:text-text"
                  >
                    Limpiar
                  </button>
                </div>
              )}

              <div className="mt-5">{productBlock}</div>
            </div>
          </div>

          {/* Móvil: hoja inferior de filtros (siempre montada para animar) */}
          <div
            className={`fixed inset-0 z-[86] md:hidden ${filtersOpen ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
            role="dialog"
            aria-modal="true"
            aria-label={sheetTitle}
            aria-hidden={!filtersOpen}
          >
            <div
              className={`absolute inset-0 bg-text/45 transition-opacity duration-300 ${filtersOpen ? 'opacity-100' : 'opacity-0'}`}
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
            <div
              className={`absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[18px] bg-white transition-transform duration-[450ms] ease-[cubic-bezier(.2,.9,.25,1)] ${
                filtersOpen ? 'translate-y-0' : 'translate-y-full'
              }`}
            >
              <div className="relative flex items-center justify-between border-b border-border pb-2.5 pl-5 pr-3 pt-[18px]">
                <span className="absolute left-1/2 top-[7px] -ml-5 h-1 w-10 rounded-sm bg-[#d9d5cd]" aria-hidden />
                <b className="font-display text-[26px] font-normal">{sheetTitle}</b>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
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
                  onClick={clearFilters}
                  disabled={!hasActiveFilters}
                  className="h-[54px] rounded-full border border-border px-5 font-body text-[15px] font-semibold text-text transition-colors hover:border-text disabled:opacity-40"
                >
                  Limpiar
                </button>
                <button
                  type="button"
                  onClick={() => setFiltersOpen(false)}
                  className="h-[54px] rounded-[3px] bg-text font-body text-base font-semibold text-white transition-[background-color,transform] hover:bg-[#34312f] active:scale-[0.985]"
                >
                  Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Catalog(props: CatalogContentProps) {
  return (
    <AppProviders>
      <CatalogContent {...props} />
    </AppProviders>
  );
}
