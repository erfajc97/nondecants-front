import { useEffect, useState } from 'react';
import axiosInstance from '@/app/config/axiosConfig';
import { API_ENDPOINTS } from '@/app/api/endpoints';

const ANNOUNCEMENT_DEFAULT = 'Envíos a todo el Ecuador · Servientrega 24–72h';
/** Cuántas veces mínimo debe aparecer el listado en cada pista del marquee
    para que nunca quede un hueco, aun con un solo texto. */
const MIN_ITEMS_PER_TRACK = 6;

/**
 * El setting `announcement_bar` guarda un JSON array de textos. Se acepta el
 * formato antiguo (un solo string plano) para no romper lo ya guardado.
 */
function parseAnnouncements(raw: unknown): string[] {
  if (typeof raw !== 'string' || raw.trim() === '') return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t): t is string => typeof t === 'string' && t.trim() !== '');
    }
  } catch {
    /* valor plano (formato antiguo) */
  }
  return [raw];
}

/**
 * Barra superior de avisos — marquee negro con ✦ dorados entre mensajes
 * (prototipo de marca). Los textos se administran desde el admin
 * (Ajustes → Barra superior). Se pausa al pasar el mouse.
 */
export default function AnnouncementBar() {
  const [items, setItems] = useState<string[]>([ANNOUNCEMENT_DEFAULT]);

  useEffect(() => {
    axiosInstance
      .get(`${API_ENDPOINTS.SETTINGS}/announcement_bar`)
      .then(({ data }) => {
        const list = parseAnnouncements(data?.data?.value ?? data?.value);
        if (list.length > 0) setItems(list);
      })
      .catch(() => {});
  }, []);

  const repeats = Math.max(1, Math.ceil(MIN_ITEMS_PER_TRACK / items.length));
  const track = Array.from({ length: repeats }, () => items).flat();

  return (
    <div
      className="marq overflow-hidden whitespace-nowrap bg-text py-2 font-display text-[15px] tracking-[0.02em] text-bg/90"
      aria-label="Avisos"
      role="region"
    >
      <div className="marq-track">
        {track.map((t, i) => (
          <span key={i} className="marq-item">{t}</span>
        ))}
      </div>
      <div className="marq-track" aria-hidden="true">
        {track.map((t, i) => (
          <span key={i} className="marq-item">{t}</span>
        ))}
      </div>
    </div>
  );
}
