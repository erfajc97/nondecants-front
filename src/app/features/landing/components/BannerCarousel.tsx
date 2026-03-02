import { useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import type { Banner } from '@/app/types/global.types';

interface BannerCarouselProps {
  banners: Banner[];
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (banners.length === 0) return null;

  return (
    <div className="relative group">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {banners.map((banner) => (
            <div key={banner.id} className="relative min-w-full">
              <a href={banner.link ?? '#'} className="block">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-[420px] md:h-[540px] object-cover"
                />
                <div
                  className="absolute inset-0 flex items-end"
                  style={{ background: 'linear-gradient(to top, rgba(27,25,25,0.85) 0%, rgba(27,25,25,0.2) 50%, transparent 100%)' }}
                >
                  <div className="px-8 md:px-16 pb-12 md:pb-16">
                    <p className="text-[--color-accent] font-heading text-xs uppercase tracking-[0.3em] mb-3">
                      NönDecants
                    </p>
                    <h2 className="font-heading text-4xl md:text-6xl text-[--color-text] uppercase leading-none mb-3">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-[--color-text-muted] text-sm tracking-wider max-w-md">
                        {banner.subtitle}
                      </p>
                    )}
                    <div className="mt-6">
                      <span className="inline-block px-6 py-2.5 bg-[--color-accent] text-[--color-bg] font-heading text-xs uppercase tracking-widest hover:bg-[--color-accent-hover] transition-colors">
                        Ver Catálogo
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button
        onClick={scrollPrev}
        aria-label="Anterior"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-[--color-border] bg-[--color-bg]/70 text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <button
        onClick={scrollNext}
        aria-label="Siguiente"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-[--color-border] bg-[--color-bg]/70 text-[--color-text-muted] hover:border-[--color-accent] hover:text-[--color-accent] transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"
        style={{ borderRadius: 'var(--radius-sm)' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </button>
    </div>
  );
}
