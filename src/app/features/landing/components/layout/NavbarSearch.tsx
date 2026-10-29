import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import { productUrl } from '@/app/helpers/productUrl';
import type { Product } from '@/app/types/global.types';
import type { Reason } from '@/app/lib/searchIndex';
import { minPriceOf, useNavbarSearchHook } from '../../hooks/useNavbarSearchHook';
import { useDialogBehavior } from './useDialogBehavior';
import { IconSearch, IconClose, IconPlane } from './NavIcons';

const WHATSAPP_URL = 'https://wa.me/593992305463';
const EXAMPLES = ['vainilla', 'Valentino', 'algo fresco', 'para la noche', 'Yara', 'oud'];

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Resalta (sin innerHTML) la primera coincidencia de cada palabra buscada. */
function Highlight({ text, q }: { text: string; q: string }): ReactNode {
  const toks = norm(q).split(/\s+/).filter((t) => t.length > 1);
  if (!toks.length) return text;
  const n = norm(text);
  for (const t of toks) {
    const i = n.indexOf(t);
    if (i > -1) {
      return (
        <>
          {text.slice(0, i)}
          <mark>{text.slice(i, i + t.length)}</mark>
          {text.slice(i + t.length)}
        </>
      );
    }
  }
  return text;
}

/** Placeholder que "escribe" ejemplos; estático con prefers-reduced-motion. */
function useTypingPlaceholder(active: boolean) {
  const [txt, setTxt] = useState('');
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }, []);
  useEffect(() => {
    if (!active || reduced) return;
    let i = 0;
    let j = 0;
    let del = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const w = EXAMPLES[i];
      setTxt(w.slice(0, j));
      if (!del) {
        j++;
        if (j > w.length) {
          del = true;
          t = setTimeout(tick, 1400);
          return;
        }
      } else {
        j--;
        if (j < 0) {
          del = false;
          j = 0;
          i = (i + 1) % EXAMPLES.length;
        }
      }
      t = setTimeout(tick, del ? 35 : 85);
    };
    tick();
    return () => clearTimeout(t);
  }, [active, reduced]);
  return { txt, reduced };
}

function ResultRow({ p, q, i, onNavigate, reason }: { p: Product; q: string; i: number; onNavigate: () => void; reason?: Reason }) {
  return (
    <a
      href={productUrl(p)}
      data-sk
      onClick={onNavigate}
      style={{ ['--i' as string]: i }}
      className="nd-rise nd-hl group -mx-2 grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3.5 rounded-lg p-2 text-left transition-colors hover:bg-bg-alt focus-visible:bg-bg-alt focus-visible:outline-none data-[kb=true]:bg-bg-alt"
    >
      <span className="grid h-14 w-14 place-items-center overflow-hidden rounded-md border border-border bg-bg">
        {p.image ? (
          <img
            src={p.image}
            alt=""
            loading="lazy"
            className="h-[86%] w-[86%] object-contain transition-transform duration-[400ms] group-hover:rotate-[-4deg] group-hover:scale-110 motion-reduce:transition-none"
          />
        ) : null}
      </span>
      <span className="grid min-w-0 gap-px">
        <small className="truncate font-body text-[12.5px] text-text-muted">
          {p.marca?.name ? <Highlight text={p.marca.name} q={q} /> : 'NonDecants'}
        </small>
        <b className="truncate font-display text-[19px] font-normal leading-[1.15] text-text">
          <Highlight text={p.name} q={q} />
        </b>
        {reason && reason.kind !== 'name' && (
          <span className="flex items-center gap-1.5 font-body text-[12.5px] font-semibold text-accent-hover">
            {reason.color ? (
              <i className="inline-block h-2 w-2 rounded-full border border-border" style={{ background: reason.color }} aria-hidden="true" />
            ) : null}
            {reason.label}
          </span>
        )}
        {p.bajoPedido && (
          <span className="font-body text-[12.5px] font-semibold text-warning">Por encargo · 13–17 días</span>
        )}
      </span>
      <span className="grid justify-items-end font-body text-xs text-text-muted">
        Desde
        <b className="font-body text-[15px] font-bold tabular-nums text-text">{formatCurrency(minPriceOf(p))}</b>
      </span>
    </a>
  );
}

