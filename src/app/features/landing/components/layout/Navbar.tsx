import { useEffect, useState } from 'react';
import LogoIconSvg from '@/assets/LogoIconSvg';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useAuthStore } from '@/app/store/auth/authStore';
import CartDrawerIsland from '@/app/features/cart/CartDrawerIsland';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import AppProviders from '@/app/providers/AppProviders';

const NAV_LINKS = [
  { href: '/',                  label: 'Inicio',             exact: true,  dropdown: false },
  { href: '/catalogo',          label: 'Perfumes',           exact: false, dropdown: true  },
  { href: '/catalogo?tipo=combo', label: 'Combos',           exact: false, dropdown: false },
  { href: '#bajo-pedido',       label: 'Bajo Pedido',        exact: false, dropdown: false },
  { href: '#blog',              label: 'Blog',               exact: false, dropdown: false },
  { href: '#rastrear',          label: 'Rastrear tú pedido', exact: false, dropdown: false },
]

function isLinkActive(href: string, pathname: string, exact: boolean) {
  if (href.startsWith('#')) return false
  if (exact) return pathname === href
  return pathname.startsWith(href)
}

export default function Navbar() {
  const itemCount     = useCartStore((s) => s.itemCount())
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [authOpen, setAuthOpen]     = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [pathname, setPathname]     = useState('')

  useEffect(() => {
    setPathname(window.location.pathname)
  }, [])

  return (
    <AppProviders withToaster>
      {/* Sin border-b — el header flota sobre el hero */}
      <header className="sticky top-0 z-40 bg-[--color-bg]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">

          {/* Logo SVG */}
          <a href="/" className="shrink-0" aria-label="NönDecants — Inicio">
            <LogoIconSvg width={150} height={24} />
          </a>

          {/* ── Nav desktop: links dentro de un pill oscuro ── */}
          <nav
            className="hidden md:flex items-center gap-0.5 rounded-full bg-surface-raised px-1.5 py-1.5"
            aria-label="Navegación principal"
          >
            {NAV_LINKS.map((link) => {
              const active = isLinkActive(link.href, pathname, link.exact)
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={[
                    'flex items-center gap-1 rounded-full px-4 py-1.5 font-heading text-sm font-medium transition-colors',
                    active
                      ? 'bg-accent text-bg'
                      : 'text-white hover:text-accent',
                  ].join(' ')}
                >
                  {link.label}
                  {link.dropdown && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </a>
              )
            })}
          </nav>

          {/* ── Acciones derecha ── */}
          <div className="flex items-center gap-0.5">

            {/* Buscar */}
            <button
              className="hidden md:flex p-2 text-[--color-text-muted] transition-colors hover:text-[--color-accent-hover]"
              aria-label="Buscar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Usuario */}
            {isAuthenticated ? (
              <a
                href="/admin/dashboard"
                className="hidden md:flex p-2 text-[--color-text-muted] transition-colors hover:text-[--color-accent-hover]"
                aria-label="Mi cuenta"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </a>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="hidden md:flex p-2 text-[--color-text-muted] transition-colors hover:text-[--color-accent-hover]"
                aria-label="Ingresar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}

            {/* Favoritos */}
            <button
              className="hidden md:flex p-2 text-[--color-text-muted] transition-colors hover:text-[--color-accent-hover]"
              aria-label="Favoritos"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Carrito */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-[--color-text-muted] transition-colors hover:text-[--color-accent-hover]"
              aria-label="Carrito"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[--color-accent] font-bold text-[9px] text-[--color-bg]">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Hamburger móvil */}
            <button
              className="p-2 text-[--color-text-muted] transition-colors hover:text-[--color-text] md:hidden"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Menú"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                {mobileOpen
                  ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>

        {/* ── Menú móvil ── */}
        {mobileOpen && (
          <div className="border-t border-[--color-border] bg-[--color-surface] px-4 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => {
                const active = isLinkActive(link.href, pathname, link.exact)
                return (
                  <a
                    key={link.label}
                    href={link.href}
                    className={[
                      'flex items-center gap-2 rounded-lg px-3 py-2.5 font-heading text-sm transition-colors',
                      active
                        ? 'bg-accent text-bg'
                        : 'text-white hover:text-accent',
                    ].join(' ')}
                  >
                    {link.label}
                    {link.dropdown && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    )}
                  </a>
                )
              })}
            </div>
            <div className="mt-3 border-t border-[--color-border] pt-3">
              {isAuthenticated ? (
                <a href="/admin/dashboard" className="block font-heading text-xs uppercase tracking-wider text-[--color-accent]">
                  Mi cuenta
                </a>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false) }}
                  className="font-heading text-xs uppercase tracking-wider text-[--color-accent]"
                >
                  Ingresar
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      <CartDrawerIsland />
      <AuthModalIsland open={authOpen} onClose={() => setAuthOpen(false)} />
    </AppProviders>
  )
}
