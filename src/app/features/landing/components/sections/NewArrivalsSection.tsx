import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import ProductCard from '@/app/features/product/components/ProductCard';
import type { Product } from '@/app/types/global.types';

interface NewArrivalsSectionProps {
  products: Product[];
  isLoading: boolean;
}

export default function NewArrivalsSection({ products, isLoading }: NewArrivalsSectionProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, align: 'start' });

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-14 px-4" style={{ background: 'var(--color-surface)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[--color-text-muted] text-xs uppercase tracking-[0.2em] mb-1">Recientes</p>
            <h2 className="font-heading text-3xl md:text-4xl text-[--color-text] uppercase tracking-wide">
              Últimos <span className="text-[--color-accent]">Ingresos</span>
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollPrev}
              aria-label="Anterior"
              className="w-9 h-9 flex items-center justify-center border border-[--color-border] text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              onClick={scrollNext}
              aria-label="Siguiente"
              className="w-9 h-9 flex items-center justify-center border border-[--color-border] text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-colors"
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
            <a
              href="/catalogo"
              className="hidden sm:flex items-center gap-2 ml-2 text-xs font-heading uppercase tracking-wider text-[--color-accent] hover:underline underline-offset-4"
            >
              Ver catálogo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-[--color-surface-raised] animate-pulse" style={{ borderRadius: 'var(--radius-md)' }} />
            ))}
          </div>
        ) : (
          /* Carousel */
          <div className="overflow-hidden -mx-2" ref={emblaRef}>
            <div className="flex">
              {products.map(p => (
                <div key={p.id} className="px-2 shrink-0 basis-1/2 sm:basis-1/4">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
