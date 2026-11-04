import { getSetting, getSettingsServer, useSetting, type SettingsMap } from '@/app/lib/siteSettings';

/**
 * Datos de contacto de la casa (ajustes `contact_*` del admin). Los defectos son
 * lo que antes estaba quemado en el código: sin ajuste, el sitio se ve igual.
 */
export interface Contact {
  /** Solo dígitos con código de país, p. ej. 593992305463. */
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
  hours: string;
}

export const CONTACT_DEFAULTS: Contact = {
  whatsapp: '593992305463',
  email: 'contacto@nondecants.com',
  instagram: 'https://www.instagram.com/nondecants',
  tiktok: 'https://www.tiktok.com/@nondecants_',
  hours:
    'Lunes a domingo, 08:00 a 24:00 (hora de Ecuador). Los pedidos confirmados hasta las 15:00 salen el mismo día.',
};

/** Solo dígitos: tolera que el admin escriba "+593 99 230 5463". */
function digits(value: string): string {
  return value.replace(/\D/g, '');
}

export function whatsappUrl(number: string, message?: string): string {
  const base = `https://wa.me/${digits(number)}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** 593992305463 → "+593 99 230 5463"; otros formatos → "+<dígitos>". */
export function formatPhone(number: string): string {
  const d = digits(number);
  const m = /^593(\d{2})(\d{3})(\d{4})$/.exec(d);
  return m ? `+593 ${m[1]} ${m[2]} ${m[3]}` : `+${d}`;
}

export function contactFromMap(map: SettingsMap): Contact {
  return {
    whatsapp: digits(getSetting(map, 'contact_whatsapp', CONTACT_DEFAULTS.whatsapp)) || CONTACT_DEFAULTS.whatsapp,
    email: getSetting(map, 'contact_email', CONTACT_DEFAULTS.email),
    instagram: getSetting(map, 'contact_instagram', CONTACT_DEFAULTS.instagram),
    tiktok: getSetting(map, 'contact_tiktok', CONTACT_DEFAULTS.tiktok),
    hours: getSetting(map, 'contact_hours', CONTACT_DEFAULTS.hours),
  };
}

/** Para páginas `.astro` (servidor). */
export async function getContactServer(): Promise<Contact> {
  return contactFromMap(await getSettingsServer());
}

/** Para islas React: el primer render usa el defecto (sin hydration mismatch). */
export function useContact(): Contact {
  const whatsapp = useSetting('contact_whatsapp', CONTACT_DEFAULTS.whatsapp);
  const email = useSetting('contact_email', CONTACT_DEFAULTS.email);
  const instagram = useSetting('contact_instagram', CONTACT_DEFAULTS.instagram);
  const tiktok = useSetting('contact_tiktok', CONTACT_DEFAULTS.tiktok);
  const hours = useSetting('contact_hours', CONTACT_DEFAULTS.hours);
  return { whatsapp: digits(whatsapp) || CONTACT_DEFAULTS.whatsapp, email, instagram, tiktok, hours };
}
