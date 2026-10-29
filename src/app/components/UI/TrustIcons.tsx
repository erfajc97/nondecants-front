import PhosphorIcon, { type PhosphorIconName } from '@/assets/svg/PhosphorIcon';

const ITEMS = [
  { icon: 'truck' as PhosphorIconName, label: 'Envíos por\nServientrega', motion: 'commit-icon commit-icon--drive' },
  { icon: 'sealCheck' as PhosphorIconName, label: 'Auténtico', motion: 'commit-icon commit-icon--seal' },
  { icon: 'lock' as PhosphorIconName, label: 'Pago seguro', motion: 'commit-icon commit-icon--lock' },
] as const;

interface TrustIconsProps {
  size?: number;
}

export default function TrustIcons({ size = 22 }: TrustIconsProps) {
  return (
    <ul className="grid grid-cols-3 gap-2 sm:gap-3" aria-label="Compra con confianza">
      {ITEMS.map(({ icon, label, motion }) => (
        <li key={label} className="flex min-w-0 flex-col items-center gap-1.5 px-0.5 text-center">
          <span className={`inline-flex h-7 w-7 items-center justify-center overflow-hidden text-text-soft ${motion}`}>
            <PhosphorIcon name={icon} size={size} />
          </span>
          <span className="max-w-full whitespace-pre-line font-body text-[9px] uppercase leading-snug tracking-[0.08em] text-text-muted sm:text-[10px] sm:tracking-[0.12em]">
            {label}
          </span>
        </li>
      ))}
    </ul>
  );
}
