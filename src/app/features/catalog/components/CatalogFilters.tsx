import type { ProductType } from '@/app/types/global.types';

const CATEGORIES: { value: ProductType | ''; label: string }[] = [
  { value: '',          label: 'Todos' },
  { value: 'SELLADO',   label: 'Diseñador' },
  { value: 'DECANT',    label: 'Decant' },
  { value: 'NONDECANT', label: 'Nondecant' },
];

interface CatalogFiltersProps {
  selectedType: ProductType | '';
  inStock: boolean;
  onTypeChange: (type: ProductType | '') => void;
  onInStockChange: (inStock: boolean) => void;
  onClear: () => void;
}

export default function CatalogFilters({
  selectedType,
  inStock,
  onTypeChange,
  onInStockChange,
  onClear,
}: CatalogFiltersProps) {
  return (
    <aside className="space-y-7">

      {/* Categorías */}
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-3">
          Categorías
        </p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => onTypeChange(c.value)}
              className={`px-3 py-1.5 text-xs font-heading uppercase tracking-wider border transition-colors
                ${selectedType === c.value
                  ? 'bg-[--color-text] text-[--color-bg] border-[--color-text]'
                  : 'bg-transparent border-[--color-border] text-[--color-text-muted] hover:border-[--color-text-muted]'
                }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo */}
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-3">
          Tipo
        </p>
        <div className="space-y-2">
          {[
            { value: '',          label: 'Todos' },
            { value: 'HOMBRES',   label: 'Hombres' },
            { value: 'MUJERES',   label: 'Mujeres' },
            { value: 'UNISEX',    label: 'Unisex' },
          ].map(g => (
            <label key={g.label} className="flex items-center gap-2.5 cursor-pointer group">
              <span className={`w-3.5 h-3.5 rounded-full border flex-shrink-0 transition-colors
                ${g.value === '' ? 'border-[--color-accent] bg-[--color-accent]' : 'border-[--color-border] group-hover:border-[--color-accent]'}`}
              />
              <span className="text-xs text-[--color-text-muted] group-hover:text-[--color-text] transition-colors">
                {g.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <p className="font-heading text-xs uppercase tracking-[0.2em] text-[--color-text] mb-3">
          Disponibilidad
        </p>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={e => onInStockChange(e.target.checked)}
            className="w-4 h-4 accent-[--color-accent] cursor-pointer"
          />
          <span className="text-xs text-[--color-text-muted]">Solo con stock disponible</span>
        </label>
      </div>

      {/* Limpiar */}
      <button
        onClick={onClear}
        className="text-[10px] font-heading uppercase tracking-wider text-[--color-text-muted] hover:text-[--color-accent] transition-colors border-b border-dashed border-[--color-border] pb-0.5"
      >
        Limpiar filtros
      </button>
    </aside>
  );
}
