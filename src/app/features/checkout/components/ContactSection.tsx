import type { CustomerFormData } from '../types';

import { INPUT_CLASS } from '../classes';

interface ContactSectionProps {
  customer: CustomerFormData;
  onChange: (field: keyof CustomerFormData, value: string) => void;
  /** Con sesión no se ofrece el bloque invitado / crear cuenta. */
  isAuthenticated: boolean;
  onLogin: () => void;
}

/**
 * Contacto: aquí solo el correo (a esa dirección llega la confirmación).
 * Nombre, cédula y demás van en el bloque de envío, más abajo.
 */
export default function ContactSection({
  customer,
  onChange,
  isAuthenticated,
  onLogin,
}: ContactSectionProps) {
  return (
    <section>
      <h2 className="mb-3 font-body! text-xl font-bold text-text">Información de contacto</h2>

      <input
        type="email"
        aria-label="Correo electrónico"
        placeholder="Correo electrónico *"
        value={customer.email}
        onChange={(e) => onChange('email', e.target.value)}
        className={INPUT_CLASS}
        required
      />

      {!isAuthenticated && (
        <div className="mt-4 flex flex-col items-start gap-2.5 rounded-md bg-gold-light px-4 py-3.5">
          <p className="font-body text-[15px] leading-snug text-text-soft">
            Sigues <span className="text-text">como invitado</span>: no necesitas cuenta para
            terminar el pedido.
          </p>
          <button
            type="button"
            onClick={onLogin}
            className="shrink-0 font-body text-[15px] font-semibold text-text underline underline-offset-4 transition-colors hover:text-accent-hover"
          >
            Crear cuenta o entrar
          </button>
        </div>
      )}
    </section>
  );
}
