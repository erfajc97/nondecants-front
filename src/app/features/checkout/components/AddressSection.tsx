import type { ReactNode } from 'react';
import type { CustomerFormData } from '../types';
import type { ContactErrors } from '../validators';
import type { Address } from '@/app/features/profile/types';

import { INPUT_CLASS, optionClass, radioDotClass } from '../classes';

interface AddressSectionProps {
  customer: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  /** Retiro en tienda: no hace falta dirección ni referencia. */
  isPickup: boolean;
  errors: ContactErrors;
  /** Muestra los errores (tras intentar continuar). */
  showErrors: boolean;
  /** Cambia en cada intento fallido: reinicia el temblor del campo. */
  shakeTick: number;
  isAuthenticated: boolean;
  onLogin: () => void;
  /** Direcciones guardadas del usuario (REQ-062); vacío si es guest. */
  savedAddresses?: Address[];
  /** Dirección aplicada al formulario; null = "nueva dirección" a mano. */
  selectedAddressId?: string | null;
  onSelectAddress?: (id: string | null) => void;
  onContinue: () => void;
}

function Field({
  id,
  label,
  optional,
  error,
  shakeTick,
  className = '',
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  shakeTick: number;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block font-body text-base font-semibold text-text">
        {label}
        {optional && <span className="ml-1.5 font-normal text-text-muted">(opcional)</span>}
      </label>
      {/* Dos animaciones gemelas: alternarlas reinicia el temblor en cada intento fallido */}
      <div className={error ? (shakeTick % 2 ? 'ck-shake-a' : 'ck-shake-b') : ''}>{children}</div>
      {error && (
        <p id={`${id}-err`} role="alert" className="mt-1.5 font-body text-sm font-semibold text-error">
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Paso 2 — Tus datos. La ciudad ya se eligió en el paso 1; aquí solo van
 * quién recibe y, si hay envío, dirección y referencia.
 */
export default function AddressSection({
  customer,
  onChange,
  isPickup,
  errors,
  showErrors,
  shakeTick,
  isAuthenticated,
  onLogin,
  savedAddresses = [],
  selectedAddressId = null,
  onSelectAddress,
  onContinue,
}: AddressSectionProps) {
  const showSavedSelector = !isPickup && savedAddresses.length > 0 && onSelectAddress != null;
  const err = (k: keyof CustomerFormData) => (showErrors ? errors[k] : undefined);
  const cls = (k: keyof CustomerFormData) =>
    `${INPUT_CLASS} ${err(k) ? 'border-error focus:border-error' : ''}`;

  return (
    <div className="flex flex-col gap-5">
      {showSavedSelector && (
        <div>
          <p className="mb-2.5 font-body text-base font-semibold text-text">Usa una dirección guardada</p>
          <div className="flex flex-col gap-2">
            {savedAddresses.map((addr) => {
              const active = selectedAddressId === addr.id;
              return (
                <button key={addr.id} type="button" onClick={() => onSelectAddress?.(addr.id)} className={optionClass(active)}>
                  <span className={radioDotClass(active)}>{active && <span className="h-3 w-3 rounded-full bg-text" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-[16px] font-semibold leading-snug text-text">{addr.alias}</span>
                      {addr.isDefault && (
                        <span className="rounded-full bg-gold-light px-2.5 py-0.5 font-body text-xs font-semibold text-accent-hover">
                          Predeterminada
                        </span>
                      )}
                    </span>
                    <span className="block truncate font-body text-sm text-text-muted">
                      {addr.direccion}, {addr.ciudad}
                    </span>
                  </span>
                </button>
              );
            })}
            <button type="button" onClick={() => onSelectAddress?.(null)} className={optionClass(selectedAddressId === null)}>
              <span className={radioDotClass(selectedAddressId === null)}>
                {selectedAddressId === null && <span className="h-3 w-3 rounded-full bg-text" />}
              </span>
              <span className="font-body text-[16px] font-semibold leading-snug text-text">Nueva dirección: escribir los datos a mano</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
        <Field id="ck-name" label="Nombres" error={err('name')} shakeTick={shakeTick}>
          <input
            id="ck-name"
            type="text"
            autoComplete="given-name"
            value={customer.name}
            onChange={(e) => onChange('name', e.target.value)}
            aria-invalid={!!err('name')}
            className={cls('name')}
          />
        </Field>
        <Field id="ck-lastname" label="Apellidos" error={err('lastName')} shakeTick={shakeTick}>
          <input
            id="ck-lastname"
            type="text"
            autoComplete="family-name"
            value={customer.lastName}
            onChange={(e) => onChange('lastName', e.target.value)}
            aria-invalid={!!err('lastName')}
            className={cls('lastName')}
          />
        </Field>
        <Field id="ck-phone" label="Teléfono (10 dígitos)" error={err('phone')} shakeTick={shakeTick}>
          <input
            id="ck-phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            maxLength={10}
            placeholder="09XXXXXXXX"
            value={customer.phone}
            onChange={(e) => onChange('phone', e.target.value)}
            aria-invalid={!!err('phone')}
            className={cls('phone')}
          />
        </Field>
        <Field id="ck-email" label="Correo" error={err('email')} shakeTick={shakeTick}>
          <input
            id="ck-email"
            type="email"
            autoComplete="email"
            placeholder="tucorreo@ejemplo.com"
            value={customer.email}
            onChange={(e) => onChange('email', e.target.value)}
            aria-invalid={!!err('email')}
            className={cls('email')}
          />
        </Field>
        <Field id="ck-cedula" label="Cédula / RUC" optional error={err('cedula')} shakeTick={shakeTick} className="md:col-span-2">
          <input
            id="ck-cedula"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            maxLength={13}
            value={customer.cedula}
            onChange={(e) => onChange('cedula', e.target.value)}
            aria-invalid={!!err('cedula')}
            className={cls('cedula')}
          />
        </Field>

        {!isPickup && (
          <>
            <Field id="ck-address" label="Dirección" error={err('address')} shakeTick={shakeTick} className="md:col-span-2">
              <input
                id="ck-address"
                type="text"
                autoComplete="street-address"
                placeholder="Calle principal, número y calle secundaria"
                value={customer.address}
                onChange={(e) => onChange('address', e.target.value)}
                aria-invalid={!!err('address')}
                className={cls('address')}
              />
            </Field>
            <Field id="ck-reference" label="Referencia" optional shakeTick={shakeTick} className="md:col-span-2">
              <input
                id="ck-reference"
                type="text"
                placeholder="Cerca de..., color de la casa"
                value={customer.reference}
                onChange={(e) => onChange('reference', e.target.value)}
                className={INPUT_CLASS}
              />
            </Field>
          </>
        )}
      </div>

      {!isAuthenticated && (
        <p className="font-body text-[15px] text-text-soft">
          ¿Ya compraste antes?{' '}
          <button
            type="button"
            onClick={onLogin}
            className="font-semibold text-text underline underline-offset-4 transition-colors hover:text-accent-hover"
          >
            Entra aquí
          </button>
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        className="flex h-14 w-full items-center justify-center gap-2 rounded-sm bg-text px-6 font-body text-[15px] font-semibold text-bg transition-[background-color,transform] duration-200 hover:bg-text-soft active:scale-[0.97] max-[820px]:hidden"
      >
        Continuar <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
