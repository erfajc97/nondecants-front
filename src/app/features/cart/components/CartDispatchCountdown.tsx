import { useEffect, useState } from 'react';
import '../cart.css';

/** Segundos transcurridos del día en Ecuador (UTC-5, sin horario de verano). */
function ecuadorSecondsOfDay(now: number) {
  const s = (now / 1000 - 5 * 3600) % 86400;
  return s < 0 ? s + 86400 : s;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Cuenta regresiva sobre "Ir a pagar" (prototipo): punto verde que late y
 * "Sale hoy si pides en 03:15:42"; pasada la hora de corte, "Sale mañana…".
 */
export default function CartDispatchCountdown({ cutoffHour }: { cutoffHour: number }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  // Antes de montar (SSR/hidratación) se reserva el alto para que nada salte.
  if (now == null) return <div className="h-[26px]" aria-hidden="true" />;

  const sec = ecuadorSecondsOfDay(now);
  const late = sec / 3600 >= cutoffHour;
  const left = Math.max(0, (late ? 24 + cutoffHour : cutoffHour) * 3600 - sec);
  const hh = Math.floor(left / 3600);
  const mm = Math.floor((left % 3600) / 60);
  const ss = Math.floor(left % 60);

  return (
    <div className="flex items-center justify-center gap-2.5 font-body text-[13.5px] text-text-muted" role="timer">
      <span className={`nd-pulse ${late ? 'nd-pulse--late' : ''}`} aria-hidden="true" />
      <span>{late ? 'Sale mañana si pides en' : 'Sale hoy si pides en'}</span>
      <strong className="font-display text-[19px] font-normal leading-none tracking-[0.02em] text-text tabular-nums">
        {pad2(hh)}
        <i className="nd-colon">:</i>
        {pad2(mm)}
        <i className="nd-colon">:</i>
        {pad2(ss)}
      </strong>
    </div>
  );
}
