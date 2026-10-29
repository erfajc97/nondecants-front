import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Aparición al hacer scroll (prototipo .rv → .rv.in): el bloque sube 18 px y
 * se desvanece una sola vez al entrar en pantalla. Sin IntersectionObserver
 * (o con prefers-reduced-motion) se muestra directo.
 */
export default function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
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
      { rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`rv ${shown ? 'in' : ''} ${className}`}>
      {children}
    </div>
  );
}
