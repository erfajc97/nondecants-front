import AppProviders from '@/app/providers/AppProviders';
import { useCatalogHook } from './hooks/useCatalogHook';
import CatalogSearch from './components/CatalogSearch';
import CatalogFilters from './components/CatalogFilters';
import ProductGrid from './components/ProductGrid';
import CatalogPagination from './components/CatalogPagination';

function CatalogContent() {
  const {
    filters,
    products,
    pagination,
    isLoading,
    isFetching,
    setSearch,
    setType,
    setInStock,
    setPage,
    clearFilters,
  } = useCatalogHook();

  return (
    <div>
      {/* Banner hero catálogo — estilo Figma */}
      <div className="relative h-44 md:h-56 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=1400&h=400&fit=crop&q=80"
          alt="Catálogo NönDecants"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-2"
          style={{ background: 'rgba(27,25,25,0.65)' }}
        >
          <h1 className="font-heading text-4xl md:text-5xl text-[--color-text] uppercase tracking-widest">
            Catálogo
          </h1>
          <p className="text-[--color-text-muted] text-xs tracking-widest uppercase">
            Aquí encontrarás todos los perfumes de NönDecants
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Barra superior: search + sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between">
          <p className="font-heading text-sm text-[--color-text] uppercase tracking-wider">
            Mostrando nuestros perfumes
          </p>
          <div className="w-full sm:w-72">
            <CatalogSearch value={filters.search} onChange={setSearch} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar filtros */}
          <div className="md:w-52 shrink-0">
            <CatalogFilters
              selectedType={filters.type}
              inStock={filters.inStock}
              onTypeChange={setType}
              onInStockChange={setInStock}
              onClear={clearFilters}
            />
          </div>

          {/* Grid */}
          <div className="flex-1 min-w-0">
            <ProductGrid products={products} isLoading={isLoading} isFetching={isFetching} />
            {pagination && (
              <CatalogPagination pagination={pagination} onPageChange={setPage} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Catalog() {
  return (
    <AppProviders>
      <CatalogContent />
    </AppProviders>
  );
}
