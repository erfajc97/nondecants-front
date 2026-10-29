import { useMemo, useState } from 'react';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { flyToCart } from '@/app/helpers/flyToCart';
import { useCartStore } from '@/app/store/cart/cartStore';
import '@/app/features/product/product-detail.css';
import type { Combo } from '@/app/types/global.types';
import { buildComboCartItem, comboDecantCount, comboSizes } from '../comboPricing';

interface ComboCardProps {
  combo: Combo;
}

/**
 * Tarjeta de combo (home, /catalogo/combos y "Otros combos"): foto con la píldora
 * "N decants", nombre, perfumes y selector del tamaño de cada decant (3 · 5 · 10 ml)
 * que actualiza precio, "por separado", ahorro y botón.
 */
export default function ComboCard({ combo }: ComboCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const sizes = useMemo(() => comboSizes(combo), [combo]);
  const [ml, setMl] = useState<number>(sizes[0]?.ml ?? 0);
  const size = sizes.find((s) => s.ml === ml) ?? sizes[0];

  const products = combo.comboProducts ?? [];
  const decants = comboDecantCount(combo);
  const comboImage = combo.imageUrl;
  const hasPicker = sizes.length > 1 || sizes[0]?.ml > 0;
  const href = `/combo/${combo.id}${size.ml > 0 ? `?size=${size.ml}` : ''}`;

  const handleAdd = (e: { currentTarget: Element }) => {
    const item = buildComboCartItem(combo, size);
    addItem(item);
    // El carrito lateral se abre solo; el cliente sigue en el catálogo.
    flyToCart(e.currentTarget, item.image);
  };

  return (
    <article className="group/card flex min-w-0 flex-col overflow-hidden rounded-sm border border-border bg-surface">
      {/* Imagen */}
      <a href={href} className="relative block aspect-square overflow-hidden bg-bg-alt" tabIndex={-1} aria-hidden="true">
        {comboImage ? (
          <img
            src={comboImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover/card:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.75">
              <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" />
            </svg>
          </div>
        )}
        {decants > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-text px-3 py-1.5 font-body text-xs font-bold leading-none tracking-[0.02em] text-bg">
            {decants} {decants === 1 ? 'decant' : 'decants'}
          </span>
        )}
        {(!size.inStock || size.hasBajoPedido) && (
          <span
            className={`absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-surface px-2.5 py-1.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] shadow-[0_0_0_1px_var(--color-border)] ${
              size.inStock ? 'text-warning' : 'text-text-muted'
            }`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {size.inStock ? 'Bajo pedido' : 'Agotado'}
          </span>
        )}
      </a>

      {/* Cuerpo */}
      <div className="flex flex-1 flex-col gap-2.5 p-3 md:p-4">
        <h3 className="font-display text-xl leading-[1.05] text-text md:text-[25px]">
          <a href={href} className="transition-colors hover:text-accent-hover">
            {combo.name}
          </a>
        </h3>

        {products.length > 0 && (
          <ul className="grid gap-[3px] font-body text-[13px] text-text-soft md:text-[13.5px]">
            {products.slice(0, 4).map((cp) => (
              <li key={cp.id} className="flex items-baseline">
                <span aria-hidden="true" className="mr-[7px] text-[10px] text-accent">✦</span>
                <span className="truncate">{cp.product?.name ?? 'Producto'}</span>
              </li>
            ))}
          </ul>
        )}

        {hasPicker && (
          <div className="mt-1">
            <span className="block font-body text-[12.5px] font-semibold text-text">Elige el tamaño de cada decant</span>
            <div role="group" aria-label="Tamaño de cada decant" className="mt-1.5 grid grid-cols-3 gap-1">
              {sizes.map((s) => {
                const active = s.ml === size.ml;
                return (
                  <button
                    key={s.ml}
                    type="button"
                    onClick={() => setMl(s.ml)}
                    aria-pressed={active}
                    className={`h-[42px] rounded-[3px] border font-body text-[13.5px] font-bold transition-[border-color,background-color,transform] duration-200 active:scale-[0.97] ${
                      active ? 'border-text bg-text text-white' : 'border-border text-text hover:border-text-muted/50'
                    }`}
                  >
                    {s.ml} ml
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-x-2.5 gap-y-1 pt-1.5 tabular-nums">
          <b key={size.ml} className="pdp-tick font-body text-lg font-bold text-text md:text-xl">
            {formatCurrency(size.price)}
          </b>
          {size.savings > 0 && (
            <>
              <s className="font-body text-[13px] text-text-muted">{formatCurrency(size.before)}</s>
              <em className="font-body text-xs font-bold not-italic text-success">
                Ahorras {formatCurrency(size.savings)}
              </em>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={size.inStock ? handleAdd : undefined}
          disabled={!size.inStock}
          className="pdp-btn flex h-11 w-full items-center justify-center rounded-[3px] bg-text px-3 font-body text-[13.5px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted md:h-[46px]"
        >
          {size.inStock ? (
            <span className="whitespace-nowrap">
              Agregar<span className="hidden md:inline"> combo</span> · {formatCurrency(size.price)}
            </span>
          ) : (
            'Combo agotado'
          )}
        </button>
        <a
          href={href}
          className="self-center font-body text-[13.5px] font-semibold text-accent-hover hover:underline hover:underline-offset-[3px]"
        >
          Ver qué trae →
        </a>
      </div>
    </article>
  );
}
