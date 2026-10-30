import PhosphorIcon, { type PhosphorIconName } from '@/assets/svg/PhosphorIcon';

/** Momentos con ícono Phosphor sólido (fill). */
const FILL: Record<string, PhosphorIconName> = {
  oficina: 'briefcase',
  noche: 'moonStars',
  cita: 'wine',
  verano: 'sun',
};

/** Sin equivalente en el mapa Phosphor: formas rellenas propias. */
const CUSTOM: Record<string, string> = {
  invierno: 'M12 2v20M4 7l16 10M20 7L4 17M9 3.5l3 2.5 3-2.5M9 20.5l3-2.5 3 2.5',
  fiesta: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z',
};

export default function MomentIcon({ name, size = 16 }: { name: string; size?: number }) {
  const fill = FILL[name];
  if (fill) return <PhosphorIcon name={fill} size={size} className="shrink-0" />;
  const d = CUSTOM[name] ?? CUSTOM.fiesta;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth={name === 'invierno' ? 2.2 : 1}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden
    >
      <path d={d} />
    </svg>
  );
}
