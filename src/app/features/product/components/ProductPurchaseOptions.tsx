import { useState, useEffect, useRef } from 'react';
import { flyToCart } from '@/app/helpers/flyToCart';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { productUrl } from '@/app/helpers/productUrl';
import { useCartStore } from '@/app/store/cart/cartStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import {
  BACKORDER_LABEL,
  DEFAULT_DISPATCH_CUTOFF_HOUR,
  deliveryRangeShort,
} from '@/app/helpers/deliveryWindow';
import { useDeliveryOffsetQuery, useDispatchCutoffQuery } from '@/app/tanstack-queries/settingsQuery';
import { useProductReviewsQuery } from '@/app/tanstack-queries/reviewsQuery';
import { PAYMENT_LOGOS } from '@/app/components/paymentLogos';
import Stars from '@/app/features/reviews/components/Stars';
import PhosphorIcon, { type PhosphorIconName } from '@/assets/svg/PhosphorIcon';
import type { Product, ProductVariant } from '@/app/types/global.types';

type SelectedOption =
  | { type: 'full' }
  /** Presentación sellada extra (50 ml, 30 ml…) cargada como variante en el admin. */
  | { type: 'sealed'; variant: ProductVariant }
  | { type: 'decant'; variant: ProductVariant };

interface ProductPurchaseOptionsProps {
  product: Product;
  selectedVariant?: ProductVariant | null;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

const TZ = 'America/Guayaquil';
const CARD_BRANDS = ['Payphone', 'Visa', 'Mastercard', 'Diners Club', 'Discover'];

/**
 * ► PUNTO ÚNICO DE "AÑADIR AL CARRITO CON ÉXITO".
 * Se llama justo después de `addItem(...)`, desde "Añadir" y desde la barra
 * fija móvil. Acá se engancha el drawer del carrito (abrirlo, etc.).
 */
function onAddToCartSuccess(_ctx: { productName: string }) {
  // TODO(carrito): abrir el drawer del carrito aquí.
}

/** Chispas + miniatura que vuela al carrito (prototipo). */
function spritz(btn: HTMLElement | null, thumb?: string) {
  if (!btn || typeof window === 'undefined') return;
  if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    btn.classList.remove('pdp-pop');
    void btn.offsetWidth;
    btn.classList.add('pdp-pop');
  }
  flyToCart(btn, thumb);
}

/** Fecha corta en Ecuador "mié 4 nov", sumando `days` desde hoy. */
function shortDateIn(days: number) {
  return new Date(Date.now() + days * 86_400_000)
    .toLocaleDateString('es-EC', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })
    .replace('.', '');
}

/** Segundos transcurridos del día en Ecuador (UTC-5, sin horario de verano). */
function ecuadorSecondsOfDay(now = Date.now()) {
  const s = (now / 1000 - 5 * 3600) % 86400;
  return s < 0 ? s + 86400 : s;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Despacho con cuenta regresiva (prototipo .cd): pulso verde, "Se despacha
 * hoy/mañana", "Llega …", reloj hasta la hora de corte y barra dorada.
 */
export function DispatchCountdown({
  cutoffHour,
  offsetDays,
  stockLeft,
}: {
  cutoffHour: number;
  offsetDays: number;
  stockLeft: number | null;
}) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Antes de montar (SSR/hidratación) no hay reloj: se pinta solo la línea de llegada.
  const sec = now != null ? ecuadorSecondsOfDay(now) : null;
  const h = sec != null ? sec / 3600 : 0;
  const late = sec != null && h >= cutoffHour;
  const left = sec != null ? Math.max(0, (late ? 24 + cutoffHour : cutoffHour) * 3600 - sec) : 0;
  const pct = late ? Math.min(1, (h - cutoffHour) / 24) : Math.min(1, h / cutoffHour);
  const hh = Math.floor(left / 3600);
  const mm = Math.floor((left % 3600) / 60);
  const ss = Math.floor(left % 60);

  return (
    <div className={`grid gap-2 border-y border-border py-3.5 ${late ? 'pdp-late' : ''}`}>
      <div className="flex items-center gap-2.5 font-body text-[15px]">
        <span className="pdp-pulse" aria-hidden />
        <b className="font-semibold">{late ? 'Se despacha mañana' : 'Se despacha hoy'}</b>
        <span className="ml-auto text-[13.5px] text-text-muted">
          Llega {deliveryRangeShort(offsetDays, cutoffHour)}
        </span>
      </div>
      {sec != null && (
        <>
          <div className="flex flex-wrap items-baseline gap-2.5 font-body text-sm text-text-muted">
            <span>Pide en las próximas</span>
            <strong className="font-display text-[26px] font-normal leading-none tracking-[0.02em] text-text max-md:text-[23px]">
              {pad2(hh)}
              <i className="pdp-colon">:</i>
              {pad2(mm)}
              <i className="pdp-colon">:</i>
              <span className="text-accent-hover">{pad2(ss)}</span>
            </strong>
            {stockLeft != null && stockLeft <= 12 && (
              <em className="ml-auto text-[13px] font-semibold not-italic text-error">Quedan {stockLeft}</em>
            )}
          </div>
          <div className="pdp-cd-bar" aria-hidden>
            <i style={{ ['--p' as string]: late ? 1 : pct }} />
          </div>
        </>
      )}
    </div>
  );
}

