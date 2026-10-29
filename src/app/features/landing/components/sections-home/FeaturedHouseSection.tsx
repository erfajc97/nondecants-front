import { useEffect, useState } from 'react';
import NodSeal from '@/app/components/UI/NodSeal';
import FormatTiles, { ctaLabel } from '@/app/features/product/components/FormatTiles';
import { useProductCardHook } from '@/app/features/product/hooks/useProductCardHook';
import { useLandingSectionsActiveQuery } from '@/app/tanstack-queries/landingSectionsQuery';
import SectionHead, { PillLink } from '../shared/SectionHead';
import Reveal from '../shared/Reveal';
import type { Product } from '@/app/types/global.types';

/** Fin de la oferta: el domingo a las 23:59 de la semana en curso. */
function endOfWeek(now = new Date()) {
  const end = new Date(now);
  end.setDate(now.getDate() + ((7 - now.getDay()) % 7));
  end.setHours(23, 59, 59, 999);
  return end;
}

function formatCountdown(ms: number) {
  let s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  s %= 86400;
  const h = Math.floor(s / 3600);
  s %= 3600;
  const m = Math.floor(s / 60);
  return `${d}d ${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

function Countdown() {
  const [label, setLabel] = useState('--');
  useEffect(() => {
    const tick = () => setLabel(formatCountdown(endOfWeek().getTime() - Date.now()));
    tick();
    const id = window.setInterval(tick, 30000);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="flex items-baseline gap-2.5 font-body text-[13.5px] tabular-nums text-text-muted">
      Termina en <b className="font-display text-2xl font-normal text-text">{label}</b>
    </div>
  );
}

function FeaturedCard({ product }: { product: Product }) {
  const c = useProductCardHook(product);
  const brand = product.marca?.name ?? '';
  const sealedStock = Number(product.stock ?? 0);
  const fewLeft = !product.bajoPedido && sealedStock > 0 && sealedStock <= 3;
  const tagline = product.signatureTitle?.trim();
  const description = (product.detailDescription || product.description || '').trim();
  const concentration = product.concentration
    ? String(product.concentration).replace(/_/g, ' ').toLowerCase()
    : '';
  const tiles = [
    ...c.formats.filter((f) => !f.isFullBottle).slice(0, 3),
    ...c.formats.filter((f) => f.isFullBottle),
  ];

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-[4px] border border-border min-[821px]:grid-cols-2">
      <div className="relative aspect-[4/5] max-h-[560px] w-full border-b border-border bg-bg-alt min-[821px]:aspect-auto min-[821px]:min-h-[480px] min-[821px]:border-b-0 min-[821px]:border-r">
        <a href={c.productUrl} aria-label={product.name} className="absolute inset-0">
          {c.displayImage && (
            <img
              src={c.displayImage}
              alt={`${brand} ${product.name}`.trim()}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-contain p-[7%]"
            />
          )}
        </a>
        <div className="pointer-events-none absolute left-2.5 top-2.5 z-[2] flex flex-col items-start gap-[5px] min-[821px]:left-3 min-[821px]:top-3">
          {c.isNew && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-text py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-white">
              <span className="text-[10px] text-accent" aria-hidden>✦</span>Nuevo
            </span>
          )}
          {fewLeft && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pl-2 pr-2.5 font-body text-[10.5px] font-semibold uppercase leading-none tracking-[0.08em] text-error shadow-[0_0_0_1px_var(--color-border),0_4px_12px_-6px_rgba(27,25,25,0.25)] before:h-1.5 before:w-1.5 before:rounded-full before:bg-current before:content-['']">
              Pocas unidades
            </span>
          )}
        </div>
        <NodSeal size={72} className="!absolute bottom-3 right-3 z-[2] min-[821px]:bottom-4 min-[821px]:right-4" />
      </div>

      <div className="flex flex-col justify-center gap-3 bg-gradient-to-b from-white to-gold-light p-[clamp(20px,3vw,40px)]">
        <span className="font-body text-[15px] text-text-muted">
          {brand}
          {concentration && ` · ${concentration.replace(/^./, (m) => m.toUpperCase())}`}
        </span>
        <h3 className="font-display text-[clamp(32px,3.2vw,48px)] font-normal leading-none tracking-[-0.02em]">
          <a href={c.productUrl}>{product.name}</a>
        </h3>
        {tagline && (
          <p className="font-display text-[clamp(18px,1.4vw,21px)] italic leading-[1.3] text-text-soft">{tagline}</p>
        )}
        {description && (
          <p className="line-clamp-2 max-w-[50ch] font-body text-[15px] text-text-muted">{description}</p>
        )}
        <Countdown />
        <div className="w-full">
          <FormatTiles
            size="feature"
            formats={tiles}
            selectedId={c.selected?.id}
            onSelect={c.setSelectedId}
            applyDiscount={c.applyDiscount}
          />
        </div>
        {c.canPurchase && (
          <button
            type="button"
            onClick={c.handleQuickAdd}
            className="inline-flex h-[52px] w-full items-center justify-center rounded-[3px] bg-text px-7 font-body text-[14.5px] font-semibold tracking-[0.01em] text-white transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.985]"
          >
            {ctaLabel(c.ctaIsBackorder, c.finalPrice)}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * "El destacado de la casa" (prototipo .feat): tarjeta partida con foto a la
 * izquierda y ficha a la derecha. El producto es el primero de la primera
 * sección activa del home (administrable desde el admin); el contador apunta
 * al domingo de la semana en curso.
 */
export default function FeaturedHouseSection() {
  const { data: sections } = useLandingSectionsActiveQuery();
  const product = (sections ?? [])
    .flatMap((s) => s.products)
    .find((p) => (p.images?.length ?? 0) > 0 || p.image || p.imageUrl);
  if (!product) return null;

  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead
            eyebrow="Solo esta semana"
            title="El destacado de la casa"
            right={<PillLink href="/catalogo/perfumes">Ver más →</PillLink>}
          />
          <FeaturedCard product={product} />
        </Reveal>
      </div>
    </section>
  );
}
