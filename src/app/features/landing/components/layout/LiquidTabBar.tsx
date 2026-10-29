import { IconHouse, IconSpray, IconGift, IconPlane, IconUserCircle } from './NavIcons';

/* ── Barra flotante inferior (mobile) ────────────────────────────────────
   Rebranding: cápsula negra de la casa con íconos Phosphor; el tab activo se
   pinta de dorado y una "píldora" dorada translúcida se desliza hasta él.
   Solo mobile; oculta en PDP y checkout (tienen su propia barra de compra). */

interface LiquidTabBarProps {
  pathname: string;
  itemCount?: number;
  /** REQ-039 — pestaña "Cuenta": con sesión navega a /mi-cuenta;
      sin sesión abre el modal de login (que incluye crear cuenta). */
  isAuthenticated?: boolean;
  onAuthOpen?: () => void;
}

const TABS = [
  { id: 'inicio', label: 'Inicio', href: '/', Icon: IconHouse },
  { id: 'perfumes', label: 'Perfumes', href: '/catalogo/perfumes', Icon: IconSpray },
  { id: 'combos', label: 'Combos', href: '/catalogo/combos', Icon: IconGift },
  { id: 'pedidos', label: 'Bajo pedido', href: '/bajo-pedido', Icon: IconPlane },
  { id: 'cuenta', label: 'Cuenta', href: '/mi-cuenta', Icon: IconUserCircle },
] as const;

export default function LiquidTabBar({ pathname, isAuthenticated = false, onAuthOpen }: LiquidTabBarProps) {
  // PDP y checkout ya tienen su propia barra fija de conversión
  if (pathname.startsWith('/producto') || pathname.startsWith('/checkout')) {
    return null;
  }

  const activeId = (() => {
    if (pathname.startsWith('/catalogo/perfumes')) return 'perfumes';
    if (pathname.startsWith('/catalogo/combos') || pathname.startsWith('/combo')) return 'combos';
    if (pathname.startsWith('/bajo-pedido')) return 'pedidos';
    if (pathname.startsWith('/mi-cuenta')) return 'cuenta';
    if (pathname === '/') return 'inicio';
    return '';
  })();
  const activeIndex = TABS.findIndex((t) => t.id === activeId);

  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-2.5 z-40 rounded-[22px] bg-text shadow-[0_14px_34px_-12px_rgba(27,25,25,0.55)] md:hidden"
      style={{ bottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="relative grid grid-cols-5">
        {activeIndex >= 0 && (
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-1/5 rounded-2xl bg-accent/15 shadow-[inset_0_0_0_1px_var(--color-accent)] transition-transform duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
        )}
        {TABS.map(({ id, label, href, Icon }) => {
          const active = activeId === id;
          return (
            <a
              key={id}
              href={href}
              aria-current={active ? 'page' : undefined}
              onClick={
                id === 'cuenta' && !isAuthenticated
                  ? (e) => {
                      e.preventDefault();
                      onAuthOpen?.();
                    }
                  : undefined
              }
              className={`relative z-[1] flex h-14 flex-col items-center justify-center gap-[3px] font-body text-[11px] font-semibold transition-colors duration-300 ${
                active ? 'text-accent' : 'text-bg/75'
              }`}
            >
              <Icon
                className={`h-[25px] w-[25px] transition-transform duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-90 ${
                  active ? '-translate-y-0.5 scale-[1.08]' : ''
                }`}
              />
              <span className="whitespace-nowrap">{label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}
