import PhosphorIcon, { type PhosphorIconName } from '@/assets/svg/PhosphorIcon';
import SectionHead from '../shared/SectionHead';
import Reveal from '../shared/Reveal';

const MOMENTS: { icon: PhosphorIconName; title: string; text: string; href: string; cta: string }[] = [
  { icon: 'briefcase', title: 'Para la oficina', text: 'Frescos y limpios, que no incomodan en espacios cerrados.', href: '/catalogo/perfumes?momento=DIA', cta: 'Ver opciones →' },
  { icon: 'moonStars', title: 'Para la noche', text: 'Dulces y especiados, con más presencia y duración.', href: '/catalogo/perfumes?momento=NOCHE', cta: 'Ver opciones →' },
  { icon: 'wine', title: 'Para una cita', text: 'Los que dejan rastro y hacen que te pregunten cuál llevas.', href: '/catalogo/perfumes?momento=NOCHE', cta: 'Ver opciones →' },
  { icon: 'sun', title: 'Para el calor', text: 'Cítricos y marinos que aguantan la costa.', href: '/catalogo/perfumes?momento=DIA', cta: 'Ver opciones →' },
  { icon: 'gift', title: 'Para regalar', text: 'Combos de 3 o 4 decants, listos para sorprender.', href: '/catalogo/combos', cta: 'Ver combos →' },
];

/**
 * "Empieza por el momento" (prototipo .moments): cinco atajos con ícono. Al
 * pasar el mouse sube un fondo dorado claro desde abajo y el ícono se ladea.
 * "Día/Noche" se traduce al filtro de horario del catálogo.
 */
export default function MomentsSection() {
  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead eyebrow="¿No sabes cuál elegir?" title="Empieza por el momento" />
          <div className="grid grid-cols-2 gap-3 min-[821px]:grid-cols-3 min-[1181px]:grid-cols-5">
            {MOMENTS.map((m) => (
              <a
                key={m.title}
                href={m.href}
                className="group relative isolate grid content-start gap-1.5 overflow-hidden rounded-[4px] border border-border p-[18px] text-left transition-[border-color,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:bg-gold-light before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:content-[''] hover:-translate-y-1 hover:border-text hover:before:translate-y-0 active:scale-[0.97] motion-reduce:transition-none"
              >
                <PhosphorIcon
                  name={m.icon}
                  className="h-[34px] w-[34px] text-text transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-rotate-6 motion-reduce:transition-none"
                />
                <span className="font-display text-[21px] leading-[1.05] text-text-muted min-[821px]:text-2xl">{m.title}</span>
                <span className="font-body text-[13.5px] text-text-muted">{m.text}</span>
                <em className="font-body text-[13px] font-semibold not-italic tracking-normal text-accent-hover transition-[letter-spacing] duration-[350ms] group-hover:tracking-[0.04em]">
                  {m.cta}
                </em>
              </a>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
