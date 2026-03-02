import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { DeliveryOption, DeliveryMethod } from '../types';

interface DeliveryMethodSelectorProps {
  options: DeliveryOption[];
  selected: DeliveryMethod | null;
  isLoading: boolean;
  city: string;
  onChange: (method: DeliveryMethod) => void;
}

export default function DeliveryMethodSelector({
  options,
  selected,
  isLoading,
  city,
  onChange,
}: DeliveryMethodSelectorProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-heading text-base uppercase tracking-wider text-[--color-text]">
        Método de entrega
      </h2>

      {!city ? (
        <p className="text-xs text-[--color-text-muted]">Ingresa tu ciudad para ver las opciones.</p>
      ) : isLoading ? (
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-[--color-surface] animate-pulse" style={{ borderRadius: 'var(--radius-sm)' }} />
          ))}
        </div>
      ) : options.length === 0 ? (
        <p className="text-xs text-[--color-text-muted]">No hay métodos disponibles para esta ciudad.</p>
      ) : (
        <div className="space-y-2">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onChange(opt.method)}
              className={`w-full flex items-center justify-between px-4 py-3.5 border text-sm transition-colors ${
                selected === opt.method
                  ? 'border-[--color-accent] bg-[--color-surface]'
                  : 'border-[--color-border] hover:border-[--color-accent]'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                    selected === opt.method
                      ? 'border-[--color-accent] bg-[--color-accent]'
                      : 'border-[--color-border]'
                  }`}
                />
                <span className="text-[--color-text] text-left">{opt.label}</span>
              </div>
              <span className={`font-heading text-sm ${opt.cost === 0 ? 'text-[--color-success]' : 'text-[--color-accent]'}`}>
                {opt.cost === 0 ? 'GRATIS' : formatCurrency(opt.cost)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
