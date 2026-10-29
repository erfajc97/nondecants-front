import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useAuthStore } from '@/app/store/auth/authStore';

export const NAV_LINKS = [
  { href: '/',                   label: 'Inicio',             exact: true,  dropdown: false,      dropdownId: '' },
  { href: '/catalogo/perfumes',  label: 'Perfumes',           exact: true,  dropdown: true,       dropdownId: 'perfumes' },
  { href: '/catalogo/combos',    label: 'Combos',             exact: true,  dropdown: false,      dropdownId: '' },
  { href: '/bajo-pedido',        label: 'Bajo pedido',        exact: true,  dropdown: true,       dropdownId: 'bajoPedido' },
  { href: '/rastrear',           label: 'Rastrear tu pedido', exact: true,  dropdown: false,      dropdownId: '' },
  { href: '/blog',               label: 'Blog',               exact: true,  dropdown: false,      dropdownId: '' },
];

export function isLinkActive(href: string, currentUrl: string, exact: boolean) {
  // Links con hash nunca están activos en la navbar
  if (href.startsWith('#')) return false;

  // Extraer solo pathname (sin query strings)
  const currentPathname = currentUrl.split('?')[0];

  if (exact) {
    return currentPathname === href;
  }

  // Para comparación no exacta, verificar si comienza con href
  return currentPathname.startsWith(href);
}

export function useNavbarHook() {
  const itemCount = useCartStore((s) => s.itemCount());
  const setDrawerOpen = useCartStore((s) => s.setDrawerOpen);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [authOpen, setAuthOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [pathname, setPathname] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pathname tracking + scroll detection
  useEffect(() => {
    const updatePathname = () => {
      const url = window.location.pathname + window.location.search;
      setPathname(url);
    };

    updatePathname();

    window.addEventListener('popstate', updatePathname);
    window.addEventListener('hashchange', updatePathname);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('popstate', updatePathname);
      window.removeEventListener('hashchange', updatePathname);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // REQ-038 — scroll-lock: con el menú móvil abierto, el fondo no se mueve.
  // Se compensa el ancho del scrollbar para evitar el salto de layout y se
  // restaura todo al cerrar el menú (o al desmontar).
  useEffect(() => {
    if (!mobileOpen) return;
    const { body } = document;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    // Si el viewport pasa a desktop con el menú abierto, se cierra solo:
    // el botón hamburguesa es md:hidden y sin esto el scroll quedaría
    // bloqueado sin forma visible de cerrarlo.
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [mobileOpen]);

  // Close dropdown on click outside or Escape
  useEffect(() => {
    if (!openDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openDropdown]);

  const handleDropdownEnter = (dropdownId: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setOpenDropdown(dropdownId);
    setActiveCategory(0);
  };

  const handleDropdownLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  const handleDropdownContentEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleDropdownContentLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 200);
  };

  return {
    itemCount,
    setDrawerOpen,
    isAuthenticated,
    authOpen,
    setAuthOpen,
    mobileOpen,
    setMobileOpen,
    openDropdown,
    setOpenDropdown,
    activeCategory,
    setActiveCategory,
    dropdownRef,
    pathname,
    isScrolled,
    handleDropdownEnter,
    handleDropdownLeave,
    handleDropdownContentEnter,
    handleDropdownContentLeave,
  };
}
