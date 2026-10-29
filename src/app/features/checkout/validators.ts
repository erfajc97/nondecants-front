import type { CustomerFormData } from './types';

/** Solo dígitos. */
export const onlyDigits = (v: string) => v.replace(/\D+/g, '');

/** Email RFC simple — suficiente para checkout. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const isValidEmail = (v: string) => EMAIL_RE.test(v.trim());

/** Cédula EC = 10 dígitos · RUC = 13 dígitos. */
export const isValidCedula = (v: string) => v.length === 10 || v.length === 13;

/** Celular EC = 10 dígitos (09xxxxxxxx). */
export const isValidPhone = (v: string) => v.length === 10;

/**
 * Normaliza el valor según el campo (filtra mientras se escribe):
 * cédula → solo dígitos máx 13 · teléfono → solo dígitos máx 10.
 * El resto pasa sin tocar.
 */
export function normalizeCustomerField(
  field: keyof CustomerFormData,
  value: string,
): string {
  if (field === 'cedula') return onlyDigits(value).slice(0, 13);
  if (field === 'phone') return onlyDigits(value).slice(0, 10);
  return value;
}

/**
 * Valida los datos de contacto antes de avanzar de paso.
 * Devuelve el primer mensaje de error, o null si todo OK.
 * En retiro en tienda no se pide dirección (no hay envío).
 */
export function validateContact(
  c: CustomerFormData,
  options: { requiresAddress?: boolean } = {},
): string | null {
  const { requiresAddress = true } = options;

  if (!c.email.trim()) return 'Ingresa tu correo electrónico.';
  if (!isValidEmail(c.email)) return 'El correo electrónico no es válido.';
  if (!c.name.trim()) return 'Ingresa tus nombres.';
  if (!c.lastName.trim()) return 'Ingresa tus apellidos.';
  if (c.cedula && !isValidCedula(c.cedula))
    return 'La cédula debe tener 10 dígitos (o 13 si es RUC).';
  if (requiresAddress && !c.address.trim()) return 'Ingresa tu dirección.';
  // La ciudad solo importa cuando hay envío: en retiro la define el punto.
  if (requiresAddress && !c.city) return 'Selecciona tu ciudad.';
  if (!c.phone.trim()) return 'Ingresa tu número telefónico.';
  if (!isValidPhone(c.phone)) return 'El teléfono debe tener 10 dígitos.';
  return null;
}

export type ContactErrors = Partial<Record<keyof CustomerFormData, string>>;

/**
 * Errores por campo (paso 2). La ciudad ya se eligió en el paso 1, así que
 * aquí no se valida; la dirección solo se exige cuando hay envío.
 */
export function validateContactFields(
  c: CustomerFormData,
  options: { requiresAddress?: boolean } = {},
): ContactErrors {
  const { requiresAddress = true } = options;
  const e: ContactErrors = {};
  if (!c.name.trim()) e.name = 'Ingresa tus nombres.';
  if (!c.lastName.trim()) e.lastName = 'Ingresa tus apellidos.';
  if (!c.phone.trim()) e.phone = 'Ingresa tu teléfono.';
  else if (!isValidPhone(c.phone)) e.phone = 'El teléfono debe tener 10 dígitos.';
  if (!c.email.trim()) e.email = 'Ingresa tu correo.';
  else if (!isValidEmail(c.email)) e.email = 'El correo no es válido.';
  if (c.cedula && !isValidCedula(c.cedula)) e.cedula = 'Debe tener 10 dígitos (13 si es RUC).';
  if (requiresAddress && !c.address.trim()) e.address = 'Ingresa tu dirección.';
  return e;
}
