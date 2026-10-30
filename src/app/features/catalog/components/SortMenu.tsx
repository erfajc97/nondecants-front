import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { SORT_OPTIONS } from '../data';
import type { SortKey } from '../types';

interface SortMenuProps {
  value: SortKey;
  onChange: (v: SortKey) => void;
}

function GoldCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="text-accent" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

/** Escritorio: menú de 220 px bajo el botón. Móvil: hoja desde abajo con opciones de 54 px. */
export default function SortMenu({ value, onChange }: SortMenuProps) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onDown = (e: MouseEvent) => {
      if (window.matchMedia('(min-width: 768px)').matches && !wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    const prev = document.body.style.overflow;
    const mobile = !window.matchMedia('(min-width: 768px)').matches;
    if (mobile) {
      document.body.style.overflow = 'hidden';
      document.documentElement.setAttribute('data-sheet-open', '');
    }
    return () => {
      document.documentElement.removeAttribute('data-sheet-open');
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const pick = (v: SortKey) => {
    onChange(v);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-white px-4 font-body text-sm font-semibold text-text transition-colors hover:border-text"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3" />
        </svg>
        {SORT_OPTIONS.find((o) => o.value === value)?.label ?? 'Ordenar'}
      </button>

      {open && (
        <>
          {/* Escritorio */}
          <ul
            role="listbox"
            aria-label="Ordenar perfumes"
            className="absolute right-0 top-full z-40 mt-2 hidden w-[220px] rounded-md border border-border bg-white p-1.5 shadow-[0_18px_40px_-20px_rgba(27,25,25,0.35)] md:block"
          >
            {SORT_OPTIONS.map((o) => (
              <li key={o.value} role="option" aria-selected={o.value === value}>
                <button
                  type="button"
                  onClick={() => pick(o.value)}
                  className={`flex h-10 w-full items-center justify-between rounded-sm px-3 text-left font-body text-sm transition-colors hover:bg-bg-alt ${o.value === value ? 'font-semibold' : ''}`}
                >
                  {o.label}
                  {o.value === value && <GoldCheck />}
                </button>
              </li>
            ))}
          </ul>

          {/* Móvil */}
          {mounted && createPortal(
          <div className="fixed inset-0 z-[90] md:hidden" role="dialog" aria-modal="true" aria-label="Ordenar por">
            <div className="absolute inset-0 bg-text/45" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute inset-x-0 bottom-0 rounded-t-[18px] bg-white pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
              <div className="relative border-b border-border px-5 pb-3 pt-[18px]">
                <span className="absolute left-1/2 top-[7px] -ml-5 h-1 w-10 rounded-sm bg-border" aria-hidden />
                <b className="font-display text-[26px] font-normal">Ordenar por</b>
              </div>
              <ul>
                {SORT_OPTIONS.map((o) => (
                  <li key={o.value}>
                    <button
                      type="button"
                      onClick={() => pick(o.value)}
                      aria-pressed={o.value === value}
                      className={`flex h-[54px] w-full items-center justify-between border-b border-border-soft px-5 text-left font-body text-base ${o.value === value ? 'font-semibold' : ''}`}
                    >
                      {o.label}
                      {o.value === value && <GoldCheck />}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>,
          document.body,
          )}
        </>
      )}
    </div>
  );
}
