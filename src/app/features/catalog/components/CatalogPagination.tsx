interface PaginationInfo {
  page: number;
  totalPages: number;
  total: number;
}

interface CatalogPaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export default function CatalogPagination({ pagination, onPageChange }: CatalogPaginationProps) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-[--color-border]">
      {/* ATRÁS */}
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-4 py-2 font-heading text-xs uppercase tracking-wider border border-[--color-border] text-[--color-text-muted] hover:border-[--color-text] hover:text-[--color-text] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        Atrás
      </button>

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs font-heading transition-colors ${
              p === page
                ? 'bg-[--color-accent] text-[--color-bg]'
                : 'border border-[--color-border] text-[--color-text-muted] hover:border-[--color-text] hover:text-[--color-text]'
            }`}
            style={{ borderRadius: 'var(--radius-sm)' }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* SIGUIENTE */}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-4 py-2 font-heading text-xs uppercase tracking-wider border border-[--color-border] text-[--color-text-muted] hover:border-[--color-text] hover:text-[--color-text] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        Siguiente
      </button>
    </div>
  );
}