/** Fila de confianza (prototipo): íconos Phosphor sólidos de 26 px, un solo color. */
export const TRUST: { t: string; l: string; icon: PhosphorIconName }[] = [
  { t: '100%', l: 'Original y sellado', icon: 'sealCheck' },
  { t: '24–72 h', l: 'Envío a todo Ecuador', icon: 'truck' },
  { t: '3 · 5 · 10', l: 'ml decantados aquí', icon: 'dropHalf' },
];

export function TrustRow({ items }: { items: { t: string; l: string; icon: PhosphorIconName }[] }) {
  return (
    <div className="grid grid-cols-3 rounded border border-border text-center font-body text-[12.5px] text-text-muted">
      {items.map((x, i) => (
        <div key={x.l} className={`grid justify-items-center gap-0.5 px-1.5 py-3 ${i > 0 ? 'border-l border-border' : ''}`}>
          <span className="text-text">
            <PhosphorIcon name={x.icon} className="h-[26px] w-[26px]" />
          </span>
          <b className="font-display text-[22px] font-normal leading-none text-accent-hover">{x.t}</b>
          {x.l}
        </div>
      ))}
    </div>
  );
}

export default function ProductPurchaseOptions({
  product,
  onVariantChange,
}: ProductPurchaseOptionsProps) {
  // Default selection: full bottle if available, else first available decant
  const [selected, setSelected] = useState<SelectedOption>(() => {
    // Entra con el primer decant disponible (3 ml); el frasco solo si no hay decants.
    const stock = Number(product.stock ?? 0);
    const openMl = Number(product.openBottleMlRemaining ?? 0);
    const totalAvailMl = openMl + stock * Number(product.totalMl ?? 0);
    const firstAvailable = (product.variants ?? [])
      .filter((v) => !v.isFullBottle && v.ml <= totalAvailMl)
      .sort((a, b) => a.ml - b.ml)[0];
    if (firstAvailable) return { type: 'decant', variant: firstAvailable };
    return { type: 'full' };
  });
  const [hasHydrated, setHasHydrated] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  // Notify parent when selection changes (for gallery image switching)
  const handleSelectFull = () => {
    setSelected({ type: 'full' });
    onVariantChange?.(null);
  };

  const handleSelectDecant = (v: ProductVariant) => {
    setSelected({ type: 'decant', variant: v });
    onVariantChange?.(v);
  };

  useEffect(() => {
    const unsub = useCartStore.subscribe((state: any) => {
      if (state._hasHydrated) setHasHydrated(true);
    });
    if (useCartStore.getState()._hasHydrated) setHasHydrated(true);
    return unsub;
  }, []);

  // ?variant=<id> — se llega desde el "+" de la card con un formato ya elegido.
  // Se aplica tras montar (no en el estado inicial) para no romper la hidratación.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const variantId = new URLSearchParams(window.location.search).get('variant');
    if (!variantId) {
      // Sin ?variant: avisar a la galería del decant con el que entra la ficha.
      if (selected.type === 'decant') onVariantChange?.(selected.variant);
      return;
    }

    const variant = (product.variants ?? []).find((v) => String(v.id) === variantId);
    if (variant && !variant.isFullBottle) {
      setSelected({ type: 'decant', variant });
      onVariantChange?.(variant);
    } else if (variant && sealedExtras.some((s) => s.id === variant.id)) {
      setSelected({ type: 'sealed', variant });
      onVariantChange?.(variant);
    } else {
      setSelected({ type: 'full' });
      onVariantChange?.(null);
    }
  }, [product.id]);

  // Días extra de entrega configurados en el admin (setting opcional).
  const { data: deliveryOffset = 0 } = useDeliveryOffsetQuery();
  const { data: cutoffHour = DEFAULT_DISPATCH_CUTOFF_HOUR } = useDispatchCutoffQuery();
  const { data: reviewsData } = useProductReviewsQuery(product.id);

  // Number(): los decimales llegan como string desde el backend; sin esto las
  // sumas de ml concatenan y la disponibilidad sale mal.
  const fullBottlePrice = Number(product.price ?? 0);
  const fullBottleStock = Number(product.stock ?? 0);
  const fullBottleMl = Number(product.totalMl ?? 0);

  const variants = product.variants ?? [];
  // Siempre de menor a mayor: el orden en que llegan del backend depende del id
  // de creación y dejaba tarjetas salteadas (10 ml antes que 3 ml).
  const byMl = (a: ProductVariant, b: ProductVariant) => a.ml - b.ml;
  const decants = variants.filter((v) => !v.isFullBottle).sort(byMl);
  // Presentaciones selladas cargadas como variante (REQ-056). El backend crea
  // además una variante espejo del frasco del producto: esa no se pinta dos
  // veces, ya es la tarjeta principal.
  const sealedExtras = variants
    .filter((v) => v.isFullBottle && !(v.ml === fullBottleMl && v.price === fullBottlePrice))
    .sort(byMl);

  const isFullSelected = selected.type === 'full';
  const selectedSealed = selected.type === 'sealed' ? selected.variant : null;
  const selectedDecant = selected.type === 'decant' ? selected.variant : null;

  // Price display
  const currentPrice = isFullSelected
    ? fullBottlePrice
    : (selectedSealed?.price ?? selectedDecant?.price ?? 0);
  const discount = product.discount ?? 0;
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? currentPrice * (1 - discount / 100) : currentPrice;
  const savings = currentPrice - discountedPrice;

  // Stock — use available ml to determine what's purchasable
  const openMl = Number(product.openBottleMlRemaining ?? 0);
  const availableMl = openMl + fullBottleStock * fullBottleMl;
  // El flag `bajoPedido` define SOLO la sección (importación exclusiva). El
  // frasco completo SIEMPRE se puede comprar: si no queda stock sellado, se
  // importa bajo pedido. Los decants NO: requieren abrir un frasco real, así
  // que se topan por ml disponible.
  const isBajoPedidoFlag = !!product.bajoPedido;
  const canBuyFullBottle = fullBottlePrice > 0;
  const canBuyDecant = (ml: number) => availableMl >= ml;
  // El frasco va "bajo pedido" cuando está marcado como tal o cuando no queda
  // stock sellado (todas las unidades se importan).
  const fullIsBackorder = isBajoPedidoFlag || fullBottleStock <= 0;
  /**
   * Las presentaciones selladas extra van siempre bajo pedido: no existe stock
   * por variante en la base —el `availableQuantity` que llega es el del frasco
   * principal, así que un 50 ml heredaría el stock de los de 100— y prometer
   * unidades que no están contadas es peor que avisar los 13–17 días.
   */
  const sealedIsBackorder = (_v: ProductVariant) => true;
  // Sólo la opción seleccionada determina el tag/modal de bajo pedido.
  const selectedIsBajoPedido = isFullSelected
    ? fullIsBackorder
    : selectedSealed
      ? sealedIsBackorder(selectedSealed)
      : false;

  const inStock = isFullSelected
    ? canBuyFullBottle
    : selectedSealed
      ? selectedSealed.price > 0
      : selectedDecant
        ? canBuyDecant(selectedDecant.ml)
        : false;

  // Estado de la opción elegida (como el prototipo): agotado / bajo pedido / en stock.
  const statusLabel = !inStock ? 'Agotado' : selectedIsBajoPedido ? 'Bajo pedido' : 'En stock';

  const getCartItem = () => {
    if (isFullSelected) {
      return {
        productId: product.id,
        variantId: `full-${product.id}`,
        name: product.name,
        image: product.image || product.images?.[0] || '',
        ml: fullBottleMl,
        price: hasDiscount ? discountedPrice : fullBottlePrice,
        quantity: 1,
        bajoPedido: fullIsBackorder,
        // Frasco completo: el usuario PUEDE pedir más de lo que hay en stock; el
        // excedente se desglosa como "bajo pedido" en el carrito. Sin tope duro.
        maxQty: undefined,
        // Sin stock sellado → todo bajo pedido (stockAvailable undefined). Con
        // stock parcial → el carrito parte el excedente a bajo pedido.
        stockAvailable: fullIsBackorder ? undefined : fullBottleStock,
        // Pool compartido con los decants: cada frasco vendido lo consume.
        availableMl,
      };
    }
    if (selectedSealed) {
      const backorder = true; // ver `sealedIsBackorder`
      const price = hasDiscount
        ? selectedSealed.price * (1 - discount / 100)
        : selectedSealed.price;
      return {
        productId: product.id,
        variantId: selectedSealed.id,
        name: product.name,
        image: selectedSealed.images?.[0] || product.image || '',
        ml: selectedSealed.ml,
        price,
        quantity: 1,
        bajoPedido: backorder,
        // Frasco sellado: como el principal, se puede pedir de más y el
        // excedente se desglosa como bajo pedido en el carrito.
        maxQty: undefined,
        stockAvailable: backorder ? undefined : Number(selectedSealed.availableQuantity ?? 0),
      };
    }
    if (selectedDecant) {
      return {
        productId: product.id,
        variantId: selectedDecant.id,
        name: product.name,
        image: selectedDecant.images?.[0] || product.image || '',
        ml: selectedDecant.ml,
        price: hasDiscount ? selectedDecant.price * (1 - discount / 100) : selectedDecant.price,
        quantity: 1,
        // El decant no se marca bajo pedido de origen: se topa por las unidades
        // que dan los ml disponibles. Pero si en el carrito hay frascos del
        // mismo producto que consumen esos ml, el excedente sí pasa a bajo
        // pedido (el reparto lo hace `splitCartStock`).
        bajoPedido: false,
        maxQty: selectedDecant.availableQuantity,
        availableMl,
      };
    }
    return null;
  };

  const [pendingAction, setPendingAction] = useState<null | 'add'>(null);
  // Botón desde el que se disparó la acción pendiente (para las chispas tras el modal).
  const pendingBtn = useRef<HTMLElement | null>(null);

  const proceedAdd = (btn?: HTMLElement | null) => {
    const item = getCartItem();
    if (!item) return;
    addItem(item);
    // Se queda en la ficha: agregar no debería sacar al cliente de lo que está
    // mirando. Para ir a pagar está el ícono del carrito.
    sonnerResponse(`${product.name} agregado al carrito.`, 'success');
    spritz(btn ?? null, item.image);
    onAddToCartSuccess({ productName: product.name });
  };

  /** Tamaños del selector, ya ordenados de menor a mayor ml. */
  const sizeTiles = [
    ...(fullBottlePrice > 0
      ? [
          {
            key: 'full',
            ml: fullBottleMl,
            isFull: true,
            status: fullIsBackorder ? 'order' : '',
            active: isFullSelected,
            disabled: !canBuyFullBottle,
            level: 1,
            onClick: canBuyFullBottle ? handleSelectFull : undefined,
          },
        ]
      : []),
    ...sealedExtras.map((v) => ({
      key: v.id,
      ml: v.ml,
      isFull: true,
      status: sealedIsBackorder(v) ? 'order' : '',
      active: selectedSealed?.id === v.id,
      disabled: false,
      level: 1,
      onClick: () => {
        setSelected({ type: 'sealed', variant: v });
        onVariantChange?.(v);
      },
    })),
    ...decants.map((v) => {
      const available = canBuyDecant(v.ml);
      return {
        key: v.id,
        ml: v.ml,
        isFull: false,
        // Un decant sin ml suficientes no se puede servir (hay que abrir un
        // frasco): el tile dice por qué en vez de quedar mudo.
        status: available ? '' : 'out',
        active: selectedDecant?.id === v.id,
        disabled: !available,
        level: Math.min(1, v.ml / 10),
        onClick: available ? () => handleSelectDecant(v) : undefined,
      };
    }),
  ].sort((a, b) => a.ml - b.ml);
  const multiSealed = sizeTiles.filter((t) => t.isFull).length > 1;

  const canPurchase = product.isPurchasable !== false;

  const handleAddToCart = (btn?: HTMLElement | null) => {
    if (!canPurchase) return;
    if (!hasHydrated) { sonnerResponse('Cargando carrito...', 'error'); return; }
    const item = getCartItem();
    if (!item) { sonnerResponse('Selecciona una opcion.', 'error'); return; }
    if (!inStock) { sonnerResponse('No hay stock disponible.', 'error'); return; }
    if (selectedIsBajoPedido) { pendingBtn.current = btn ?? null; setPendingAction('add'); return; }
    proceedAdd(btn);
  };

  const confirmBajoPedido = () => {
    if (pendingAction === 'add') proceedAdd(pendingBtn.current);
    pendingBtn.current = null;
    setPendingAction(null);
  };

  const handleWhatsapp = () => {
    const url =
      typeof window !== 'undefined'
        ? window.location.href
        : `https://nondecants.com${productUrl(product)}`;
    const msg = `Hola, estoy interesado/a en el perfume ${product.name}: ${url}`;
    window.open(`https://wa.me/593992305463?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // ── Presentación ───────────────────────────────────────────────────────
  const selectedMl = isFullSelected ? fullBottleMl : (selectedSealed?.ml ?? selectedDecant?.ml ?? 0);
  const selectedIsFull = isFullSelected || !!selectedSealed;
  const sizeLabel = `${selectedIsFull ? 'Frasco' : 'Decant'} ${selectedMl} ml`;
  const stockLeft =
    selectedDecant && selectedDecant.ml > 0 ? Math.floor(availableMl / selectedDecant.ml) : null;

  const chips = [
    product.gender && (product.gender === 'HOMBRE' ? 'Hombre' : product.gender === 'MUJER' ? 'Mujer' : 'Unisex'),
    product.concentration &&
      product.concentration
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .replace(' De ', ' de '),
    product.timeOfDay && (product.timeOfDay === 'DIA' ? 'Día' : 'Noche'),
    product.projection &&
      (product.projection === 'DISCRETA'
        ? 'Proyección discreta'
        : product.projection === 'MODERADA'
          ? 'Proyección moderada'
          : 'Proyección alta'),
  ].filter(Boolean) as string[];

  const addLabel = !inStock
    ? 'Agotado'
    : `${selectedIsBajoPedido && (isFullSelected || selectedSealed) ? 'Pedir frasco' : 'Agregar al carrito'} · ${formatCurrency(discountedPrice)}`;

  // Favorito: solo local (no hay lista de deseos en el back todavía).
  const favKey = `nd:fav:${product.id}`;
  const [fav, setFav] = useState(false);
  const [favPop, setFavPop] = useState(false);
  useEffect(() => {
    try {
      setFav(localStorage.getItem(favKey) === '1');
    } catch {
      /* sin almacenamiento */
    }
  }, [favKey]);
  const toggleFav = () => {
    const next = !fav;
    setFav(next);
    setFavPop(true);
    window.setTimeout(() => setFavPop(false), 520);
    try {
      if (next) localStorage.setItem(favKey, '1');
      else localStorage.removeItem(favKey);
    } catch {
      /* sin almacenamiento */
    }
  };

  // Barra fija móvil: aparece cuando los CTAs del flujo salen por arriba.
  const ctasRef = useRef<HTMLDivElement>(null);
  const [stickyOn, setStickyOn] = useState(false);
  useEffect(() => {
    const node = ctasRef.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([en]) => {
      setStickyOn(!en.isIntersecting && en.boundingClientRect.top < 0);
    });
    io.observe(node);
    return () => io.disconnect();
  }, [canPurchase]);

  // Fechas de llegada bajo pedido, solo en cliente (dependen de "hoy").
  const [backorderDates, setBackorderDates] = useState<string | null>(null);
  useEffect(() => {
    setBackorderDates(`${shortDateIn(13)} y el ${shortDateIn(17)}`);
  }, []);

  const waIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.996 2C6.474 2 2 6.474 2 11.996C2 13.921 2.548 15.717 3.511 17.25L2.146 22.18L7.204 20.852C8.683 21.688 10.297 22.158 11.996 22.158C17.518 22.158 22 17.684 22 12.162C22 6.64 17.518 2.166 11.996 2.166V2ZM17.152 16.315C16.94 16.91 16.1 17.433 15.441 17.545C14.945 17.625 14.284 17.682 11.838 16.669C8.91 15.452 7.027 12.441 6.884 12.253C6.741 12.064 5.72 10.71 5.72 9.31C5.72 7.91 6.442 7.238 6.741 6.93C6.983 6.681 7.404 6.551 7.82 6.551C7.962 6.551 8.089 6.558 8.199 6.564C8.484 6.577 8.627 6.602 8.814 7.051C9.05 7.618 9.623 9.022 9.693 9.172C9.764 9.322 9.851 9.531 9.742 9.742C9.643 9.941 9.551 10.035 9.408 10.203C9.266 10.372 9.13 10.493 8.979 10.672C8.847 10.832 8.694 10.992 8.865 11.282C9.036 11.571 9.625 12.532 10.489 13.303C11.603 14.298 12.51 14.611 12.83 14.743C13.151 14.875 13.34 14.856 13.568 14.613C13.797 14.368 14.441 13.621 14.713 13.313C14.985 13.003 15.241 13.041 15.526 13.144C15.811 13.248 17.324 13.996 17.625 14.145C17.925 14.295 18.125 14.369 18.196 14.494C18.267 14.618 18.267 15.308 17.965 15.939L17.152 16.315Z" />
    </svg>
  );
  const btnBase =
    'pdp-btn relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-[3px] font-body font-semibold tracking-[0.01em] transition-[background-color,color,transform] duration-200 active:scale-[0.97]';

  // Misma fuente y mismo criterio que la sección de reseñas (ProductReviews).
  const hasReviews = !!reviewsData && reviewsData.count > 0 && (reviewsData.reviews?.length ?? 0) > 0;
  const reviewCount = hasReviews ? reviewsData!.count : 0;
  const reviewAvg = hasReviews ? reviewsData!.average : 0;

  return (
    <div className="grid gap-4 text-text">
      {/* Marca + favorito */}
      <div className="flex items-center justify-between font-body text-sm text-text-muted">
        {product.marca?.name ? (
          <a
            href={`/catalogo/perfumes?marca=${product.marca.slug || product.marca.id}`}
            className="text-left font-body text-[15px] font-semibold text-text transition-colors hover:underline hover:underline-offset-[3px]"
          >
            {product.marca.name}{' '}
            <span className="text-[13.5px] font-normal text-accent-hover">· ver todos sus perfumes →</span>
          </a>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={toggleFav}
          aria-pressed={fav}
          aria-label="Guardar en favoritos"
          className={`pdp-fav shrink-0 text-text-muted transition-colors hover:text-text ${favPop ? 'pop' : ''}`}
        >
          <svg className="h0" width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
            <path d="M12 20s-7-4.5-9-9.5C1.5 6.5 4.5 4 7.5 5 9 5.5 12 8 12 8s3-2.5 4.5-3c3-1 6 1.5 4.5 6.5-2 5-9 9.5-9 9.5z" />
          </svg>
          <svg className="h1" width="23" height="23" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 20s-7-4.5-9-9.5C1.5 6.5 4.5 4 7.5 5 9 5.5 12 8 12 8s3-2.5 4.5-3c3-1 6 1.5 4.5 6.5-2 5-9 9.5-9 9.5z" />
          </svg>
        </button>
      </div>

      <h1 className="font-display text-[clamp(38px,4vw,56px)] font-normal leading-none tracking-[-0.02em] text-text">
        {product.name}
      </h1>

      {/* Valoración → ancla a las reseñas */}
      <a href="#p-rev" className="inline-flex w-fit items-center gap-2 font-body text-[13.5px] text-text-soft">
        {reviewCount > 0 ? (
          <>
            <Stars rating={reviewAvg} />
            <u className="underline-offset-[3px]">
              {reviewAvg.toFixed(1).replace('.', ',')} · {reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}
            </u>
          </>
        ) : (
          <u className="underline-offset-[3px]">Sé el primero en dejar una reseña</u>
        )}
      </a>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {chips.map((c) => (
            <span key={c} className="rounded-full bg-bg-alt px-2.5 py-[5px] font-body text-[12.5px] text-text-soft">
              {c}
            </span>
          ))}
        </div>
      )}

      {product.description && (
        <p className="font-body text-base leading-normal text-text-soft">{product.description}</p>
      )}

      {/* Selector de tamaño */}
      <div>
        <div className="mb-2 flex items-center justify-between font-body text-sm font-semibold">
          <span>1. Elige tu tamaño</span>
          <span
            className={`flex items-center gap-2 text-sm font-semibold before:h-2 before:w-2 before:rounded-full before:bg-current before:content-[''] ${
              statusLabel === 'En stock' ? 'text-success' : 'text-warning'
            }`}
          >
            {statusLabel}
          </span>
        </div>
        {/* Un solo listado ordenado de menor a mayor ml, sin importar si es
            decant o frasco: así el cliente lee la escala de un vistazo. */}
        <div
          role="group"
          aria-label="Tamaño"
          className="grid gap-1"
          style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(sizeTiles.length, 1), 5)}, minmax(0, 1fr))` }}
        >
          {sizeTiles.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={t.onClick}
              disabled={t.disabled}
              aria-pressed={t.active}
              style={{ ['--lv' as string]: t.level }}
              className={`size-tile flex h-[54px] flex-col items-center justify-center rounded-[3px] border font-body leading-[1.15] transition-[border-color,background-color] duration-200 active:scale-[0.97] ${
                t.active
                  ? 'border-text bg-text text-white'
                  : t.disabled
                    ? 'cursor-not-allowed border-border text-text-muted/60 line-through'
                    : `border-border text-text hover:border-text-muted/50 ${t.status === 'order' ? 'border-dashed' : ''}`
              }`}
            >
              <b className="text-[15px] font-bold">
                {t.isFull ? (multiSealed ? `Frasco ${t.ml}` : 'Frasco') : `${t.ml} ml`}
              </b>
              {t.status === 'order' && (
                <small className={`text-[13px] ${t.active ? 'text-accent' : 'text-warning'}`}>Bajo pedido</small>
              )}
              {t.status === 'out' && <small className="text-[13px]">Agotado</small>}
            </button>
          ))}
        </div>
      </div>

      {/* Precio + ahorro */}
      <div>
        <div className="font-body text-[32px] font-bold leading-none">
          <span key={`${selected.type}-${selectedMl}`} className="pdp-tick">
            {formatCurrency(discountedPrice)}
          </span>
          <small className="ml-2 text-sm font-normal text-text-muted">{sizeLabel}</small>
        </div>
        {hasDiscount && (
          <p className="mt-2 flex flex-wrap items-center gap-x-2.5 font-body text-[13.5px] text-text-muted">
            <s>{formatCurrency(currentPrice)}</s>
            <span className="rounded-full bg-gold-light px-2 py-0.5 text-xs font-semibold text-accent-hover">
              Ahorras {formatCurrency(savings)} · -{Math.round(discount)}%
            </span>
          </p>
        )}
      </div>

      {/* Despacho / bajo pedido */}
      {!inStock ? (
        <div className="border-y border-border py-3.5 font-body text-[15px]">
          <b className="font-semibold text-warning">Sin stock por ahora</b>
        </div>
      ) : selectedIsBajoPedido ? (
        <div className="border-y border-border py-3.5 font-body text-[15px]">
          <b className="font-semibold text-warning">Bajo pedido</b>
          <br />
          <span className="text-text-soft">
            {backorderDates ? `Llega entre el ${backorderDates}` : `Llega en ${BACKORDER_LABEL}`}
          </span>
        </div>
      ) : (
        <DispatchCountdown cutoffHour={cutoffHour} offsetDays={deliveryOffset} stockLeft={stockLeft} />
      )}

      {/* CTAs */}
      <div ref={ctasRef}>
        {canPurchase ? (
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <button
              type="button"
              onClick={(e) => handleAddToCart(e.currentTarget)}
              disabled={!inStock}
              className={`${btnBase} h-[56px] bg-text px-6 text-[14.5px] text-white hover:bg-[#34312f] disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {addLabel}
            </button>
            <button
              type="button"
              onClick={handleWhatsapp}
              className={`${btnBase} h-[56px] bg-white px-3 text-[14.5px] text-[#1c8f4a] shadow-[inset_0_0_0_1.5px_#1c8f4a] hover:bg-[#1c8f4a] hover:text-white`}
            >
              {waIcon}
              Pedir por WhatsApp
            </button>
          </div>
        ) : (
          <p className="rounded-[3px] border border-border bg-bg-alt px-4 py-3.5 text-center font-body text-sm font-semibold text-text-muted">
            No disponible para compra
          </p>
        )}
      </div>

      {/* Confianza */}
      <TrustRow items={TRUST} />

      {/* Medios de pago */}
      <div className="grid gap-2.5 border-t border-border pt-3.5">
        {[
          ['Tarjeta vía Payphone', PAYMENT_LOGOS.filter((l) => CARD_BRANDS.includes(l.alt))],
          ['Transferencia o depósito', PAYMENT_LOGOS.filter((l) => !CARD_BRANDS.includes(l.alt))],
        ].map(([label, logos]) => (
          <div key={label as string} className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="min-w-[150px] font-body text-xs text-text-muted">{label as string}</span>
            <span className="inline-flex flex-wrap items-center gap-1.5">
              {(logos as typeof PAYMENT_LOGOS).map((logo) => (
                <img
                  key={logo.alt}
                  src={logo.src}
                  alt={logo.alt}
                  title={logo.alt}
                  loading="lazy"
                  className={`${logo.cls} w-auto object-contain`}
                />
              ))}
            </span>
          </div>
        ))}
      </div>

      {/* Móvil: barra fija sobre la navegación inferior, visible al pasar los CTAs. */}
      {canPurchase && (
        <div
          aria-hidden={!stickyOn}
          className={`fixed inset-x-0 bottom-[calc(var(--bnav-h,0px)+env(safe-area-inset-bottom,0px))] z-[44] grid grid-cols-[minmax(0,1fr)_58px] gap-2 border-t border-border bg-white px-2.5 py-2 shadow-[0_-8px_24px_-16px_rgba(27,25,25,0.3)] transition-[transform,visibility] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden ${
            stickyOn ? 'visible translate-y-0' : 'invisible translate-y-[calc(100%+120px)]'
          }`}
        >
          <button
            type="button"
            tabIndex={stickyOn ? 0 : -1}
            onClick={(e) => handleAddToCart(e.currentTarget)}
            disabled={!inStock}
            className={`${btnBase} h-[52px] bg-text px-3 text-sm text-white disabled:opacity-50`}
          >
            {!inStock ? 'Agotado' : `${selectedIsBajoPedido && selectedIsFull ? 'Pedir' : 'Agregar'} · ${formatCurrency(discountedPrice)}`}
          </button>
          <button
            type="button"
            tabIndex={stickyOn ? 0 : -1}
            onClick={handleWhatsapp}
            title="Consultar por WhatsApp"
            aria-label="Pedir por WhatsApp"
            className={`${btnBase} h-[52px] bg-white px-0 text-[#1c8f4a] shadow-[inset_0_0_0_1.5px_#1c8f4a]`}
          >
            {waIcon}
          </button>
        </div>
      )}

      {pendingAction !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPendingAction(null)}>
          <div className="flex w-full max-w-md flex-col gap-4 rounded-sm border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-warning" />
              <div>
                <h3 className="font-display text-2xl text-text">Producto bajo pedido</h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-text-soft">
                  Este producto se importa bajo pedido. Tras confirmar el pago, la entrega estimada es de <span className="text-text">13–17 días</span>. ¿Deseas continuar?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingAction(null)} className="rounded-[3px] border border-border px-5 py-2.5 font-body text-sm font-semibold text-text-soft hover:border-text hover:text-text">
                Cancelar
              </button>
              <button onClick={confirmBajoPedido} className="rounded-[3px] bg-text px-5 py-2.5 font-body text-sm font-semibold text-white hover:bg-[#34312f]">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
