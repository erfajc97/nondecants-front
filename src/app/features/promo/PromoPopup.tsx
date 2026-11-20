import { useEffect, useRef, useState } from 'react';
import { IconClose } from '@/app/features/landing/components/layout/NavIcons';
import { usePromoConfig } from './promoApi';

const SEEN_KEY = 'nd-promo-popup-seen';

function wasSeen(): boolean {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

function markSeen() {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    /* sin sessionStorage: puede repetirse, no es crítico */
  }
}

/**
 * Pop-up de la promo de decants. Sale al abrirse el carrito (en desktop al
 * agregar un producto, en mobile al abrirlo), solo si la promo está activa y
 * una sola vez por sesión. Se cierra con la X, tocando fuera o con Escape.
 */
export default function PromoPopup({ cartOpen }: { cartOpen: boolean }) {
  const config = usePromoConfig();
  const [visible, setVisible] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cartOpen || !config.active || wasSeen()) return;
    const t = setTimeout(() => {
      markSeen();
      setVisible(true);
    }, 450);
    return () => clearTimeout(t);
  }, [cartOpen, config.active]);

  // Si el carrito se cierra, el pop-up también.
  useEffect(() => {
    if (!cartOpen) setVisible(false);
  }, [cartOpen]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopImmediatePropagation();
      setVisible(false);
    };
    window.addEventListener('keydown', onKey, true);
    const id = setTimeout(() => closeRef.current?.focus(), 60);
    return () => {
      window.removeEventListener('keydown', onKey, true);
      clearTimeout(id);
    };
  }, [visible]);

  if (!visible) return null;
  const ordinal = config.every === 3 ? 'tercer' : `${config.every}.º`;
  return (
    <div className="absolute inset-0 z-20 grid place-items-center bg-text/45 p-5" onClick={() => setVisible(false)}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="nd-promo-popup-title"
        onClick={(e) => e.stopPropagation()}
        className="nd-rise relative w-full max-w-[380px] rounded-lg bg-bg px-6 pb-7 pt-9 text-center shadow-xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={() => setVisible(false)}
          aria-label="Cerrar"
          className="absolute right-2 top-2 grid h-[42px] w-[42px] place-items-center rounded-full transition-colors hover:bg-bg-alt"
        >
          <IconClose className="h-5 w-5" />
        </button>
        <p className="font-body text-[11.5px] font-semibold uppercase tracking-[0.12em] text-error">Promo tiempo limitado</p>
        <h3 id="nd-promo-popup-title" className="mt-2 font-display text-[28px] leading-tight text-text">
          Lleva tu {ordinal} decant con {config.percent}% de descuento
        </h3>
      </div>
    </div>
  );
}
