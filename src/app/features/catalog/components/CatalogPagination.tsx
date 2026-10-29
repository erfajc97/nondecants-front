import { useEffect, useState } from 'react';

interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
}

interface CatalogPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

function getVisiblePages(current: number, total: number, maxVisible: number): (number | '...')[] {
  if (total <= maxVisible) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [];
  let start = Math.max(1, current - Math.floor(maxVisible / 2));
  let end = Math.min(total, start + maxVisible - 1);

  if (end - start < maxVisible - 1) {
    start = Math.max(1, end - maxVisible + 1);
  }

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push('...');
  }

  for (let i = start; i <= end; i++) {
    if (!pages.includes(i)) pages.push(i);
  }

  if (end < total) {
    if (end < total - 1) pages.push('...');
    pages.push(total);
  }

  return pages;
}

/** Móvil: 3 números (la fila completa con 5 + flechas desbordaba los 390px). */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)');
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return isDesktop;
}

export default function CatalogPagination({ pagination, onPageChange }: CatalogPaginationProps) {
  const { page, totalPages, total, limit } = pagination;
  // El hook va ANTES del early return (regla de hooks de React)
  const isDesktop = useIsDesktop();
  // Siempre visible (incluso con una sola página): el cliente debe saber
  // cuántos productos vienen por página y en qué página está.
  if (total <= 0) return null;

  const visiblePages = getVisiblePages(page, totalPages, isDesktop ? 5 : 3);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-6 pb-4">
      {/* Resumen: cuántos se están viendo del total */}
      <p className="font-body text-sm text-text-muted">
        Mostrando {from}–{to} de {total} productos · Página {page} de {totalPages}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-10 rounded-full px-4 sm:px-5 font-body text-sm font-semibold border border-border text-text hover:border-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Atrás
        </button>

        <div className="flex items-center gap-1 sm:gap-1.5">
          {visiblePages.map((p, idx) =>
            p === '...' ? (
              <span key={`dots-${idx}`} className="w-6 sm:w-9 h-9 flex items-center justify-center text-xs text-text-muted">
                ...
              </span>
            ) : (
              <button
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-9 h-9 rounded-full text-sm font-semibold font-body transition-colors ${
                  p === page
                    ? 'bg-text text-white'
                    : 'border border-border text-text hover:border-text'
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="h-10 rounded-full px-4 sm:px-5 font-body text-sm font-semibold bg-text text-white hover:bg-[#34312f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
