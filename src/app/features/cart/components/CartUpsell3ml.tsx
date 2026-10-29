import { formatCurrency } from '@/app/helpers/formatCurrency';
import { useCartStore } from '@/app/store/cart/cartStore';
import { flyToCart } from '@/app/helpers/flyToCart';
import { sonnerResponse } from '@/app/helpers/sonnerResponse';
import type { Product } from '@/app/types/global.types';

const MAX_PRICE = 5;

interface Offer {
  product: Product;
  variantId: string;
  price: number;
  image: string;
  maxQty: number;
  availableMl: number;
}

/** Decant de 3 ml del producto (si existe, tiene ml suficientes y cuesta menos de $5). */
function offerFor(product: Product): Offer | null {
  if (product.isPurchasable === false) return null;
  const formats = product.formats?.length
    ? product.formats
    : (product.variants ?? []).map((v) => ({
        id: v.id,
        ml: v.ml,
        price: v.price,
        isFullBottle: v.isFullBottle,
        imageUrl: v.images?.[0],
      }));
  const f = formats.find((x) => !x.isFullBottle && x.ml === 3);
  if (!f) return null;
  const discount = product.discount ?? 0;
  const price = discount > 0 ? f.price * (1 - discount / 100) : f.price;
  if (price <= 0 || price >= MAX_PRICE) return null;

  const availableMl =
    Number(product.openBottleMlRemaining ?? 0) + Number(product.stock ?? 0) * Number(product.totalMl ?? 0);
  const maxQty = Math.floor(availableMl / 3);
  if (maxQty < 1) return null;

  const imgs = (product.images ?? []).map((i: any) => (typeof i === 'string' ? i : i?.url)).filter(Boolean);
  const image = imgs[0] || product.image || product.imageUrl || '';
  return { product, variantId: f.id, price, image, maxQty, availableMl };
}

/**
 * "Suma un 3 ml por menos de $5": dos tarjetas lado a lado (foto, nombre,
 * "3 ml · $X") que agregan el decant al carrito con un toque.
 */
export default function CartUpsell3ml({ candidates }: { candidates: Product[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) => s.items);

  const offers: Offer[] = [];
  for (const p of candidates) {
    if (inCart.some((i) => i.variantId === offerFor(p)?.variantId)) continue;
    const o = offerFor(p);
    if (o) offers.push(o);
    if (offers.length === 2) break;
  }
  if (offers.length === 0) return null;

  const add = (o: Offer, el: Element) => {
    addItem({
      productId: o.product.id,
      variantId: o.variantId,
      name: o.product.name,
      image: o.image,
      ml: 3,
      price: o.price,
      quantity: 1,
      bajoPedido: false,
      maxQty: o.maxQty,
      availableMl: o.availableMl,
    });
    flyToCart(el, o.image);
    sonnerResponse(`${o.product.name} · 3 ml añadido al carrito.`, 'success');
  };

  return (
    <div className="py-4">
      <h3 className="mb-2.5 font-body text-[13px] font-semibold text-text-muted">Suma un 3 ml por menos de $5</h3>
      <div className="grid grid-cols-2 gap-2.5">
        {offers.map((o) => (
          <button
            key={o.variantId}
            type="button"
            onClick={(e) => add(o, e.currentTarget)}
            aria-label={`Agregar ${o.product.name} 3 ml por ${formatCurrency(o.price)}`}
            className="grid min-w-0 grid-rows-[auto_1fr] gap-2 rounded-[3px] border border-border p-2.5 text-left transition-[border-color,transform] duration-200 hover:border-text active:scale-[0.97]"
          >
            <span className="grid aspect-[4/3] place-items-center overflow-hidden rounded-[3px] bg-bg-alt">
              {o.image ? <img src={o.image} alt="" loading="lazy" className="h-full w-full object-contain p-2" /> : null}
            </span>
            <span className="min-w-0 font-body text-[12.5px] leading-[1.3]">
              <b className="line-clamp-2 block font-semibold text-text">{o.product.name}</b>
              <span className="text-text-muted">3 ml · {formatCurrency(o.price)}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
