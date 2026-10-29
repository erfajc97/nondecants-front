import { useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { productUrl } from '@/app/helpers/productUrl';
import { CarouselProgressBar, useCarouselNav, EMBLA_DURATION } from '@/app/components/UI/CarouselNav';
import SectionHead, { PillLink } from '../shared/SectionHead';
import type { Product } from '@/app/types/global.types';

/** Productos por página en la lista lateral (desktop) y en la lista móvil. */
const PER_PAGE = 4;
const MOBILE_PER_PAGE = 5;

interface ProductRankingSectionProps {
  title: string;
  products: Product[];
  isLoading?: boolean;
  viewAllHref?: string;
  /** Posición de la sección (no se pinta). */
  num?: string;
  eyebrow?: string;
}

const CONCENTRATION_SHORT: Record<string, string> = {
  EAU_DE_PARFUM: 'EDP',
  EAU_DE_TOILETTE: 'EDT',
  EAU_DE_TOILETTE_INTENSE: 'EDT Intense',
  EAU_DE_COLOGNE: 'EDC',
  BODY_MIST: 'Body Mist',
  ELIXIR: 'Elixir',
  PARFUM: 'Parfum',
  EXTRAIT_DE_PARFUM: 'Extrait',
};
const GENDER_LABELS: Record<string, string> = { HOMBRE: 'Hombre', MUJER: 'Mujer', UNISEX: 'Unisex' };
const TIME_LABELS: Record<string, string> = { DIA: 'Día', NOCHE: 'Noche' };

function derive(p: Product) {
  const imgs = (p.images ?? []).map((i: any) => (typeof i === 'string' ? i : i.url)).filter(Boolean);
  const image = imgs[0] || p.image || p.imageUrl;

  // Precio del ranking: SIEMPRE el decant de entrada (el de menor ml, sin
  // frasco), mostrado como "Desde $X" (REQ-013). Se prefiere la lista compacta
  // `formats` del backend; si no está, se deriva de las variantes cargadas.
  const formats = (p.formats && p.formats.length
    ? p.formats
    : (p.variants ?? []).map((v) => ({ ml: v.ml, price: v.price, isFullBottle: v.isFullBottle }))
  ).filter((f) => f.price > 0);
  const entryDecant = formats
    .filter((f) => !f.isFullBottle)
    .slice()
    .sort((a, b) => a.ml - b.ml)[0];
  const cheapest = formats.slice().sort((a, b) => a.price - b.price)[0];
  const entryPrice = entryDecant?.price ?? cheapest?.price ?? p.minFormatPrice ?? p.price ?? 0;

  const tags = [
    p.gender && (GENDER_LABELS[p.gender] ?? p.gender),
    p.timeOfDay && (TIME_LABELS[p.timeOfDay] ?? p.timeOfDay),
    p.concentration && (CONCENTRATION_SHORT[p.concentration] ?? p.concentration),
  ].filter(Boolean);
  return { image, entryPrice, tags: tags.join(' · '), href: productUrl(p) };
}

const Arrow = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M13 6l6 6-6 6" />
  </svg>
);

