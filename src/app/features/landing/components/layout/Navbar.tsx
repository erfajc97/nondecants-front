import { useEffect, useState } from 'react';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import AppProviders from '@/app/providers/AppProviders';
import { useNavbarHook } from '../../hooks/useNavbarHook';
import AnnouncementBar from './AnnouncementBar';
import PerfumesMegaMenu from './PerfumesMegaMenu';
import MobileMenu from './MobileMenu';
import NavbarSearch from './NavbarSearch';
import BottomNav from './BottomNav';
import CartDrawer from '@/app/features/cart/components/CartDrawer';
import { useCartStore } from '@/app/store/cart/cartStore';
import { isLinkActive } from '../../hooks/useNavbarHook';
import { IconUserCircle, IconTote, IconList, IconClose } from './NavIcons';

export default function Navbar() {
  const {
    itemCount: storedItemCount,
    isAuthenticated: storedIsAuthenticated,
    authOpen,
    setAuthOpen,
    mobileOpen,
    setMobileOpen,
    openDropdown,
    setOpenDropdown,
    dropdownRef,
    pathname,
    handleDropdownEnter,
    handleDropdownLeave,
    handleDropdownContentEnter,
    handleDropdownContentLeave,
  } = useNavbarHook();

  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const drawerOpen = useCartStore((s) => s.isDrawerOpen);

  // Carrito y sesión viven en localStorage: en el primer render del cliente deben
  // coincidir con el HTML del servidor (vacío / sin sesión) o React descarta el SSR.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  const itemCount = mounted ? storedItemCount : 0;
  const isAuthenticated = mounted ? storedIsAuthenticated : false;

  const megaMode =
    openDropdown === 'perfumes' ? 'perfumes'
    : openDropdown === 'bajoPedido' ? 'bajoPedido'
    : null;

  const navCls =
    'nav-u py-2.5 font-body text-[14px] font-medium text-text-soft transition-colors hover:text-text aria-[current=page]:text-text';

  // Enlace simple del nav
  const NavLink = ({ label, href }: { label: string; href: string }) => (
    <a
      href={href}
      onMouseEnter={() => setOpenDropdown(null)}
      aria-current={isLinkActive(href, pathname, true) ? 'page' : undefined}
      className={navCls}
    >
      {label}
    </a>
  );

  // Trigger de los items con mega menú (Perfumes / Bajo pedido): el subrayado
  // dorado queda marcado mientras el panel está abierto.
  const MegaTrigger = ({ id, label, href }: { id: string; label: string; href: string }) => (
    <span
      onMouseEnter={() => handleDropdownEnter(id)}
      onMouseLeave={handleDropdownLeave}
      className="flex items-center"
    >
      <a
        href={href}
        aria-haspopup="true"
        aria-expanded={openDropdown === id}
        data-open={openDropdown === id}
        aria-current={isLinkActive(href, pathname, true) ? 'page' : undefined}
        className={`${navCls} ${openDropdown === id ? 'text-text' : ''}`}
      >
        {label}
      </a>
    </span>
  );

  const ib =
    'relative grid h-[42px] w-[42px] place-items-center rounded-full text-text transition-colors hover:bg-bg-alt';

  return (
    <AppProviders withToaster>
      {/* Barra de avisos — marquee negro, fuera del header sticky */}
      <AnnouncementBar />

      <header
        data-scrolled={scrolled}
        className="sticky top-0 z-30 border-b border-border bg-bg/95 text-text backdrop-blur-md transition-shadow duration-300 data-[scrolled=true]:shadow-[0_8px_24px_-16px_rgba(27,25,25,0.35)]"
      >
        <div className="relative">
          <div className="mx-auto grid h-[58px] max-w-[1480px] grid-cols-[1fr_auto] items-center gap-1 px-[max(16px,3.4vw)] min-[821px]:h-[66px] min-[821px]:grid-cols-[1fr_auto_1fr] min-[821px]:gap-4 min-[821px]:px-[min(52px,3.4vw)]">
            {/* Izquierda: logo */}
            <a href="/" className="block justify-self-start text-text" aria-label="NonDecants — Inicio">
              <img
                src="/logonondecants.png"
                alt="NonDecants"
                width={543}
                height={127}
                className="h-6 w-auto min-[821px]:h-7"
              />
            </a>

            {/* Centro: nav desktop */}
            <nav className="hidden items-center gap-8 min-[821px]:flex" aria-label="Navegación principal">
              <NavLink label="Inicio" href="/" />
              <MegaTrigger id="perfumes" label="Perfumes" href="/catalogo/perfumes" />
              <NavLink label="Combos" href="/catalogo/combos" />
              <MegaTrigger id="bajoPedido" label="Bajo pedido" href="/bajo-pedido" />
              <NavLink label="Blog" href="/blog" />
            </nav>

            {/* Derecha: herramientas */}
            <div
              className="flex items-center justify-end gap-0.5"
              onMouseEnter={() => setOpenDropdown(null)}
            >
              <NavbarSearch />
              <a href="/cuenta" className={`${ib} hidden min-[821px]:grid`} aria-label="Mi cuenta">
                <IconUserCircle />
              </a>
              <a
                href="/carrito"
                className={ib}
                aria-label={itemCount > 0 ? `Carrito (${itemCount})` : 'Carrito'}
                aria-haspopup="dialog"
                data-cart-target
                aria-expanded={drawerOpen}
                onClick={(e) => {
                  // En /carrito y /checkout el carrito ya es la página: navega normal.
                  if (/^\/(carrito|checkout)/.test(window.location.pathname)) return;
                  e.preventDefault();
                  setDrawerOpen(true);
                }}
              >
                <IconTote />
                {itemCount > 0 && (
                  <span className="absolute right-0.5 top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-accent px-1 font-body text-[10.5px] font-extrabold tabular-nums text-text">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </a>
              <button
                className={`${ib} min-[821px]:hidden`}
                onClick={() => setMobileOpen((o) => !o)}
                aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <IconClose /> : <IconList />}
              </button>
            </div>
          </div>

          {/* Mega menú — Perfumes o Bajo Pedido */}
          {megaMode && (
            <PerfumesMegaMenu
              key={megaMode}
              mode={megaMode}
              onClose={() => setOpenDropdown(null)}
              dropdownRef={dropdownRef}
              onMouseEnter={handleDropdownContentEnter}
              onMouseLeave={handleDropdownContentLeave}
            />
          )}
        </div>

        {/* Menú móvil */}
        {mobileOpen && (
          <MobileMenu
            pathname={pathname}
            isAuthenticated={isAuthenticated}
            onAuthOpen={() => setAuthOpen(true)}
            onClose={() => setMobileOpen(false)}
          />
        )}
      </header>

      {/* Barra flotante inferior (mobile) */}
      <BottomNav
        pathname={pathname}
        itemCount={itemCount}
        isAuthenticated={isAuthenticated}
        onAuthOpen={() => setAuthOpen(true)}
      />

      <CartDrawer />
      <AuthModalIsland open={authOpen} onClose={() => setAuthOpen(false)} />
    </AppProviders>
  );
}
