import { useState } from 'react';
import Loader from '@/app/components/Loader';
import SearchableSelect from '@/app/components/UI/SearchableSelect';
import { PROVINCE_NAMES, cantonsOf, ALL_CANTONS } from '@/app/data/ecuadorLocations';
import { validateAddressForm } from '../validators';
import type { Address, AddressPayload } from '../types';

const INPUT =
  'w-full border border-border bg-surface px-3.5 py-3 font-body text-sm text-text placeholder:text-text-muted focus:border-text focus:outline-none transition-colors';
const LABEL = 'mb-2 block font-body text-[13px] font-semibold text-text-muted';

const EMPTY_FORM: AddressPayload = {
  alias: '',
  provincia: '',
  ciudad: '',
  direccion: '',
  referencia: '',
  telefono: '',
  isDefault: false,
};

interface AddressFormProps {
  /** Dirección a editar; null/undefined = alta nueva. */
  initial?: Address | null;
  isPending: boolean;
  onSubmit: (payload: AddressPayload) => void;
  onCancel: () => void;
}

/** Formulario de alta/edición de dirección guardada (validación con Zod). */
export default function AddressForm({ initial, isPending, onSubmit, onCancel }: AddressFormProps) {
  const [form, setForm] = useState<AddressPayload>(() =>
    initial
      ? {
          alias: initial.alias,
          provincia: initial.provincia,
          ciudad: initial.ciudad,
          direccion: initial.direccion,
          referencia: initial.referencia,
          telefono: initial.telefono,
          isDefault: initial.isDefault,
        }
      : EMPTY_FORM,
  );
  const [error, setError] = useState<string | null>(null);

  const updateField = (key: keyof AddressPayload, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AddressPayload = {
      ...form,
      telefono: form.telefono.replace(/\D+/g, '').slice(0, 10),
    };
    const validationError = validateAddressForm(payload);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="border border-border bg-surface p-6">
      <span className="eyebrow mb-5 block">
        {initial ? 'Editar dirección' : 'Nueva dirección'}
      </span>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL}>Alias *</label>
          <input
            type="text"
            value={form.alias}
            onChange={(e) => updateField('alias', e.target.value)}
            placeholder="Casa, Oficina…"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Teléfono *</label>
          <input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            value={form.telefono}
            onChange={(e) => updateField('telefono', e.target.value.replace(/\D+/g, '').slice(0, 10))}
            placeholder="09XXXXXXXX"
            className={INPUT}
          />
        </div>
        <div>
          <label className={LABEL}>Provincia *</label>
          <SearchableSelect
            value={form.provincia}
            options={PROVINCE_NAMES}
            placeholder="Buscar provincia"
            onChange={(v) => {
              updateField('provincia', v);
              // Al cambiar de provincia la ciudad anterior deja de tener sentido.
              if (v !== form.provincia) updateField('ciudad', '');
            }}
          />
        </div>
        <div>
          <label className={LABEL}>Ciudad *</label>
          <SearchableSelect
            value={form.ciudad}
            options={form.provincia ? cantonsOf(form.provincia) : ALL_CANTONS}
            placeholder="Buscar ciudad"
            onChange={(v) => updateField('ciudad', v)}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Dirección *</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => updateField('direccion', e.target.value)}
            placeholder="Av. Principal 123 y Secundaria"
            className={INPUT}
          />
        </div>
        <div className="sm:col-span-2">
          <label className={LABEL}>Referencia</label>
          <input
            type="text"
            value={form.referencia}
            onChange={(e) => updateField('referencia', e.target.value)}
            placeholder="Cerca de..."
            className={INPUT}
          />
        </div>
      </div>

      <label className="mt-4 flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          checked={form.isDefault ?? false}
          onChange={(e) => updateField('isDefault', e.target.checked)}
          className="h-4 w-4 accent-accent"
        />
        <span className="font-body text-xs text-text-soft">
          Usar como dirección predeterminada (se preselecciona en el checkout)
        </span>
      </label>

      {error && (
        <p className="mt-4 font-body text-xs text-error">{error}</p>
      )}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-[3px] bg-text px-8 py-3.5 font-body text-[14.5px] font-semibold tracking-[0.01em] text-bg transition-colors hover:bg-text-soft disabled:opacity-50"
        >
          {isPending ? <Loader size={16} color="#fff" /> : initial ? 'Guardar cambios' : 'Guardar dirección'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isPending}
          className="border border-border px-8 py-3.5 font-body text-[14.5px] font-semibold tracking-[0.01em] text-text-soft transition-colors hover:border-text hover:text-text disabled:opacity-50"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
