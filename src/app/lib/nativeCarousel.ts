import { useCallback, useEffect, useRef, useState, type RefCallback } from 'react';

/**
 * Carrusel con scroll nativo (M1). Sustituye a Embla manteniendo su API de
 * uso: `const [ref, api] = useEmblaCarousel(opts)`, `<div ref={ref}><div>slides…`.
 * El alias 'embla-carousel-react' → este módulo vive en astro.config.mjs.
 * El layout (grid, snap, columnas 5/4/2) está en global.css (.nd-carousel).
 */
type Listener = () => void;

export interface NativeCarouselApi {
  canScrollPrev(): boolean;
  canScrollNext(): boolean;
  scrollPrev(): void;
  scrollNext(): void;
  scrollTo(index: number): void;
  scrollProgress(): number;
  scrollSnapList(): number[];
  selectedScrollSnap(): number;
  on(evt: string, cb: Listener): NativeCarouselApi;
  off(evt: string, cb: Listener): NativeCarouselApi;
  rootNode(): HTMLElement;
}
export type EmblaCarouselType = NativeCarouselApi;

function createApi(root: HTMLElement): NativeCarouselApi & { destroy(): void } {
  const listeners: Record<string, Set<Listener>> = {};
  const emit = (evt: string) => listeners[evt]?.forEach((cb) => cb());
  const max = () => Math.max(0, root.scrollWidth - root.clientWidth);
  const pages = () => Math.max(1, Math.ceil(root.scrollWidth / Math.max(1, root.clientWidth) - 0.02));
  const step = () => root.clientWidth * 0.8;
  let last = '';
  const onScroll = () => {
    emit('scroll');
    const m = max();
    const key = `${root.scrollLeft <= 1}|${root.scrollLeft >= m - 1}|${Math.round((root.scrollLeft / (m || 1)) * (pages() - 1))}`;
    if (key !== last) {
      last = key;
      emit('select');
    }
  };
  root.addEventListener('scroll', onScroll, { passive: true });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => emit('reInit')) : null;
  ro?.observe(root);
  if (root.firstElementChild) ro?.observe(root.firstElementChild);
  const mo = typeof MutationObserver !== 'undefined' ? new MutationObserver(() => emit('reInit')) : null;
  if (root.firstElementChild) mo?.observe(root.firstElementChild, { childList: true });

  const api: NativeCarouselApi & { destroy(): void } = {
    canScrollPrev: () => root.scrollLeft > 1,
    canScrollNext: () => root.scrollLeft < max() - 1,
    scrollPrev: () => root.scrollBy({ left: -step(), behavior: 'smooth' }),
    scrollNext: () => root.scrollBy({ left: step(), behavior: 'smooth' }),
    scrollTo: (i) => {
      const n = pages();
      root.scrollTo({ left: n <= 1 ? 0 : (Math.min(n - 1, Math.max(0, i)) / (n - 1)) * max(), behavior: 'smooth' });
    },
    scrollProgress: () => (max() === 0 ? 0 : root.scrollLeft / max()),
    scrollSnapList: () => Array.from({ length: pages() }, (_, i) => i / Math.max(1, pages() - 1)),
    selectedScrollSnap: () => Math.round(api.scrollProgress() * (pages() - 1)),
    on: (evt, cb) => ((listeners[evt] ??= new Set()).add(cb), api),
    off: (evt, cb) => (listeners[evt]?.delete(cb), api),
    rootNode: () => root,
    destroy: () => {
      root.removeEventListener('scroll', onScroll);
      ro?.disconnect();
      mo?.disconnect();
    },
  };
  return api;
}

/** Opciones de Embla aceptadas e ignoradas (el layout es CSS). */
export type NativeCarouselOptions = Record<string, unknown>;

export default function useNativeCarousel(
  _options?: NativeCarouselOptions,
  _plugins?: unknown[],
): [RefCallback<HTMLElement>, NativeCarouselApi | undefined] {
  const [api, setApi] = useState<NativeCarouselApi | undefined>();
  const destroyRef = useRef<(() => void) | null>(null);

  const ref = useCallback<RefCallback<HTMLElement>>((node) => {
    destroyRef.current?.();
    destroyRef.current = null;
    if (!node) {
      setApi(undefined);
      return;
    }
    node.classList.add('nd-carousel');
    const track = node.firstElementChild as HTMLElement | null;
    track?.classList.add('nd-carousel__track');
    // Combos y reseñas usan slides del 80% en móvil.
    const first = track?.firstElementChild as HTMLElement | null;
    if (first && /\b(basis-\[80%\]|flex-\[0_0_80%\])/.test(first.className)) {
      node.setAttribute('data-carousel', 'wide');
    }
    const created = createApi(node);
    destroyRef.current = created.destroy;
    setApi(created);
  }, []);

  useEffect(() => () => destroyRef.current?.(), []);
  return [ref, api];
}
export { useNativeCarousel as useEmblaCarousel };
