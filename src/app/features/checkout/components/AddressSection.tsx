import SearchableSelect from '@/app/components/UI/SearchableSelect';
import { PROVINCE_NAMES, cantonsOf, ALL_CANTONS } from '@/app/data/ecuadorLocations';
import type { CustomerFormData } from '../types';
import type { Address } from '@/app/features/profile/types';

import { INPUT_CLASS, SELECT_CLASS, optionClass, radioDotClass } from '../classes';

interface AddressSectionProps {
  customer: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  /** Retiro en tienda: no hace falta dirección ni provincia. */
  isPickup: boolean;
  /** Direcciones guardadas del usuario (REQ-062); vacío si es guest. */
  savedAddresses?: Address[];
  /** Dirección aplicada al formulario; null = "nueva dirección" a mano. */
  selectedAddressId?: string | null;
  onSelectAddress?: (id: string | null) => void;
}

/**
 * Datos de quien recibe: nombre, documento, teléfono y —si hay envío— la
 * dirección. Va al final del paso 1, después de elegir cómo recibir el pedido.
 * Si el usuario tiene direcciones guardadas, arriba va el selector para
 * autocompletar (la predeterminada ya viene preseleccionada).
 */
export default function AddressSection({
  customer,
  onChange,
  isPickup,
  savedAddresses = [],
  selectedAddressId = null,
  onSelectAddress,
}: AddressSectionProps) {
  const showSavedSelector = !isPickup && savedAddresses.length > 0 && onSelectAddress != null;

  return (
    <section>
      <h2 className="mb-1 font-body! text-xl font-bold text-text">
        {isPickup ? '¿Quién retira el pedido?' : '¿Dónde enviamos tu pedido?'}
      </h2>
      <p className="mb-4 font-body text-[15px] text-text-muted">
        {isPickup ? 'Datos de quien pasa a retirar' : 'Nombre y dirección de entrega'}
      </p>

      {showSavedSelector && (
        <div className="mb-6">
          <p className="mb-2.5 font-body text-[15px] font-semibold text-text">
            Usa una dirección guardada
          </p>
          <div className="flex flex-col gap-2">
            {savedAddresses.map((addr) => {
              const active = selectedAddressId === addr.id;
              return (
                <button
                  key={addr.id}
                  type="button"
                  onClick={() => onSelectAddress?.(addr.id)}
                  className={optionClass(active)}
                >
                  <span className={radioDotClass(active)}>
                    {active && <span className="h-3 w-3 rounded-full bg-text" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-[16px] font-semibold leading-snug text-text">
                        {addr.alias}
                      </span>
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
            <button
              type="button"
              onClick={() => onSelectAddress?.(null)}
              className={optionClass(selectedAddressId === null)}
            >
              <span className={radioDotClass(selectedAddressId === null)}>
                {selectedAddressId === null && <span className="h-3 w-3 rounded-full bg-text" />}
              </span>
              <span className="font-body text-[16px] font-semibold leading-snug text-text">
                Nueva dirección — escribir los datos a mano
              </span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <input
          type="text"
          placeholder="Nombres *"
          value={customer.name}
          onChange={(e) => onChange('name', e.target.value)}
          className={INPUT_CLASS}
          required
        />
        <input
          type="text"
          placeholder="Apellidos *"
          value={customer.lastName}
          onChange={(e) => onChange('lastName', e.target.value)}
          className={INPUT_CLASS}
          required
        />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={13}
          placeholder="Cédula / RUC"
          value={customer.cedula}
          onChange={(e) => onChange('cedula', e.target.value)}
          className={INPUT_CLASS}
        />
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          maxLength={10}
          placeholder="Número telefónico (10 dígitos) *"
          value={customer.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          className={INPUT_CLASS}
          required
        />

        {!isPickup && (
          <input
            type="text"
            placeholder="Dirección *"
            value={customer.address}
            onChange={(e) => onChange('address', e.target.value)}
            className={`${INPUT_CLASS} md:col-span-2`}
            required
          />
        )}

        {!isPickup && (
          <SearchableSelect
            value={customer.province}
            options={PROVINCE_NAMES}
            placeholder="Provincia"
            inputClassName={SELECT_CLASS}
            onChange={(v) => {
              onChange('province', v);
              if (v !== customer.province) onChange('city', '');
            }}
          />
        )}

        {/* En retiro no se pregunta ciudad: el punto de retiro ya la define y
            pedirla obligaba a llenar un dato que no cambia nada. */}
        {!isPickup && (
          <SearchableSelect
            value={customer.city}
            options={customer.province ? cantonsOf(customer.province) : ALL_CANTONS}
            placeholder="Ciudad *"
            inputClassName={SELECT_CLASS}
            onChange={(v) => onChange('city', v)}
          />
        )}

        <input
          type="text"
          placeholder="Referencia (opcional)"
          value={customer.reference}
          onChange={(e) => onChange('reference', e.target.value)}
          className={`${INPUT_CLASS} md:col-span-2`}
        />
      </div>
    </section>
  );
}