const SectionTitle = ({ children, action }: { children: ReactNode; action?: ReactNode }) => (
  <div className="mb-2.5 flex items-baseline gap-2.5 font-body text-[12.5px] font-bold uppercase tracking-[0.08em] text-text-muted">
    <span>{children}</span>
    {action}
  </div>
);

const chipCls =
  'nd-rise inline-flex h-[38px] items-center gap-1.5 rounded-full border border-border bg-bg px-[15px] font-body text-[14.5px] text-text transition-[border-color,transform] duration-200 hover:-translate-y-px hover:border-text';

export default function NavbarSearch() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [kb, setKb] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const s = useNavbarSearchHook(open);
  const { txt, reduced } = useTypingPlaceholder(open && !s.q);

  useEffect(() => setMounted(true), []);

  const close = () => setOpen(false);
  useDialogBehavior(open, panelRef, close);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => inputRef.current?.focus(), 60);
    return () => clearTimeout(id);
  }, [open]);

  // Atajo "/" para abrir (fuera de campos de texto)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement as HTMLElement | null;
      if (e.key === '/' && !/input|textarea|select/i.test(el?.tagName ?? '') && !el?.isContentEditable) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => setKb(-1), [s.term, open, s.hits.length]);

  const rows = () => Array.from(bodyRef.current?.querySelectorAll<HTMLElement>('[data-sk]') ?? []);

  useEffect(() => {
    rows().forEach((el, i) => el.setAttribute('data-kb', String(i === kb)));
  });

  const goAll = () => {
    const t = s.q.trim();
    if (!t) return;
    s.saveRecent(t);
    window.location.href = `/catalogo/perfumes?search=${encodeURIComponent(t)}`;
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const r = rows();
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!r.length) return;
      e.preventDefault();
      const next = (kb + (e.key === 'ArrowDown' ? 1 : -1) + r.length) % r.length;
      setKb(next);
      r[next]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (kb > -1 && r[kb]) r[kb].click();
      else goAll();
    }
  };

  const pick = (term: string) => {
    s.setQ(term);
    inputRef.current?.focus();
  };

  const trimmed = s.q.trim();
  const showSkeleton = s.active && s.hits.length === 0 && s.isLoading;
  const noResults = s.active && !s.isLoading && s.hits.length === 0;

  const panel = (
    <div
      className={`fixed inset-0 z-[85] transition-[visibility] duration-[450ms] ${open ? 'visible pointer-events-auto' : 'invisible pointer-events-none'}`}
      aria-hidden={!open}
      role="dialog"
      aria-modal="true"
      aria-label="Buscar"
    >
      <div
        onClick={close}
        className={`absolute inset-0 bg-text/40 backdrop-blur-[3px] transition-opacity duration-300 motion-reduce:transition-none ${open ? 'opacity-100' : 'opacity-0'}`}
      />
      <div
        ref={panelRef}
        className={`relative mx-auto mt-[84px] flex max-h-[calc(100dvh-120px)] w-[min(820px,calc(100%-32px))] flex-col overflow-hidden rounded-xl bg-bg shadow-[0_30px_70px_-30px_rgba(0,0,0,0.5)] transition-[transform,opacity] duration-[450ms] ease-[cubic-bezier(0.34,1.3,0.64,1)] motion-reduce:transition-none max-[820px]:m-0 max-[820px]:h-dvh max-[820px]:max-h-none max-[820px]:w-full max-[820px]:rounded-none ${
          open ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-3.5 scale-[0.98] opacity-0'
        }`}
      >
        {/* Barra */}
        <div className="relative flex flex-none items-center gap-3 border-b border-border pl-5 pr-2.5 max-[820px]:pt-[env(safe-area-inset-top,0px)]">
          <IconSearch className="h-[22px] w-[22px] shrink-0 text-accent-hover" />
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              type="search"
              value={s.q}
              onChange={(e) => s.setQ(e.target.value)}
              onKeyDown={onInputKey}
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Buscar perfumes"
              className="h-[66px] w-full min-w-0 bg-transparent font-display text-2xl text-text outline-none [&::-webkit-search-cancel-button]:hidden max-[820px]:text-xl"
            />
            {!s.q && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-2xl text-stone max-[820px]:text-xl"
              >
                {reduced ? (
                  'Busca un perfume, una marca o una nota'
                ) : (
                  <>
                    Busca <b className="font-normal text-accent-hover">«{txt}»</b>
                    <i className="nd-blink ml-0.5 inline-block h-6 w-0.5 bg-accent align-middle" />
                  </>
                )}
              </span>
            )}
          </div>
          <button
            onClick={close}
            aria-label="Cerrar búsqueda"
            className="grid h-11 w-11 flex-none place-items-center rounded-full transition-colors hover:bg-bg-alt"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <div ref={bodyRef} className="overflow-auto overscroll-contain px-5 pb-[22px] pt-2" aria-live="polite">
          {open && !trimmed && (
            <>
              {s.recents.length > 0 && (
                <div className="pt-4">
                  <SectionTitle
                    action={
                      <button
                        onClick={s.clearRecents}
                        className="ml-auto font-semibold normal-case tracking-normal text-text-soft underline underline-offset-[3px]"
                      >
                        Borrar
                      </button>
                    }
                  >
                    Búsquedas recientes
                  </SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {s.recents.map((r, i) => (
                      <button key={r} onClick={() => pick(r)} className={chipCls} style={{ ['--i' as string]: i }}>
                        <svg className="h-[15px] w-[15px] text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="9" />
                          <path d="M12 7v5l3 2" />
                        </svg>
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {s.mostSearched.length > 0 && (
                <div className="pt-4">
                  <SectionTitle>Lo más buscado</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {s.mostSearched.map((b, i) => (
                      <button key={b} onClick={() => pick(b)} className={chipCls} style={{ ['--i' as string]: i }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {s.noteChips.length > 0 && (
                <div className="pt-4">
                  <SectionTitle>Busca por nota</SectionTitle>
                  <div className="flex flex-wrap gap-2">
                    {s.noteChips.map((n, i) => (
                      <button key={n.name} onClick={() => pick(n.name)} className={chipCls} style={{ ['--i' as string]: i }}>
                        <i className="inline-block h-2.5 w-2.5 rounded-full border border-border" style={{ background: n.color }} aria-hidden="true" />
                        {n.name}
                        <span className="text-[12.5px] tabular-nums text-text-muted">{n.count}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {s.popularProducts.length > 0 && (
                <div className="pt-4">
                  <SectionTitle>Lo que más se pide</SectionTitle>
                  <div className="grid gap-0.5">
                    {s.popularProducts.map((p, i) => (
                      <ResultRow key={p.id} p={p} q="" i={i} onNavigate={close} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {showSkeleton && (
            <div className="grid gap-2 pt-4" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="grid animate-pulse grid-cols-[56px_1fr_auto] items-center gap-3.5 p-2">
                  <div className="h-14 w-14 rounded-md bg-bg-alt" />
                  <div className="grid gap-2">
                    <div className="h-3 w-1/4 rounded bg-bg-alt" />
                    <div className="h-4 w-2/3 rounded bg-bg-alt" />
                  </div>
                  <div className="h-5 w-14 rounded bg-bg-alt" />
                </div>
              ))}
            </div>
          )}

          {s.active && s.hits.length > 0 && (
            <>
              {(s.houses.length > 0 || s.notes.length > 0) && (
                <div className="flex flex-wrap gap-2 pt-4">
                  {s.houses.map((h) => (
                    <a
                      key={h.name}
                      href={`/catalogo/perfumes?search=${encodeURIComponent(h.name)}`}
                      onClick={() => s.saveRecent(s.q)}
                      className="nd-rise inline-flex h-[38px] items-center gap-2 rounded-full border border-text bg-text px-[15px] font-body text-[14.5px] text-bg"
                    >
                      Casa · {h.name} <span className="tabular-nums text-stone">{h.count}</span> <span aria-hidden="true">→</span>
                    </a>
                  ))}
                  {s.notes.map((n) => (
                    <a
                      key={n.name}
                      href={`/catalogo/perfumes?search=${encodeURIComponent(n.name)}`}
                      onClick={() => s.saveRecent(s.q)}
                      className="nd-rise inline-flex h-[38px] items-center gap-2 rounded-full border border-text px-[15px] font-body text-[14.5px] text-text"
                    >
                      <i className="inline-block h-2.5 w-2.5 rounded-full border border-border" style={{ background: n.color }} aria-hidden="true" />
                      Nota · {n.name} <span className="tabular-nums text-text-muted">{n.count}</span> <span aria-hidden="true">→</span>
                    </a>
                  ))}
                </div>
              )}
              <div className="pt-4">
                <SectionTitle
                  action={
                    <em className="font-medium normal-case not-italic tracking-normal text-accent-hover tabular-nums">
                      {s.total} {s.total === 1 ? 'resultado' : 'resultados'}
                    </em>
                  }
                >
                  Perfumes
                </SectionTitle>
                <div className="grid gap-0.5">
                  {s.hits.map(({ product: p, reason }, i) => (
                    <ResultRow
                      key={p.id}
                      p={p}
                      reason={reason}
                      q={s.term}
                      i={i}
                      onNavigate={() => {
                        s.saveRecent(s.q);
                        close();
                      }}
                    />
                  ))}
                </div>
              </div>
              {s.hasMore && (
                <button
                  onClick={goAll}
                  className="group mt-3.5 h-[52px] w-full rounded-lg bg-text font-body text-[15px] font-semibold text-bg transition-colors hover:bg-text-soft"
                >
                  Ver los {s.total} resultados{' '}
                  <span className="inline-block transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true">→</span>
                </button>
              )}
            </>
          )}

          {noResults && (
            <div className="grid gap-2.5 pb-1.5 pt-6">
              <p className="font-display text-[28px] leading-tight text-text">No encontramos «{s.term}»</p>
              {s.suggestion ? (
                <p className="font-body text-[15px] text-text-soft">
                  ¿Quisiste decir{' '}
                  <button onClick={() => pick(s.suggestion!)} className="font-semibold text-text underline underline-offset-[3px]">
                    {s.suggestion}
                  </button>
                  ?
                </p>
              ) : (
                <p className="font-body text-sm text-text-muted">Revisa la ortografía o prueba con la marca o una nota.</p>
              )}
              <div className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3.5 gap-y-1.5 rounded-[10px] border border-dashed border-accent bg-gold-light p-4">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-text text-accent">
                  <IconPlane className="h-5 w-5" />
                </span>
                <div className="font-body text-sm text-text-soft">
                  <b className="block text-base text-text">¿Lo buscas sellado?</b>
                  Lo traemos bajo pedido en 13 a 17 días.
                </div>
                <a
                  href={`${WHATSAPP_URL}?text=${encodeURIComponent('Hola NonDecants, busco el perfume: ' + s.term)}`}
                  target="_blank"
                  rel="noopener"
                  className="col-span-full mt-1 flex h-12 items-center justify-center rounded-lg bg-text font-body text-[15px] font-semibold text-bg transition-colors hover:bg-text-soft"
                >
                  Pedirlo por WhatsApp
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative grid h-[42px] w-[42px] place-items-center rounded-full text-text transition-colors hover:bg-bg-alt"
        aria-label="Buscar"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <IconSearch />
      </button>
      {mounted && createPortal(panel, document.body)}
    </>
  );
}
