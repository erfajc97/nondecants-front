import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { CardFormat } from '../hooks/useProductCardHook';

interface FormatTilesProps {
  formats: CardFormat[];
  selectedId?: string;
  onSelect: (id: string) => void;
  applyDiscount: (n: number) => number;
  /** Altura de los tiles: card (44/46) o destacado (54). */
  size?: 'card' | 'feature';
}

/**
 * Grilla de tamaños del prototipo (.sizes): ml + precio, el seleccionado en
 * negro con precio dorado y franja de existencias; el frasco bajo pedido va en
 * ámbar con borde punteado ("Pedido"); el decant agotado, tachado y bloqueado.
 */
export default function FormatTiles({
  formats,
  selectedId,
  onSelect,
  applyDiscount,
  size = 'card',
}: FormatTilesProps) {
  if (formats.length === 0) return null;
  const h = size === 'feature' ? 'h-[54px]' : 'h-11 sm:h-[46px]';
  return (
    <div
      role="group"
      aria-label="Tamaño"
      className="grid gap-1"
      style={{
        gridTemplateColumns:
          size === 'feature' && formats.length > 3
            ? 'repeat(auto-fill, minmax(88px, 1fr))'
            : `repeat(${formats.length}, minmax(0, 1fr))`,
      }}
    >
      {formats.map((f) => {
        const isSelected = selectedId === f.id;
        const label = f.isFullBottle ? 'Frasco' : `${f.ml} ml`;
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelect(f.id)}
            disabled={f.soldOut}
            aria-pressed={isSelected}
            aria-label={`${label}${f.soldOut ? ', agotado' : f.backorder ? ', bajo pedido' : ''}`}
            style={{ ['--lv' as string]: f.level }}
            className={`size-tile flex ${h} flex-col items-center justify-center rounded-[3px] border font-body leading-[1.15] transition-[border-color,background-color] duration-200 ${
              isSelected
                ? 'border-text bg-text text-white'
                : f.soldOut
                  ? 'border-border text-text-muted/70 line-through'
                  : `border-border text-text hover:border-text-muted/50 ${f.backorder ? 'border-dashed' : ''}`
            }`}
          >
            <b className={`${size === 'feature' ? 'text-[15px]' : 'text-[11px] sm:text-xs'} font-bold`}>{label}</b>
            <small
              className={`${size === 'feature' ? 'text-[13px]' : 'text-[10.5px] sm:text-[11.5px]'} ${
                f.backorder ? 'text-warning' : isSelected ? 'text-accent' : 'text-text-muted'
              }`}
            >
              {f.backorder ? 'Pedido' : formatCurrency(applyDiscount(f.price))}
            </small>
          </button>
        );
      })}
    </div>
  );
}

/** Texto del CTA: "Agregar · $6,90" o "Pedir frasco · $184,99". */
export function ctaLabel(isBackorder: boolean, price: number) {
  return `${isBackorder ? 'Pedir frasco' : 'Agregar'} · ${formatCurrency(price)}`;
}
