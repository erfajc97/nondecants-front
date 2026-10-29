import type { ReactNode } from 'react';

interface SectionHeadProps {
  /** Texto del eyebrow "✦ …" (opcional). */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Controles a la derecha (flechas, enlace "Ver todo"). */
  right?: ReactNode;
  /** h1/h2/h3 — por defecto h2. */
  as?: 'h1' | 'h2' | 'h3';
  className?: string;
}

/**
 * Cabecera de sección del prototipo (.sh): eyebrow ✦ dorado, título Gloock
 * grande con tracking cerrado y controles alineados a la derecha.
 */
export default function SectionHead({
  eyebrow,
  title,
  subtitle,
  right,
  as: Tag = 'h2',
  className = '',
}: SectionHeadProps) {
  return (
    <div className={`mb-6 flex items-end justify-between gap-4 ${className}`}>
      <div className="min-w-0">
        {eyebrow && <span className="eyebrow k">{eyebrow}</span>}
        <Tag className="mt-1.5 font-display text-[clamp(28px,3.2vw,46px)] font-normal leading-none tracking-[-0.02em] text-text text-balance">
          {title}
        </Tag>
        {subtitle && (
          <p className="mt-2 max-w-[52ch] font-body text-[15px] text-text-muted">{subtitle}</p>
        )}
      </div>
      {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
    </div>
  );
}

/** Flecha circular de 40px del prototipo (.arr). */
export function RoundArrow({
  direction,
  onClick,
  disabled,
  label,
}: {
  direction: 'prev' | 'next';
  onClick: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label ?? (direction === 'prev' ? 'Anterior' : 'Siguiente')}
      className="hidden h-10 w-10 place-items-center rounded-full border border-border text-text transition-[border-color,opacity] hover:border-text disabled:cursor-default disabled:opacity-30 disabled:hover:border-border md:grid"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d={direction === 'prev' ? 'm15 6-6 6 6 6' : 'm9 6 6 6-6 6'} />
      </svg>
    </button>
  );
}

/** Enlace "Ver todo" — píldora del prototipo (.pill). */
export function PillLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-full border border-text px-[18px] font-body text-[13px] font-semibold text-text transition-colors hover:bg-text hover:text-bg"
    >
      {children}
    </a>
  );
}
