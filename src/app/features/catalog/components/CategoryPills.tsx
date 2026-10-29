import { CATEGORY_TABS } from '../data';
import type { CategoryKey } from '../types';

interface CategoryPillsProps {
  active: CategoryKey;
  counts: Record<CategoryKey, number>;
  showCounts: boolean;
  onSelect: (key: CategoryKey) => void;
}

/** Píldoras de 44 px (42 en móvil). En móvil se deslizan con el borde derecho difuminado. */
export default function CategoryPills({ active, counts, showCounts, onSelect }: CategoryPillsProps) {
  return (
    <nav
      aria-label="Categorías"
      className="relative after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-10 after:bg-gradient-to-l after:from-bg after:to-transparent md:after:hidden"
    >
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {CATEGORY_TABS.map((tab) => {
          const on = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onSelect(tab.key)}
              aria-pressed={on}
              className={`inline-flex h-[42px] shrink-0 items-center gap-2 whitespace-nowrap rounded-full border px-[18px] font-body text-sm font-semibold transition-colors md:h-11 md:px-5 md:text-[15px] ${
                on ? 'border-text bg-text text-white' : 'border-border bg-white text-text hover:border-text'
              }`}
            >
              {tab.label}
              {showCounts && (
                <span className={`text-xs font-semibold ${on ? 'text-accent' : 'text-text-muted'}`}>{counts[tab.key]}</span>
              )}
            </button>
          );
        })}
        <span className="w-6 shrink-0 md:hidden" aria-hidden />
      </div>
    </nav>
  );
}
