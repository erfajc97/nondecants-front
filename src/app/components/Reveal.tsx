import { useEffect, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from 'react';

/**
 * M4 · Aparición al hacer scroll (prototipo). Utilidades reutilizables:
 *
 *  - <Reveal>            sección: opacidad 0→1 y sube 26 px en 0,8 s, una vez.
 *                        rootMargin '0px 0px -8%'.
 *  - <RevealGroup>       contenedor que, al entrar, dispara a sus hijos:
 *      · .rv-card  + revealStyle(i)       tarjetas de carrusel: entran desde la
 *                                         derecha (28 px, 0,6 s), 70 ms entre
 *                                         tarjetas, máximo 8.
 *      · .rv-cell  + revealStyle(i, 12, 45)  grid del catálogo: 45 ms, máx. 12.
 *  - useReveal()         hook base (ref + shown).
 *
 * Las clases viven en global.css. Con prefers-reduced-motion todo se muestra directo.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(rootMargin = '0px 0px -8% 0px') {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [rootMargin]);

  return [ref, shown] as const;
}

/** Retardo escalonado: `--i` (índice acotado) y `--rv-step` (ms). Úsalo en el style del hijo. */
export function revealStyle(index: number, max = 8, stepMs = 70): CSSProperties {
  return {
    ['--i' as string]: Math.min(Math.max(index, 0), max),
    ['--rv-step' as string]: `${stepMs}ms`,
  };
}

interface RevealProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** 'section' (por defecto) sube 26 px; 'group' no anima el contenedor, solo dispara hijos. */
  mode?: 'section' | 'group';
}

export default function Reveal({ children, className = '', as: Tag = 'div', mode = 'section' }: RevealProps) {
  const [ref, shown] = useReveal();
  const base = mode === 'group' ? 'rv-group' : 'rv';
  return (
    <Tag ref={ref} className={`${base} ${shown ? 'in' : ''} ${className}`}>
      {children}
    </Tag>
  );
}

/** Contenedor que solo dispara la entrada de sus .rv-card / .rv-cell. */
export function RevealGroup(props: Omit<RevealProps, 'mode'>) {
  return <Reveal {...props} mode="group" />;
}
