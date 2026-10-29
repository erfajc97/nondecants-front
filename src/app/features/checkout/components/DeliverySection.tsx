import SearchableSelect from '@/app/components/UI/SearchableSelect';
import { ALL_CANTONS } from '@/app/data/ecuadorLocations';
import { formatCurrency } from '@/app/helpers/formatCurrency';
import type { DeliveryMethod, DeliveryOption } from '../types';
import { SELECT_CLASS, optionClass, radioDotClass } from '../classes';

/** Métodos que el cliente retira en persona (no se envían). */
export const PICKUP_METHODS: DeliveryMethod[] = ['ENTREGA_PERSONAL', 'RETIRO_PIWU'];

export const isPickupMethod = (method: DeliveryMethod | null) =>
  method != null && PICKUP_METHODS.includes(method);

/**
 * Puntos de retiro con su ubicación real en Google Maps: quien retira necesita
 * saber a dónde ir, y un nombre suelto no alcanza.
 */
export const PICKUP_PLACES: Record<string, { name: string; hint: string; mapsUrl: string }> = {
  RETIRO_PIWU: {
    name: 'Piwu Market (Urdesa)',
    hint: 'Retiro en el local',
    mapsUrl: 'https://maps.app.goo.gl/D2wHX9e1yFdRVpmAA',
  },
  ENTREGA_PERSONAL: {
    name: 'Plaza Tía — La Joya',
    hint: 'Entrega personal en el punto acordado',
    mapsUrl: 'https://maps.app.goo.gl/gHDxiQzobtaQyameA',
  },
};

export type DeliveryMode = 'shipping' | 'pickup';

interface DeliverySectionProps {
  options: DeliveryOption[];
  selected: DeliveryMethod | null;
  onSelect: (method: DeliveryMethod) => void;
  mode: DeliveryMode;
  onModeChange: (mode: DeliveryMode) => void;
  city: string;
  onCityChange: (city: string) => void;
  /** Costo ya calculado para la ciudad elegida (envío). */
  shippingCost: number;
  canContinue: boolean;
  onContinue: () => void;
}

const MODES: { id: DeliveryMode; label: string; hint: string }[] = [
  { id: 'shipping', label: 'Envíenmelo', hint: 'Servientrega a todo el país' },
  { id: 'pickup', label: 'Lo retiro yo', hint: 'Guayaquil · sin costo de envío' },
];

/** Paso 1 — ¿Cómo quieres recibir tu pedido? */
export default function DeliverySection({
  options,
  selected,
  onSelect,
  mode,
  onModeChange,
  city,
  onCityChange,
  shippingCost,
  canContinue,
  onContinue,
}: DeliverySectionProps) {
  const pickupOptions = options.filter((o) => PICKUP_METHODS.includes(o.method));

  return (
    <div className="flex flex-col gap-6">
      <div role="radiogroup" aria-label="Forma de entrega" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {MODES.map((opt) => {
          const active = mode === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onModeChange(opt.id)}
              className={optionClass(active)}
            >
              <span className={radioDotClass(active)}>{active && <span className="h-3 w-3 rounded-full bg-text" />}</span>
              <span className="min-w-0">
                <span className="block font-body text-[17px] font-bold leading-tight text-text">{opt.label}</span>
                <span className="mt-1 block font-body text-[14.5px] text-text-muted">{opt.hint}</span>
              </span>
            </button>
          );
        })}
      </div>

      {mode === 'shipping' ? (
        <div>
          <label htmlFor="ck-city" className="mb-2 block font-body text-base font-semibold text-text">
            ¿A qué ciudad lo enviamos?
          </label>
          <SearchableSelect
            id="ck-city"
            value={city}
            options={ALL_CANTONS}
            placeholder="Busca tu ciudad"
            inputClassName={SELECT_CLASS}
            onChange={onCityChange}
          />
          {city && selected && (
            <p className="mt-3 flex items-center justify-between rounded-md bg-gold-light px-4 py-3 font-body text-[15px] text-text-soft">
              <span>Servientrega a {city}</span>
              <b className="tabular-nums text-text">{formatCurrency(shippingCost)}</b>
            </p>
          )}
          <p className="mt-2.5 font-body text-sm text-text-muted">
            $3,00 a Guayaquil, Durán y Samborondón. $6,50 al resto del país.
          </p>
        </div>
      ) : (
        <div>
          <p className="mb-2 font-body text-base font-semibold text-text">¿Dónde lo retiras?</p>
          <div role="radiogroup" aria-label="Punto de retiro" className="flex flex-col gap-3">
            {pickupOptions.map((opt) => {
              const active = selected === opt.method;
              const place = PICKUP_PLACES[opt.method];
              return (
                <div
                  key={opt.id}
                  className={`overflow-hidden rounded-md border-2 transition-colors ${
                    active ? 'border-text bg-gold-light' : 'border-border hover:border-text-muted'
                  }`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => onSelect(opt.method)}
                    className="flex w-full items-start gap-3.5 p-4 text-left"
                  >
                    <span className={radioDotClass(active)}>{active && <span className="h-3 w-3 rounded-full bg-text" />}</span>
                    <span className="font-body text-[17px] font-bold leading-snug text-text">
                      {place?.name ?? opt.label}
                      {place && (
                        <span className="mt-0.5 block font-body text-[14.5px] font-normal text-text-muted">{place.hint}</span>
                      )}
                    </span>
                  </button>
                  {place && (
                    <a
                      href={place.mapsUrl}
                      target="_blank"
                      rel="noopener"
                      className="flex items-center gap-1.5 border-t border-border bg-surface px-4 py-3 font-body text-sm font-semibold text-accent-hover underline-offset-2 transition-colors hover:text-text hover:underline"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 12-9 12s-9-5-9-12a9 9 0 0 1 18 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      Ver ubicación en Maps
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={!canContinue}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-text px-6 font-body text-[15px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-border disabled:text-text-muted max-[820px]:hidden"
      >
        Continuar <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
