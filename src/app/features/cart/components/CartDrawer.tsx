import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCartStore } from '@/app/store/cart/cartStore';
import { useDialogBehavior } from '@/app/features/landing/components/layout/useDialogBehavior';
import { IconClose } from '@/app/features/landing/components/layout/NavIcons';
import { splitCartStock, getSplit } from '@/app/helpers/cartStockSplit';
import CartDrawerContent from './CartDrawerContent';

/** Rutas donde el carrito ya es la página (no se abre el drawer solo). */
const NO_AUTO_OPEN = ['/carrito', '/checkout', '/orden'];

/**
 * Carrito lateral (prototipo): entra por la derecha en desktop y a pantalla
 * completa en mobile. Se monta una sola vez desde el Navbar y se controla con
 * `useCartStore().isDrawerOpen`, que es global por página: cualquier island
 * (cards, PDP, combos) puede abrirlo con `useCartStore.getState().setDrawerOpen(true)`.
 */
export default function CartDrawer() {
  const open = useCartStore((s) => s.isDrawerOpen);
  const setOpen = useCartStore((s) => s.setDrawerOpen);
  const count = useCartStore((s) => s.itemCount());
  const hydrated = useCartStore((s) => s._hasHydrated);

  const [mounted, setMounted] = useState(false);
  const [everOpened, setEverOpened] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const panelRef = useRef<HTMLElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);
  const prevCount = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (open) setEverOpened(true);
    else setConfirming(false);
  }, [open]);

  const close = () => setOpen(false);
  useDialogBehavior(open, panelRef, () => (confirming ? setConfirming(false) : close()));

  // Al agregar un producto (desde cualquier island) se abre solo en desktop,
  // como en el prototipo. En mobile ya sale el toast de "añadido".
  useEffect(() => {
    if (!hydrated) return;
    if (prevCount.current === null) {
      prevCount.current = count;
      return;
    }
    const grew = count > prevCount.current;
    prevCount.current = count;
    if (!grew || open) return;
    if (NO_AUTO_OPEN.some((p) => window.location.pathname.startsWith(p))) return;
    if (!window.matchMedia('(min-width: 821px)').matches) return;
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [count, hydrated, open, setOpen]);

  // Foco inicial en el botón de cerrar al abrir
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => closeBtnRef.current?.focus(), 80);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (confirming) setTimeout(() => confirmRef.current?.querySelector<HTMLElement>('button')?.focus(), 30);
  }, [confirming]);

  const hasBajo = () => {
    const items = useCartStore.getState().items;
    const splits = splitCartStock(items);
    return items.some((i) => getSplit(splits, i).bajo > 0);
  };

  const goCheckout = () => {
    window.location.href = '/checkout';
  };

  const onCheckout = () => {
    if (hasBajo()) setConfirming(true);
    else goCheckout();
  };

  const node = (
    <>
      <div
        onClick={close}
        aria-hidden="true"
        className={`fixed inset-0 z-[90] bg-text/40 transition-opacity duration-[350ms] motion-reduce:transition-none ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito"
        aria-hidden={!open}
        className={`fixed bottom-0 right-0 top-0 z-[91] flex w-[min(440px,100%)] flex-col bg-bg pr-[env(safe-area-inset-right,0px)] pt-[env(safe-area-inset-top,0px)] shadow-[-20px_0_60px_-30px_rgba(0,0,0,0.4)] transition-[transform,visibility] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          open ? 'visible translate-x-0' : 'invisible translate-x-[102%]'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
          <h2 className="font-display text-[28px] font-normal leading-none text-text">
            Tu carrito
            {hydrated && count > 0 && <span className="ml-2 font-body text-base text-text-muted tabular-nums">({count})</span>}
          </h2>
          <button
            ref={closeBtnRef}
            onClick={close}
            aria-label="Cerrar carrito"
            className="grid h-[42px] w-[42px] place-items-center rounded-full transition-colors hover:bg-bg-alt"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {everOpened && <CartDrawerContent onClose={close} onCheckout={onCheckout} />}

        {confirming && (
          <div className="absolute inset-0 z-10 grid place-items-center bg-text/45 p-5" onClick={() => setConfirming(false)}>
            <div
              ref={confirmRef}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="nd-confirm-title"
              onClick={(e) => e.stopPropagation()}
              className="nd-rise w-full max-w-[380px] rounded-lg bg-bg p-6 text-center shadow-xl"
            >
              <h3 id="nd-confirm-title" className="font-display text-[26px] leading-tight text-text">
                ¿Confirmas tu pedido?
              </h3>
              <p className="mt-2.5 font-body text-[15px] text-text-soft">
                Tu pedido incluye productos bajo pedido que importamos especialmente para ti. Llegan en{' '}
                <b className="text-text">13 a 17 días</b>.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                <button
                  onClick={() => setConfirming(false)}
                  className="h-12 rounded-sm font-body text-sm font-semibold text-text shadow-[inset_0_0_0_1.5px_var(--color-text)] transition-colors hover:bg-bg-alt"
                >
                  Revisar
                </button>
                <button
                  onClick={goCheckout}
                  className="h-12 rounded-sm bg-text font-body text-sm font-semibold text-bg transition-colors hover:bg-text-soft"
                >
                  Sí, confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );

  return mounted ? createPortal(node, document.body) : null;
}
