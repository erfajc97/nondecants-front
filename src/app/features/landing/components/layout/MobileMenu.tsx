import { useState } from 'react';
import { NAV_LINKS, isLinkActive } from '../../hooks/useNavbarHook';
import { useNormalCategoriesQuery, useBajoPedidoCategoriesQuery, sortCategoriesByHierarchy } from '@/app/tanstack-queries/categoriesQuery';

interface MobileMenuProps {
  pathname: string;
  isAuthenticated?: boolean;
  onAuthOpen?: () => void;
  onClose: () => void;
}

/**
 * Menú móvil (rebranding): opciones en Gloock grande separadas por líneas
 * finas, entrada escalonada; las categorías conservan su despliegue de dos
 * niveles.
 */
export default function MobileMenu({ pathname, onClose }: MobileMenuProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  // Segundo nivel: qué categoría tiene desplegadas sus marcas (una a la vez)
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const { data: normalCategories = [] } = useNormalCategoriesQuery();
  const { data: bajoPedidoCategories = [] } = useBajoPedidoCategoriesQuery();

  return (
    <div className="border-t border-border bg-bg min-[821px]:hidden max-h-[calc(100dvh-58px)] overflow-y-auto pb-24">
      <nav className="flex flex-col px-5 pt-3" aria-label="Navegación móvil">
        {NAV_LINKS.map((link) => {
          const active = isLinkActive(link.href, pathname, link.exact);

          if (link.dropdown) {
            const isOpen = expanded === link.dropdownId;
            const categories = sortCategoriesByHierarchy(
              (link.dropdownId === 'perfumes' ? normalCategories : bajoPedidoCategories)
                .filter((c) => c.name.toLowerCase() !== 'all'),
            );
            const isPerfumes = link.dropdownId === 'perfumes';
            const basePath = isPerfumes ? '/catalogo/perfumes' : '/bajo-pedido';
            // Bajo pedido se vende sellado: ahí no hay decants que ofrecer.
            const catalogLabel = isPerfumes ? 'Catálogo decants →' : 'Ver catálogo →';

            return (
              <div key={link.label} className="border-b border-border">
                <button
                  onClick={() => {
                    setExpanded(isOpen ? null : link.dropdownId!);
                    // Al cambiar de sección se cierran las categorías abiertas
                    setExpandedCat(null);
                  }}
                  className="brand-rise flex w-full items-center justify-between py-3 font-display text-[30px] font-normal leading-[1.1]"
                  aria-expanded={isOpen}
                >
                  {/* Sin marca de activo: la flecha ya dice si está abierto y
                      cualquier subrayado aquí compite con el de las
                      categorías, que sí significa "toca de nuevo para ver". */}
                  <span className="text-text">{link.label}</span>
                  {/* Trazo grueso: a 1.4 la flecha se perdía junto al serif */}
                  <svg
                    className={`h-4 w-4 text-text transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                    strokeLinecap="round" strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="pb-6 pl-1">
                    <a
                      href={basePath}
                      onClick={onClose}
                      className="mb-6 inline-block border-b border-accent pb-1 font-body text-sm font-semibold leading-none text-text transition-colors hover:text-accent-hover"
                    >
                      {catalogLabel}
                    </a>

                    {categories.length === 0 ? (
                      <p className="font-body text-sm text-text-muted">No hay casas disponibles</p>
                    ) : (
                      <div className="flex flex-col gap-5">
                        {categories.map((cat) => {
                          const catOpen = expandedCat === String(cat.id);
                          return (
                            <div key={cat.id}>
                              {/* Dos toques, dos intenciones: el primero abre
                                  las marcas (el menú no puede ser infinito) y
                                  el segundo, ya con la fila subrayada, lleva
                                  al catálogo filtrado por esa categoría. */}
                              <button
                                onClick={() => {
                                  if (catOpen) {
                                    onClose();
                                    window.location.href = `${basePath}?category=${cat.id}`;
                                    return;
                                  }
                                  setExpandedCat(String(cat.id));
                                }}
                                aria-expanded={catOpen}
                                title={
                                  catOpen
                                    ? `Ver los perfumes de ${cat.name}`
                                    : `Ver las marcas de ${cat.name}`
                                }
                                className="flex w-full items-baseline gap-3 pb-1.5 text-left"
                              >
                                {/* Mismo serif curvo de los banners, con peso:
                                    en versalitas finas se perdían contra la línea */}
                                <span
                                  className={`font-display text-xl font-normal leading-none text-text transition-colors hover:underline underline-offset-4 decoration-accent ${
                                    catOpen ? 'underline decoration-accent decoration-2 underline-offset-[6px]' : ''
                                  }`}
                                >
                                  {cat.name}
                                </span>
                                <span className="h-px flex-1 bg-border" />
                                <svg
                                  className={`h-3.5 w-3.5 shrink-0 self-center text-text transition-transform ${catOpen ? 'rotate-180' : ''}`}
                                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                                  strokeLinecap="round" strokeLinejoin="round"
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </button>
                              {catOpen && (
                                <div className="flex flex-col gap-3.5 pt-3">
                                  {cat.marcas.map((sub) => (
                                    <a
                                      key={sub.id}
                                      href={`${basePath}?category=${cat.id}&marca=${sub.id}`}
                                      onClick={onClose}
                                      className="font-body text-[15px] leading-none text-text-soft transition-colors hover:text-text hover:underline underline-offset-4 decoration-accent"
                                    >
                                      {sub.name}
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          return (
            <a
              key={link.label}
              href={link.href}
              onClick={onClose}
              aria-current={active ? 'page' : undefined}
              className="brand-rise border-b border-border py-3 font-display text-[30px] font-normal leading-[1.1] text-text transition-colors hover:text-accent-hover"
            >
              {link.label}
            </a>
          );
        })}
      </nav>

      {/* Fila de utilidades — aviso de envíos + logo de Servientrega (REQ-037) */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 bg-bg-alt px-5 py-6">
        <span className="font-body text-sm text-text-muted">
          Envíos por Servientrega
        </span>
        <img
          src="/servientrega.png"
          alt="Servientrega"
          className="h-12 w-auto object-contain"
        />
        <p className="w-full font-body text-sm text-text-muted">
          WhatsApp +593 99 230 5463 · contacto@nondecants.com
        </p>
      </div>
    </div>
  );
}
