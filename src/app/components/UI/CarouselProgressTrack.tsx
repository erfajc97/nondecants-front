import { useEffect, useRef, type MouseEvent } from 'react';
import type { NativeCarouselApi as EmblaCarouselType } from '@/app/lib/nativeCarousel';

interface CarouselProgressTrackProps {
  /** Progreso 0–1 del recorrido (scrollProgress de Embla). Fallback si no hay api. */
  progress: number;
  /** Nº de posiciones (snaps) del carrusel. */
  snapCount: number;
  /** Salta a la posición correspondiente a una proporción 0–1 del recorrido. */
  onSeek: (ratio: number) => void;
  /** Si viene, el tramo se mueve en rAF sin setState (evita reflow en cada scroll). */
  emblaApi?: EmblaCarouselType;
  className?: string;
}

function thumbTransform(progress: number, snapCount: number) {
  const offsetPct = Math.min(1, Math.max(0, progress)) * (snapCount - 1) * 100;
  return `translateX(${offsetPct}%) translateY(-50%)`;
}

/**
 * Barra de avance continua (REQ-026): un solo riel gris con el tramo activo
 * en negro que se desplaza según la posición del carrusel — no segmentos.
 * El ancho del tramo es 1/snapCount del riel y su desplazamiento sigue al
 * `scrollProgress` de Embla (se actualiza también durante el arrastre).
 * Clic sobre el riel para saltar a esa parte del recorrido.
 */
export default function CarouselProgressTrack({
  progress,
  snapCount,
  onSeek,
  emblaApi,
  className = '',
}: CarouselProgressTrackProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const snapCountRef = useRef(snapCount);
  snapCountRef.current = snapCount;

  useEffect(() => {
    if (!emblaApi) return;
    const apply = () => {
      const el = thumbRef.current;
      if (!el) return;
      el.style.transform = thumbTransform(emblaApi.scrollProgress(), snapCountRef.current);
    };
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        apply();
      });
    };
    apply();
    emblaApi.on('scroll', onScroll);
    emblaApi.on('reInit', apply);
    return () => {
      emblaApi.off('scroll', onScroll);
      emblaApi.off('reInit', apply);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [emblaApi]);

  if (snapCount <= 1) return null;

  const thumbPct = 100 / snapCount;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.width === 0) return;
    onSeek((e.clientX - rect.left) / rect.width);
  };

  return (
    <div
      role="slider"
      aria-label="Progreso del carrusel"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(Math.min(1, Math.max(0, progress)) * 100)}
      onClick={handleClick}
      /* Riel corto y centrado: a lo ancho de la sección parecía un separador,
         no un indicador de avance. */
      className={`relative mx-auto h-4 w-full max-w-[180px] cursor-pointer md:max-w-[220px] ${className}`}
    >
      {/* Riel gris (hit-area de 16px, trazo visible de 3px centrado) */}
      <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-border" />
      {/* Tramo activo negro */}
      <div
        ref={thumbRef}
        className="absolute left-0 top-1/2 h-[3px] rounded-full bg-text"
        style={{
          width: `${thumbPct}%`,
          transform: thumbTransform(progress, snapCount),
        }}
      />
    </div>
  );
}
