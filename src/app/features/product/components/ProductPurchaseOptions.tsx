import { useState, useEffect } from 'react';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import DeliveryEta from '@/app/components/UI/DeliveryEta';
import TrustIcons from '@/app/components/UI/TrustIcons';
import { productUrl } from '@/app/helpers/productUrl';
import { useCartStore } from '@/app/store/cart/cartStore';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import { DEFAULT_DISPATCH_CUTOFF_HOUR } from '@/app/helpers/deliveryWindow';
import { useDeliveryOffsetQuery, useDispatchCutoffQuery } from '@/app/tanstack-queries/settingsQuery';
import PaymentMethodIcons from '@/app/components/PaymentMethodIcons';
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

export default function ProductPurchaseOptions({
  product,
  selectedVariant: externalVariant,
  onVariantChange,
}: ProductPurchaseOptionsProps) {
  // Default selection: full bottle if available, else first available decant
  const [selected, setSelected] = useState<SelectedOption>(() => {
    const stock = Number(product.stock ?? 0);
    if (stock > 0) return { type: 'full' };
    const openMl = Number(product.openBottleMlRemaining ?? 0);
    const totalAvailMl = openMl + stock * Number(product.totalMl ?? 0);
    const firstAvailable = (product.variants ?? [])
      .filter(v => !v.isFullBottle && v.ml <= totalAvailMl)
      .sort((a, b) => a.ml - b.ml)[0];
    if (firstAvailable) return { type: 'decant', variant: firstAvailable };
    return { type: 'full' };
  });
  const [hasHydrated, setHasHydrated] = useState(false);

  const addItem = useCartStore((s) => s.addItem);

  // Sync external variant prop
  useEffect(() => {
    if (externalVariant === null) {
      setSelected({ type: 'full' });
    }
  }, [externalVariant]);

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
    if (!variantId) return;

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

  // Number(): los decimales llegan como string desde el backend; sin esto las
  // sumas de ml concatenan y la disponibilidad sale mal.
  const fullBottlePrice = Number(product.price ?? 0);
  const fullBottleStock = Number(product.stock ?? 0);
  const fullBottleMl = Number(product.totalMl ?? 0);

  const variants = product.variants ?? [];
  // Siempre de menor a mayor: el orden en que llegan del backend depende del id
  // de creación y dejaba tarjetas salteadas (10 ml antes que 3 ml).
  const byMl = (a: ProductVariant, b: ProductVariant) => a.ml - b.ml;
  const decants = variants.filter(v => !v.isFullBottle).sort(byMl);
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
      : selectedDecant ? canBuyDecant(selectedDecant.ml) : false;

  const hasImmediateStock = fullBottleStock > 0 || availableMl > 0;
  const statusLabel = hasImmediateStock
    ? 'En stock'
    : canBuyFullBottle || isBajoPedidoFlag ? 'Bajo pedido' : 'Agotado';
  const statusIsBad = statusLabel === 'Agotado';

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

  const [pendingAction, setPendingAction] = useState<null | 'add' | 'fast'>(null);

  const proceedAdd = () => {
    const item = getCartItem();
    if (!item) return;
    addItem(item);
    // Se queda en la ficha: agregar no debería sacar al cliente de lo que está
    // mirando. Para ir a pagar está "Comprar ahora" y el ícono del carrito.
    sonnerResponse(`${product.name} agregado al carrito.`, 'success');
  };

  const proceedFastPurchase = () => {
    const item = getCartItem();
    if (!item) return;
    addItem(item);
    window.location.href = '/checkout';
  };

  /** Tarjetas del selector, ya ordenadas de menor a mayor ml. */
  const formatCards = [
    ...(fullBottlePrice > 0
      ? [
          {
            key: 'full',
            ml: fullBottleMl,
            // "Disponible" en vez de "Sellada": lo que el cliente necesita saber
            // es que ese frasco se puede llevar hoy.
            type: fullBottleStock > 0 ? 'Disponible' : 'Bajo pedido',
            price: fullBottlePrice,
            active: isFullSelected,
            disabled: !canBuyFullBottle,
            // El frasco completo lleva el marco dorado para que resalte.
            highlight: true,
            onClick: canBuyFullBottle ? handleSelectFull : undefined,
          },
        ]
      : []),
    ...sealedExtras.map((v) => ({
      key: v.id,
      ml: v.ml,
      type: sealedIsBackorder(v) ? 'Bajo pedido' : 'Disponible',
      price: v.price,
      active: selectedSealed?.id === v.id,
      disabled: false,
      highlight: true,
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
        // Un decant sin ml suficientes no se puede servir (hay que abrir un
        // frasco): la tarjeta dice por qué en vez de quedar muda.
        type: available ? 'Decant' : 'Sin stock',
        price: v.price,
        active: selectedDecant?.id === v.id,
        disabled: !available,
        highlight: false,
        onClick: available ? () => handleSelectDecant(v) : undefined,
      };
    }),
  ].sort((a, b) => a.ml - b.ml);

  const canPurchase = product.isPurchasable !== false;

  const handleAddToCart = () => {
    if (!canPurchase) return;
    if (!hasHydrated) { sonnerResponse('Cargando carrito...', 'error'); return; }
    const item = getCartItem();
    if (!item) { sonnerResponse('Selecciona una opcion.', 'error'); return; }
    if (!inStock) { sonnerResponse('No hay stock disponible.', 'error'); return; }
    if (selectedIsBajoPedido) { setPendingAction('add'); return; }
    proceedAdd();
  };

  const handleFastPurchase = () => {
    if (!canPurchase) return;
    if (!hasHydrated) { sonnerResponse('Cargando carrito...', 'error'); return; }
    const item = getCartItem();
    if (!item) { sonnerResponse('Selecciona una opcion.', 'error'); return; }
    if (!inStock) { sonnerResponse('No hay stock disponible.', 'error'); return; }
    if (selectedIsBajoPedido) { setPendingAction('fast'); return; }
    proceedFastPurchase();
  };

  const confirmBajoPedido = () => {
    if (pendingAction === 'add') proceedAdd();
    else if (pendingAction === 'fast') proceedFastPurchase();
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

  const detailTags = [
    product.gender && { label: 'Género', value: product.gender === 'HOMBRE' ? 'Hombre' : product.gender === 'MUJER' ? 'Mujer' : 'Unisex' },
    product.concentration && { label: 'Concentración', value: product.concentration.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).replace('De ', 'de ') },
    product.timeOfDay && { label: 'Hora', value: product.timeOfDay === 'DIA' ? 'Día' : 'Noche' },
    product.projection && { label: 'Proyección', value: product.projection === 'DISCRETA' ? 'Discreta' : product.projection === 'MODERADA' ? 'Moderada' : 'Alta' },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="flex flex-col gap-4 text-text">
      {/* Title */}
      <div>
        {detailTags.length > 0 && (
          <span className="font-body text-[10px] uppercase tracking-[0.22em] text-text-muted">
            {detailTags.map((t) => t.value).join(' · ')}
          </span>
        )}
        {/* La casa, sobre el nombre y enlazada a su catálogo: es lo primero que
            busca quien ya conoce la marca. */}
        {product.marca?.name && (
          <a
            href={`/catalogo/perfumes?marca=${product.marca.slug || product.marca.id}`}
            className="mt-2 block w-fit font-body text-xs uppercase tracking-[0.2em] text-text transition-colors hover:text-accent"
          >
            {product.marca.name}
          </a>
        )}
        <div className="mt-1.5 flex items-start justify-between gap-3">
          <h1 className="font-display text-3xl font-light leading-[0.98] tracking-[-0.025em] text-text md:text-4xl">{product.name}</h1>
          <button className="mt-1 shrink-0 text-text-muted transition-colors hover:text-accent" aria-label="Favorito">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M12 20s-7-4.5-9-9.5C1.5 6.5 4.5 4 7.5 5 9 5.5 12 8 12 8s3-2.5 4.5-3c3-1 6 1.5 4.5 6.5-2 5-9 9.5-9 9.5z" />
            </svg>
          </button>
        </div>
        <div className="mt-2">
          <span className={`font-body text-[11px] uppercase tracking-[0.16em] ${statusIsBad ? 'text-error' : 'text-text-muted'}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      {/* Selector de formato */}
      <div>
        <p className="eyebrow mb-2.5">Selecciona tu formato</p>
        {/* Tarjetas cuadradas y compactas (tamaño fijo, no se estiran) */}
        {/* Un solo listado ordenado de menor a mayor ml, sin importar si es
            decant o frasco: así el cliente lee la escala de un vistazo. */}
        <div className="flex flex-wrap gap-2">
          {formatCards.map((card) => (
            <SizeCard
              key={card.key}
              ml={card.ml}
              type={card.type}
              price={card.price}
              discount={discount}
              active={card.active}
              disabled={card.disabled}
              highlight={card.highlight}
              onClick={card.onClick}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-hidden border-y border-border bg-bg-alt/60 px-4 py-3.5 -mx-4">
        <DeliveryEta
          variant={selectedIsBajoPedido ? 'backorder' : 'immediate'}
          offsetDays={deliveryOffset}
          cutoffHour={cutoffHour}
        />
        <div className="mt-3.5 border-t border-border/80 pt-3.5">
          <TrustIcons />
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 flex flex-col gap-2 border-t border-border bg-bg/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-sm md:static md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {canPurchase ? (
          <>
        <button
          onClick={handleAddToCart}
          /* Marco dorado en loop en el CTA de añadir. */
          className="gold-frame flex w-full items-center justify-center gap-2 bg-text py-3.5 font-body text-xs font-medium uppercase tracking-[0.2em] text-bg transition-colors hover:bg-accent"
        >
          Añadir — {formatCurrency(discountedPrice)}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12h14M14 6l6 6-6 6" /></svg>
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleFastPurchase}
            className="flex-1 border border-border py-3 font-body text-xs uppercase tracking-[0.2em] text-text transition-colors hover:border-text"
          >
            Comprar ahora
          </button>
          <button
            onClick={handleWhatsapp}
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center bg-green-700 text-white transition-colors hover:bg-green-600"
            title="Consultar por WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.996 2C6.474 2 2 6.474 2 11.996C2 13.921 2.548 15.717 3.511 17.25L2.146 22.18L7.204 20.852C8.683 21.688 10.297 22.158 11.996 22.158C17.518 22.158 22 17.684 22 12.162C22 6.64 17.518 2.166 11.996 2.166V2ZM17.152 16.315C16.94 16.91 16.1 17.433 15.441 17.545C14.945 17.625 14.284 17.682 11.838 16.669C8.91 15.452 7.027 12.441 6.884 12.253C6.741 12.064 5.72 10.71 5.72 9.31C5.72 7.91 6.442 7.238 6.741 6.93C6.983 6.681 7.404 6.551 7.82 6.551C7.962 6.551 8.089 6.558 8.199 6.564C8.484 6.577 8.627 6.602 8.814 7.051C9.05 7.618 9.623 9.022 9.693 9.172C9.764 9.322 9.851 9.531 9.742 9.742C9.643 9.941 9.551 10.035 9.408 10.203C9.266 10.372 9.13 10.493 8.979 10.672C8.847 10.832 8.694 10.992 8.865 11.282C9.036 11.571 9.625 12.532 10.489 13.303C11.603 14.298 12.51 14.611 12.83 14.743C13.151 14.875 13.34 14.856 13.568 14.613C13.797 14.368 14.441 13.621 14.713 13.313C14.985 13.003 15.241 13.041 15.526 13.144C15.811 13.248 17.324 13.996 17.625 14.145C17.925 14.295 18.125 14.369 18.196 14.494C18.267 14.618 18.267 15.308 17.965 15.939L17.152 16.315Z" />
            </svg>
          </button>
        </div>
          </>
        ) : (
          <p className="border border-border bg-bg-alt px-4 py-3.5 text-center font-body text-xs uppercase tracking-[0.18em] text-text-muted">
            No disponible para compra
          </p>
        )}
      </div>

      {/* Pago — medios aceptados */}
      <div className="border-t border-border pt-4">
        <span className="eyebrow">Pago</span>
        <PaymentMethodIcons className="mt-2.5" />
      </div>

      {pendingAction !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPendingAction(null)}>
          <div className="flex w-full max-w-md flex-col gap-4 border border-border bg-surface p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3">
              <span className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full bg-accent" />
              <div>
                <h3 className="font-display text-xl text-text">Producto bajo pedido</h3>
                <p className="mt-1 font-body text-sm leading-relaxed text-text-soft">
                  Este producto se importa bajo pedido. Tras confirmar el pago, la entrega estimada es de <span className="text-text">13–17 días</span>. ¿Deseas continuar?
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setPendingAction(null)} className="border border-border px-5 py-2.5 font-body text-xs uppercase tracking-[0.16em] text-text-soft hover:border-text hover:text-text">
                Cancelar
              </button>
              <button onClick={confirmBajoPedido} className="bg-text px-5 py-2.5 font-body text-xs uppercase tracking-[0.16em] text-bg hover:bg-accent">
                Continuar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Tarjeta de formato (ml + tipo + precio) — estilo editorial Noir.
   Con descuento muestra el % en la esquina y el precio ya rebajado. */
function SizeCard({ ml, type, price, discount = 0, active, disabled, highlight, onClick }: {
  ml: number;
  type: string;
  price: number;
  discount?: number;
  active: boolean;
  disabled?: boolean;
  /** Marco dorado en loop: distingue el frasco completo del resto de formatos. */
  highlight?: boolean;
  onClick?: () => void;
}) {
  const hasDiscount = discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      /* Bloque centrado y compacto: tipografía más grande, sin huecos muertos */
      className={`relative flex aspect-square w-26 flex-col items-start justify-center gap-1.5 p-3 text-left transition-all ${
        highlight && !disabled ? 'gold-frame' : ''
      } ${
        disabled
          ? 'cursor-not-allowed border border-border opacity-40'
          : active
            ? 'bg-text text-bg'
            : 'border border-border text-text hover:border-text'
      }`}
    >
      {hasDiscount && (
        <span className="absolute right-0 top-0 bg-accent px-1.5 py-px font-body text-[9px] font-medium tracking-wide text-bg">
          -{discount}%
        </span>
      )}

      {/* El tipo va arriba: primero qué es, después cuánto trae */}
      <span className={`font-body text-[9px] uppercase leading-none tracking-[0.14em] ${active ? 'text-bg/70' : 'text-text-muted'}`}>
        {type}
      </span>
      <span className="font-display text-2xl leading-none">
        {ml}<span className="ml-1 font-body text-[11px] opacity-70">ml</span>
      </span>
      <span className="flex flex-col gap-0.5">
        {hasDiscount && (
          <span className={`font-body text-[10px] leading-none line-through ${active ? 'text-bg/60' : 'text-text-muted'}`}>
            {formatCurrency(price)}
          </span>
        )}
        <span className="font-body text-[13px] leading-none">{formatCurrency(finalPrice)}</span>
      </span>
    </button>
  );
}
