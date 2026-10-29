import type { ReactNode } from 'react';

interface CheckoutStepCardProps {
  n: 1 | 2 | 3;
  title: string;
  /** Paso abierto (el que se está llenando). */
  open: boolean;
  /** Paso completado: círculo verde con check. */
  done: boolean;
  /** Resumen que se ve al cerrar un paso completado. */
  summary?: string;
  /** Reabre el paso (solo si está completo). */
  onEdit?: () => void;
  children: ReactNode;
}

/**
 * Bloque acordeón numerado del checkout (prototipo): círculo negro de 40 px,
 * verde con check al completarse. Sin stepper.
 */
export default function CheckoutStepCard({ n, title, open, done, summary, onEdit, children }: CheckoutStepCardProps) {
  const canEdit = done && !open && !!onEdit;
  return (
    <section
      aria-labelledby={`ck-step-${n}`}
      className={`rounded-md border bg-surface transition-colors duration-300 ${open ? 'border-text' : 'border-border'}`}
    >
      <div
        className={`flex items-center gap-3.5 p-4 md:px-6 md:py-5 ${canEdit ? 'cursor-pointer' : ''}`}
        onClick={canEdit ? onEdit : undefined}
      >
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full font-body text-[17px] font-bold text-bg transition-colors duration-300 ${
            done ? 'bg-success' : open ? 'bg-text' : 'bg-text/35'
          }`}
          aria-hidden="true"
        >
          {done ? (
            <svg
              className="ck-check-pop"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            n
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`ck-step-${n}`} className="font-display text-[22px] font-normal leading-tight text-text md:text-[26px]">
            {title}
          </h2>
          {!open && done && summary && (
            <p className="mt-0.5 truncate font-body text-[14.5px] text-text-muted">{summary}</p>
          )}
        </div>
        {canEdit && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
            className="shrink-0 font-body text-[14px] font-semibold text-text underline underline-offset-4 hover:text-accent-hover"
          >
            Editar
          </button>
        )}
      </div>
      {open && <div className="ck-step-in px-4 pb-5 md:px-6 md:pb-6">{children}</div>}
    </section>
  );
}
