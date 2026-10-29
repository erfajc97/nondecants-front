import { GENDER_OPTIONS, MOMENTO_OPTIONS, NOTE_OPTIONS, PRICE3_OPTIONS } from '../data';
import type { CatalogCriteria, FilterOption, FilterSection } from '../types';
import MomentIcon from './MomentIcon';

interface CatalogFiltersProps {
  criteria: CatalogCriteria;
  counts: Record<string, number>;
  casaOptions: FilterOption[];
  hideCasas?: boolean;
  onToggle: (section: FilterSection, value: string) => void;
}

const TITLE = 'mb-3 font-body text-[12.5px] font-semibold uppercase tracking-[0.12em] text-text';

function Check({ className = '' }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

interface OptionButtonProps {
  option: FilterOption;
  selected: boolean;
  count: number;
  onPress: () => void;
  leading?: React.ReactNode;
  serif?: boolean;
}

/** Opción en píldora: elegida = negra con check dorado; sin resultados = apagada y no tocable. */
function OptionPill({ option, selected, count, onPress, leading, serif }: OptionButtonProps) {
  const off = count === 0 && !selected;
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={off}
      aria-pressed={selected}
      className={`inline-flex h-10 items-center gap-2 rounded-full border px-3.5 transition-colors ${
        selected ? 'border-text bg-text text-white' : 'border-border bg-white text-text hover:border-text'
      } ${off ? 'pointer-events-none opacity-35' : ''} ${serif ? 'font-display text-[15px]' : 'font-body text-sm font-semibold'}`}
    >
      {selected && <Check className="text-accent" />}
      {leading}
      {option.label}
      <span className={`font-body text-[11px] font-medium ${selected ? 'text-white/70' : 'text-text-muted'}`}>{count}</span>
    </button>
  );
}

/** Casa: fila con casilla. */
function CasaRow({ option, selected, count, onPress }: OptionButtonProps) {
  const off = count === 0 && !selected;
  return (
    <button
      type="button"
      onClick={onPress}
      disabled={off}
      aria-pressed={selected}
      className={`flex min-h-10 w-full items-center gap-3 rounded-sm py-1.5 text-left font-body text-sm text-text transition-colors hover:bg-bg-alt ${off ? 'pointer-events-none opacity-35' : ''}`}
    >
      <span
        className={`grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[4px] border ${
          selected ? 'border-text bg-text text-accent' : 'border-border bg-white'
        }`}
      >
        {selected && <Check />}
      </span>
      <span className={`flex-1 ${selected ? 'font-semibold' : ''}`}>{option.label}</span>
      <span className="text-[11px] text-text-muted">{count}</span>
    </button>
  );
}

export default function CatalogFilters({ criteria, counts, casaOptions, hideCasas, onToggle }: CatalogFiltersProps) {
  const c = (section: FilterSection, value: string) => counts[`${section}:${value}`] ?? 0;
  const has = (section: FilterSection, value: string) => criteria[section].includes(value);

  return (
    <div className="divide-y divide-border">
      <section className="py-5">
        <h3 className={TITLE}>Para</h3>
        <div className="flex flex-wrap gap-2">
          {GENDER_OPTIONS.map((o) => (
            <OptionPill key={o.value} option={o} selected={has('genders', o.value)} count={c('genders', o.value)} onPress={() => onToggle('genders', o.value)} />
          ))}
        </div>
      </section>

      <section className="py-5">
        <h3 className={TITLE}>Momento</h3>
        <div className="flex flex-wrap gap-2">
          {MOMENTO_OPTIONS.map((o) => (
            <OptionPill
              key={o.value}
              option={o}
              selected={has('momentos', o.value)}
              count={c('momentos', o.value)}
              onPress={() => onToggle('momentos', o.value)}
              leading={<MomentIcon name={o.value} />}
            />
          ))}
        </div>
      </section>

      <section className="py-5">
        <h3 className={TITLE}>Precio del 3 ml</h3>
        <div className="flex flex-wrap gap-2">
          {PRICE3_OPTIONS.map((o) => (
            <OptionPill key={o.value} option={o} selected={has('precios', o.value)} count={c('precios', o.value)} onPress={() => onToggle('precios', o.value)} />
          ))}
        </div>
      </section>

      <section className="py-5">
        <h3 className={TITLE}>Notas que te gustan</h3>
        <div className="flex flex-wrap gap-2">
          {NOTE_OPTIONS.map((o) => (
            <OptionPill
              key={o.value}
              option={o}
              serif
              selected={has('notas', o.value)}
              count={c('notas', o.value)}
              onPress={() => onToggle('notas', o.value)}
              leading={<span className="h-2.5 w-2.5 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: o.color }} aria-hidden />}
            />
          ))}
        </div>
      </section>

      {!hideCasas && casaOptions.length > 0 && (
        <section className="py-5">
          <h3 className={TITLE}>Casas</h3>
          <div className="max-h-[300px] overflow-y-auto pr-1">
            {casaOptions.map((o) => (
              <CasaRow key={o.value} option={o} selected={has('casas', o.value)} count={c('casas', o.value)} onPress={() => onToggle('casas', o.value)} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
