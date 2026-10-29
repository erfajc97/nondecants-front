import { useState } from 'react';
import {
  useNormalCategoriesQuery,
  useBajoPedidoCategoriesQuery,
  sortCategoriesByHierarchy,
} from '@/app/tanstack-queries/categoriesQuery';
import { useNavbarAdQuery } from '@/app/tanstack-queries/navbarAdQuery';

const PER_PAGE = 3; // máximo de categorías visibles a la vez

interface MegaMenuProps {
  /** 'perfumes' → catálogo normal · 'bajoPedido' → bajo pedido */
  mode: 'perfumes' | 'bajoPedido';
  onClose: () => void;
  dropdownRef: React.Ref<HTMLDivElement>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const FEATURE_FALLBACK = '/banner-catalog.webp';

/**
 * Mega menú (rebranding NönDecants: blanco, tinta y dorado).
 * Despliega las categorías reales del backend, cada una con sus marcas.
 * "Ver todo {categoría}" lleva a la página de catálogo filtrada por
 * esa categoría (banner con su imagen + todos los perfumes de sus marcas).
 * Sin tocar lógica de negocio: solo consume las queries existentes.
 */
export default function PerfumesMegaMenu({
  mode,
  onClose,
  dropdownRef,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuProps) {
  const isBajoPedido = mode === 'bajoPedido';
  const basePath = isBajoPedido ? '/bajo-pedido' : '/catalogo/perfumes';
  // Bajo pedido se vende sellado: nombrar "decants" ahí prometía algo que
  // esa sección no tiene.
  const catalogLabel = isBajoPedido ? 'Ver catálogo →' : 'Catálogo decants →';

  // Ambas queries están cacheadas (staleTime 5min); se elige por modo.
  const normal = useNormalCategoriesQuery();
  const bajo = useBajoPedidoCategoriesQuery();
  const { data: categories = [], isLoading } = isBajoPedido ? bajo : normal;

  const cats = sortCategoriesByHierarchy(categories.filter((c) => c.name.toLowerCase() !== 'all'));

  // Paginación de categorías — máximo PER_PAGE por vista, flechas para el resto.
  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(cats.length / PER_PAGE));
  const safePage = Math.min(page, totalPages - 1);
  const pageCats = cats.slice(safePage * PER_PAGE, safePage * PER_PAGE + PER_PAGE);
  const feature = pageCats[0] ?? cats[0];

  // Panel "Destacado": prioriza la publicidad de navbar gestionada en el admin
  // (banner type='navbar'). Si no hay, cae al destacado de categoría.
  const { data: navAd } = useNavbarAdQuery();
  const panel = navAd
    ? {
        href: navAd.link || basePath,
        img: navAd.imageUrl || navAd.image || FEATURE_FALLBACK,
        title: navAd.title,
        description: navAd.subtitle,
      }
    : feature
      ? {
          href: `${basePath}?category=${feature.id}`,
          img: feature.imageUrl || FEATURE_FALLBACK,
          title: feature.name,
          description: feature.description,
        }
      : null;

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="absolute left-0 right-0 top-full z-50 hidden border-b border-border bg-bg text-text shadow-xl md:block"
    >
      <div className="mx-auto grid max-w-[1480px] grid-cols-[1fr_360px] gap-16 px-[min(52px,3.4vw)] pb-10 pt-10">
        {/* Columnas de categorías → marcas (paginadas, máx 3) */}
        <div>
          {/* Sin el rótulo "Categorías" (REQ-001): las columnas suben y
              cierran el hueco superior; la paginación queda a la derecha. */}
          {totalPages > 1 && (
            <div className="mb-8 flex items-center justify-end gap-4 text-text">
              <span className="font-body text-[11px] tabular-nums tracking-wide text-text-muted">
                {safePage + 1} / {totalPages}
              </span>
              <button
                type="button"
                aria-label="Categorías anteriores"
                disabled={safePage === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="grid h-8 w-8 place-items-center rounded-full border border-border transition-colors hover:border-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M15 6l-6 6 6 6" /></svg>
              </button>
              <button
                type="button"
                aria-label="Siguientes categorías"
                disabled={safePage >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="grid h-8 w-8 place-items-center rounded-full border border-border transition-colors hover:border-text disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M9 6l6 6-6 6" /></svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-3 gap-x-12 gap-y-12">
          {isLoading ? (
            <p className="text-sm text-text-muted">Cargando categorías…</p>
          ) : cats.length === 0 ? (
            <p className="text-sm text-text-muted">No hay categorías disponibles</p>
          ) : (
            pageCats.map((cat) => (
              <div key={cat.id}>
                {/* La CATEGORÍA manda en la jerarquía: display grande.
                    Las marcas quedan por debajo, en cuerpo pequeño. */}
                <a
                  href={`${basePath}?category=${cat.id}`}
                  onClick={onClose}
                  className="group block"
                >
                  <span className="block font-display text-[26px] font-normal leading-none tracking-[-0.01em] text-text transition-colors group-hover:text-accent-hover">
                    {cat.name}
                  </span>
                </a>

                {/* Sin línea fina ni palabra descriptiva (REQ-002) — limpio, como en mobile */}
                <div className="mt-6 flex flex-col gap-2.5">
                  {cat.marcas.slice(0, 6).map((sub) => (
                    <a
                      key={sub.id}
                      href={`${basePath}?category=${cat.id}&marca=${sub.id}`}
                      onClick={onClose}
                      className="group block transition-transform duration-200 hover:translate-x-1"
                    >
                      <span className="block font-body text-[14px] leading-tight text-text-soft transition-colors group-hover:text-text group-hover:underline underline-offset-4 decoration-accent">
                        {sub.name}
                      </span>
                    </a>
                  ))}
                </div>

                {/* → página de catálogo filtrada por la categoría (banner + todos sus perfumes) */}
                <a
                  href={`${basePath}?category=${cat.id}`}
                  onClick={onClose}
                  className="mt-6 inline-block border-b border-accent pb-1 font-body text-[13px] font-semibold leading-none text-text transition-colors hover:text-accent-hover"
                >
                  {catalogLabel}
                </a>
              </div>
            ))
          )}
          </div>

          {/* CTA principal — esquina inferior izquierda del panel */}
          <a
            href={basePath}
            onClick={onClose}
            className="group mt-14 inline-flex h-[52px] items-center justify-center gap-2.5 rounded-[3px] bg-text px-7 font-body text-[14.5px] font-semibold tracking-[0.01em] text-bg transition-colors hover:bg-text-soft"
          >
            Ver el catálogo completo
            <svg className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </a>
        </div>

        {/* Panel editorial — publicidad de navbar (admin) o categoría destacada */}
        {panel && (
          <a
            href={panel.href}
            onClick={onClose}
            className="relative block min-h-[340px] overflow-hidden rounded-[4px] text-white"
          >
            <img
              src={panel.img}
              alt=""
              className="absolute inset-0 h-full w-full object-cover brightness-[0.82]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/65" />
            <span className="absolute left-6 top-6 inline-flex items-center gap-1.5 font-body text-[13px] font-semibold text-white/90"><span className="text-accent">✦</span>Destacado</span>
            <div className="absolute inset-x-6 bottom-6">
              <div className="font-display text-3xl font-normal leading-[1.05] text-white">
                {panel.title}
              </div>
              {panel.description && (
                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-white/85">
                  {panel.description}
                </p>
              )}
              <span className="mt-5 inline-block border-b border-accent pb-1 font-body text-[13px] font-semibold text-white">
                Descubrir →
              </span>
            </div>
          </a>
        )}
      </div>

    </div>
  );
}