export default function ProductRankingSection({
  title,
  products,
  isLoading = false,
  viewAllHref = '/catalogo',
  eyebrow = 'Ranking',
}: ProductRankingSectionProps) {
  // Página actual de la lista (hook antes de cualquier return condicional).
  const [page, setPage] = useState(0);

  // Móvil: carrusel real en vez de detectar el swipe a mano. El gesto casero
  // no dejaba volver atrás —el navegador se quedaba el arrastre hacia la
  // derecha— y el cambio de página era un corte seco, sin desplazamiento.
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    duration: EMBLA_DURATION,
  });
  const mobileNav = useCarouselNav(emblaApi);

  if (isLoading) {
    // Esqueleto del layout del ranking: destacado + lista de 4.
    return (
      <section className="bg-bg py-[clamp(44px,5.5vw,76px)]" aria-hidden="true">
        <div className="mx-auto max-w-[1480px] animate-pulse px-[max(16px,3.4vw)]">
          <div className="mb-6 h-8 w-52 rounded-sm bg-bg-alt md:mb-12 md:h-10 md:w-72" />
          <div className="hidden items-start gap-12 md:grid md:grid-cols-[0.75fr_1.25fr]">
            <div className="rounded-[4px] border border-border p-6 md:p-8">
              <div className="h-8 w-10 rounded-sm bg-bg-alt" />
              <div className="mx-auto mt-4 aspect-square w-full max-w-[280px] bg-bg-alt" />
              <div className="mt-6 h-6 w-3/5 rounded-sm bg-bg-alt" />
            </div>
            <div className="flex flex-col">
              {Array.from({ length: 4 }, (_, i) => (
                <div key={i} className="grid grid-cols-[40px_120px_1fr] items-center gap-6 border-b border-border py-6 first:border-t">
                  <div className="h-7 w-8 rounded-sm bg-bg-alt" />
                  <div className="h-32 w-full bg-bg-alt" />
                  <div className="h-4 w-2/3 rounded-sm bg-bg-alt" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:hidden">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="grid grid-cols-[28px_84px_1fr] items-center gap-4 border-b border-border py-3.5">
                <div className="h-6 w-6 rounded-sm bg-bg-alt" />
                <div className="h-24 w-full bg-bg-alt" />
                <div className="h-4 w-2/3 rounded-sm bg-bg-alt" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
  if (!products || products.length === 0) return null;

  // Cada página es un tramo completo del ranking: el primero de la página va
  // destacado y los siguientes en la lista. Antes el destacado se quedaba fijo
  // en el nº1 y al pasar de página seguía mostrando el mismo perfume.
  const PAGE_SIZE = PER_PAGE + 1;
  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const pageItems = products.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  const top = pageItems[0] ?? products[0];
  const t = derive(top);
  const topRank = String(safePage * PAGE_SIZE + 1).padStart(2, '0');

  const list = pageItems.slice(1);
  const rankAt = (i: number) => String(safePage * PAGE_SIZE + i + 2).padStart(2, '0');

  // Móvil: misma paginación, incluyendo el #1 en la primera página. Cada
  // página es una diapositiva del carrusel.
  const mobilePages = Math.max(1, Math.ceil(products.length / MOBILE_PER_PAGE));
  const mobileChunks = Array.from({ length: mobilePages }, (_, i) =>
    products.slice(i * MOBILE_PER_PAGE, i * MOBILE_PER_PAGE + MOBILE_PER_PAGE),
  );

  return (
    <section className="bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <SectionHead
          eyebrow={eyebrow}
          title={title}
          right={<span className="max-sm:hidden"><PillLink href={viewAllHref}>Ver el ranking completo</PillLink></span>}
        />

        {/* ── Desktop: #1 destacado (card compacta con marco, ref. ANX-10) + lista 02–05 ── */}
        <div className="hidden items-start gap-[clamp(24px,4vw,64px)] md:grid md:grid-cols-[0.75fr_1.25fr]">
          {/* Destacado de la página (01, 06, 11…) */}
          <a href={t.href} className="group block overflow-hidden rounded-[4px] border border-border bg-surface p-6 transition-[border-color,box-shadow] duration-300 hover:border-border-accent hover:shadow-[0_18px_40px_-28px_var(--color-text)] md:p-8">
            <span className="font-display text-3xl leading-none text-accent-hover md:text-4xl">{topRank}</span>
            <div className="mx-auto mt-4 aspect-square w-full max-w-[240px] overflow-hidden md:max-w-[280px]">
              {t.image && (
                <img src={t.image} alt={top.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.02]" />
              )}
            </div>
            <div className="mt-6">
              <div className="font-display text-2xl font-normal leading-[1.1] text-text">{top.name}</div>
              {t.tags && <span className="mt-2 block font-body text-[13px] text-text-muted">{t.tags}</span>}
              <div className="mt-3 font-body text-sm font-semibold text-text">Desde {formatCurrency(t.entryPrice)}</div>
            </div>
          </a>

          {/* Lista paginada (02–05, 06–09, …) */}
          <div className="flex flex-col">
            {list.map((p, i) => {
              const d = derive(p);
              return (
                <a key={p.id} href={d.href} className="group grid grid-cols-[40px_120px_1fr_auto] items-center gap-6 border-b border-border py-6 first:border-t">
                  <span className="font-display text-3xl leading-none text-accent-hover">{rankAt(i)}</span>
                  <div className="h-32 w-full overflow-hidden rounded-[4px] border border-border bg-surface p-2">
                    {d.image && <img src={d.image} alt={p.name} className="h-full w-full object-contain transition-transform duration-700 group-hover:scale-[1.03]" />}
                  </div>
                  <div>
                    <div className="font-display text-[22px] font-normal leading-[1.1] text-text">{p.name}</div>
                    {d.tags && <span className="mt-1.5 block font-body text-[13px] text-text-muted">{d.tags}</span>}
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="font-body text-[13px] font-semibold text-text">Desde {formatCurrency(d.entryPrice)}</span>
                    <span className="text-text-soft transition-transform duration-300 group-hover:translate-x-1 group-hover:text-text"><Arrow /></span>
                  </div>
                </a>
              );
            })}

            {/* Barrita de posición — arrastra para ver los siguientes */}
            <CarouselProgressBar
              snapCount={totalPages}
              selectedIndex={safePage}
              onSelect={setPage}
              className="mt-7"
            />
          </div>
        </div>

        {/* ── Móvil: lista paginada, se pasa deslizando ── */}
        <div className="md:hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {mobileChunks.map((chunk, pageIndex) => (
                <div key={pageIndex} className="min-w-0 flex-[0_0_100%]">
                  {chunk.map((p, i) => {
                    const d = derive(p);
                    const rank = String(pageIndex * MOBILE_PER_PAGE + i + 1).padStart(2, '0');
                    return (
                      <a
                        key={p.id}
                        href={d.href}
                        // Sin esto el arrastre horizontal empieza a "llevarse"
                        // la imagen y el carrusel pierde el gesto.
                        draggable={false}
                        className="grid grid-cols-[28px_84px_1fr] items-center gap-4 border-b border-border py-3.5"
                      >
                        <span className="font-display text-2xl leading-none text-accent-hover">{rank}</span>
                        <div className="h-24 w-full overflow-hidden rounded-[4px] border border-border bg-surface">
                          {d.image && <img src={d.image} alt={p.name} draggable={false} className="h-full w-full object-cover" />}
                        </div>
                        <div>
                          {d.tags && <span className="font-body text-xs text-text-muted">{d.tags}</span>}
                          <div className="mt-1 font-display text-lg font-normal leading-tight text-text">{p.name}</div>
                          <div className="mt-1 font-body text-xs font-semibold text-text-soft">Desde {formatCurrency(d.entryPrice)}</div>
                        </div>
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          <CarouselProgressBar
            snapCount={mobileNav.snapCount || mobilePages}
            selectedIndex={mobileNav.selectedIndex}
            onSelect={mobileNav.scrollToIndex}
            className="mt-6"
          />
        </div>
      </div>
    </section>
  );
}
