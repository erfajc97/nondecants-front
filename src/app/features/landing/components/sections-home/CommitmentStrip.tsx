import PhosphorIcon, { type PhosphorIconName } from '@/assets/svg/PhosphorIcon';

interface CommitmentStripProps {
  /** Total real de perfumes del catálogo (API). Sin dato se oculta el número. */
  catalogCount?: number | null;
}

/**
 * Banda negra de confianza del prototipo (.trust): cuatro pilares con cifra
 * Gloock en dorado, título y apoyo. 4 columnas en desktop, 2×2 hasta 1180 px.
 */
export default function CommitmentStrip({ catalogCount }: CommitmentStripProps) {
  const items: { icon: PhosphorIconName; big: string; title: string; text: string }[] = [
    { icon: 'sealCheck', big: '100%', title: 'Originales y sellados', text: 'De boutiques y distribuidores oficiales' },
    { icon: 'dropHalf', big: '3 · 5 · 10', title: 'ml en decant', text: 'Con la etiqueta de la casa' },
    { icon: 'truck', big: '24–72 h', title: 'Envío a todo Ecuador', text: 'Por Servientrega' },
    {
      icon: 'sprayBottle',
      big: catalogCount ? String(catalogCount) : '+100',
      title: 'Perfumes en catálogo',
      text: 'Diseñador, nicho y árabes',
    },
  ];

  return (
    <section aria-label="Nuestro compromiso" className="shrink-0 bg-text text-cream">
      <div className="mx-auto grid max-w-[1480px] grid-cols-2 px-[max(16px,3.4vw)] min-[1181px]:grid-cols-4">
        {items.map((it, i) => (
          <div
            key={it.title}
            className={`group grid grid-cols-[auto_minmax(0,1fr)] content-center items-center gap-x-3.5 gap-y-1 py-4 min-[821px]:py-6 ${
              i % 2 === 1 ? 'border-l border-ink-line pl-3.5 min-[821px]:pl-7' : ''
            } ${i === 2 ? 'min-[1181px]:border-l min-[1181px]:border-ink-line min-[1181px]:pl-7' : ''} ${
              i > 1 ? 'border-t border-ink-line min-[1181px]:border-t-0' : ''
            }`}
          >
            <PhosphorIcon
              name={it.icon}
              className="row-span-3 h-8 w-8 text-cream transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-[8deg] group-hover:scale-[1.08] min-[821px]:h-10 min-[821px]:w-10"
            />
            <span className="font-display text-[clamp(24px,2.4vw,34px)] leading-none tabular-nums text-accent">
              {it.big}
            </span>
            <b className="font-body text-[13px] font-semibold text-white min-[821px]:text-sm">{it.title}</b>
            <span className="font-body text-xs text-stone min-[821px]:text-[13px]">{it.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
