import { useCallback, useEffect, useRef, useState } from 'react';
import type { NativeCarouselApi as EmblaCarouselType } from '@/app/lib/nativeCarousel';

/** Tween de Embla: el default (25) se siente seco. Más alto = más suave. */
export const EMBLA_DURATION = 50;

/**
 * Estado de navegación de un carrusel Embla: flechas (con extremos) y posición
 * para la barra inferior. Se comparte entre todas las secciones de la landing.
 */
export function useCarouselNav(emblaApi: EmblaCarouselType | undefined) {
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [progress, setProgress] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const sync = useCallback(() => {
    if (!emblaApi) return;
    setCanPrev(emblaApi.canScrollPrev());
    setCanNext(emblaApi.canScrollNext());
    setProgress(Math.min(1, Math.max(0, emblaApi.scrollProgress())));
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const onReInit = () => {
      setSnapCount(emblaApi.scrollSnapList().length);
      sync();
    };
    onReInit();
    // No escuchar `scroll`: cada frame leía geometría y hacía setState,
    // y Lighthouse lo marcaba como redistribución forzada.
    emblaApi.on('select', sync);
    emblaApi.on('reInit', onReInit);
    return () => {
      emblaApi.off('select', sync);
      emblaApi.off('reInit', onReInit);
    };
  }, [emblaApi, sync]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  /** Salta al "grupo" correspondiente a una proporción 0–1 del recorrido. */
  const seekRatio = useCallback(
    (ratio: number) => {
      if (!emblaApi) return;
      const last = emblaApi.scrollSnapList().length - 1;
      if (last < 0) return;
      emblaApi.scrollTo(Math.round(Math.min(1, Math.max(0, ratio)) * last));
    },
    [emblaApi],
  );

  /** Salta a una página concreta del carrusel. */
  const scrollToIndex = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi],
  );

  return {
    canPrev,
    canNext,
    progress,
    snapCount,
    selectedIndex,
    scrollPrev,
    scrollNext,
    seekRatio,
    scrollToIndex,
  };
}

/**
 * Alto de la parte visual de la card (la imagen) dentro del carrusel, para
 * poder centrar las flechas con ella y no con el bloque completo (imagen +
 * nombre + precio + chips). Se recalcula al redimensionar.
 */
export function useMediaCenterTop(
  containerRef: React.RefObject<HTMLElement | null>,
  /** Cambia cuando el contenido se monta/renueva (p. ej. nº de items). */
  contentKey?: unknown,
) {
  const [top, setTop] = useState<number | null>(null);

  useEffect(() => {
    const root = containerRef.current;
    if (!root || typeof ResizeObserver === 'undefined') return;

    const media = root.querySelector('[data-card-media]');
    if (!media) return;

    const observer = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height;
      if (h) setTop(h / 2);
    });
    observer.observe(media);
    return () => observer.disconnect();
  }, [containerRef, contentKey]);

  return top;
}

interface ArrowProps {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
  /** Clases de posición (absolute left/right …). */
  className?: string;
  /** Posición vertical en px (centro de la imagen de la card). */
  top?: number | null;
}

/**
 * Flecha de carrusel — bloque sólido oscuro, siempre visible en desktop para
 * que se note que hay más productos.
 */
export function CarouselArrow({ direction, onClick, disabled, className = '', top }: ArrowProps) {
  const isPrev = direction === 'prev';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isPrev ? 'Anterior' : 'Siguiente'}
      style={top != null ? { top: `${top}px` } : undefined}
      className={`z-20 flex h-9 w-7 items-center justify-center bg-text text-bg shadow-[0_2px_10px_rgba(28,26,23,0.18)] transition-opacity hover:bg-accent disabled:pointer-events-none disabled:opacity-25 sm:h-12 sm:w-9 ${className}`}
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d={isPrev ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
      </svg>
    </button>
  );
}

interface ProgressProps {
  snapCount: number;
  selectedIndex: number;
  onSelect: (index: number) => void;
  className?: string;
}

/**
 * Paginación del carrusel: un segmento por página, el actual en negro. Se
 * eligió sobre la barra continua porque con pocas páginas el indicador ocupaba
 * media barra y no se leía dónde estabas ni hacia dónde iba el clic.
 */
export function CarouselProgressBar({
  snapCount,
  selectedIndex,
  onSelect,
  className = '',
}: ProgressProps) {
  if (snapCount <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-1.5 ${className}`}>
      {Array.from({ length: snapCount }, (_, i) => {
        const active = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            aria-label={`Ir a la página ${i + 1} de ${snapCount}`}
            aria-current={active}
            className="group flex h-5 w-10 items-center justify-center"
          >
            {/* Trazo de 3 px: a 2 px casi no se veía en móvil */}
            <span
              className={`block h-[3px] w-full rounded-full transition-colors ${
                active ? 'bg-text' : 'bg-border group-hover:bg-text-muted'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
