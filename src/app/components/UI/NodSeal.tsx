import { useId } from 'react';

interface NodSealProps {
  className?: string;
  /** Tamaño en px (por defecto 118, como el prototipo). */
  size?: number;
}

/**
 * Sello circular NöD (prototipo de marca): disco negro, aro dorado fino y el
 * texto "ORIGINAL O NADA ✦ NONDECANTS ✦ ECUADOR ✦" girando alrededor del
 * monograma. La rotación (.seal) se detiene con prefers-reduced-motion.
 */
export default function NodSeal({ className = '', size }: NodSealProps) {
  const pathId = `seal-${useId().replace(/:/g, '')}`;
  return (
    <div
      className={`seal ${className}`}
      style={size ? { width: size, height: size } : undefined}
      role="img"
      aria-label="Sello NonDecants: original o nada"
    >
      <svg viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <path id={pathId} d="M60,60 m-47,0 a47,47 0 1,1 94,0 a47,47 0 1,1 -94,0" />
        </defs>
        <circle cx="60" cy="60" r="58" className="fill-text" />
        <circle cx="60" cy="60" r="38" fill="none" strokeWidth=".8" className="stroke-accent" />
        <text
          fontSize="10.5"
          fontWeight="700"
          className="fill-accent font-body"
        >
          <textPath href={`#${pathId}`} textLength="290" lengthAdjust="spacing">ORIGINAL O NADA ✦ NONDECANTS ✦ ECUADOR ✦</textPath>
        </text>
      </svg>
      <img src="/favicon.png" alt="" />
    </div>
  );
}
