import { useState } from 'react';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useAuthStore } from '@/app/store/auth/authStore';
import CartDrawerIsland from '@/app/features/cart/CartDrawerIsland';
import AuthModalIsland from '@/app/features/auth/AuthModalIsland';
import AppProviders from '@/app/providers/AppProviders';

const NAV_LINKS = [
  { href: '/',           label: 'Inicio' },
  { href: '/catalogo',   label: 'Perfumes' },
  { href: '/catalogo',   label: 'Combos' },
  { href: '#',           label: 'Blog' },
  { href: '#',           label: 'Rastrear pedido' },
];

export default function Navbar() {
  const itemCount = useCartStore((s) => s.itemCount());
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <AppProviders withToaster>
      <header className="sticky top-0 z-40 bg-[--color-bg] border-b border-[--color-border]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <a
            href="/"
            className="font-heading text-xl tracking-widest uppercase text-[--color-accent] shrink-0"
          >
            NönDecants
          </a>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[--color-text-muted] hover:text-[--color-text] transition-colors uppercase tracking-wider"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button
              className="hidden md:flex p-2 text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
              aria-label="Buscar"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Auth / User */}
            {isAuthenticated ? (
              <a
                href="/admin/dashboard"
                className="hidden md:flex p-2 text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
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
                className="hidden md:flex p-2 text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
                aria-label="Ingresar"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}

            {/* Wishlist */}
            <button
              className="hidden md:flex p-2 text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
              aria-label="Favoritos"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </button>

            {/* Cart */}
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative p-2 text-[--color-text-muted] hover:text-[--color-accent] transition-colors"
              aria-label="Carrito"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-[--color-accent] text-[--color-bg] text-[9px] font-bold flex items-center justify-center">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[--color-text-muted]"
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

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-[--color-border] bg-[--color-surface] px-4 py-5 space-y-4">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block text-sm font-heading text-[--color-text-muted] hover:text-[--color-text] uppercase tracking-wider transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 border-t border-[--color-border]">
              {isAuthenticated ? (
                <a href="/admin/dashboard" className="block text-sm text-[--color-accent]">Mi cuenta</a>
              ) : (
                <button
                  onClick={() => { setAuthOpen(true); setMobileOpen(false); }}
                  className="block text-sm text-[--color-accent] font-heading uppercase tracking-wider"
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
  );
}
