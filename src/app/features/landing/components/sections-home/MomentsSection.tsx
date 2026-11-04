import PhosphorIcon from '@/assets/svg/PhosphorIcon';
import SectionHead from '../shared/SectionHead';
import Reveal from '../shared/Reveal';
import { momentCta, momentIcon, useMoments } from '@/app/lib/homeContent';

/**
 * "Empieza por el momento" (prototipo .moments): cinco atajos con ícono. Al
 * pasar el mouse sube un fondo dorado claro desde abajo y el ícono se ladea.
 * "Día/Noche" se traduce al filtro de horario del catálogo.
 */
export default function MomentsSection() {
  const MOMENTS = useMoments().map((m) => ({ ...m, iconName: momentIcon(m.icon), cta: momentCta(m.href) }));
  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead eyebrow="¿No sabes cuál elegir?" title="Empieza por el momento" />
          <div className="grid grid-cols-2 gap-3 min-[821px]:grid-cols-3 min-[1181px]:grid-cols-5">
            {MOMENTS.map((m, i) => (
              <a
                key={m.title}
                href={m.href}
                className="group relative isolate grid content-start gap-1.5 overflow-hidden rounded-[4px] border border-border p-[18px] text-left transition-[border-color,transform] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] before:absolute before:inset-0 before:-z-10 before:translate-y-[101%] before:bg-gold-light before:transition-transform before:duration-500 before:ease-[cubic-bezier(0.22,1,0.36,1)] before:content-[''] hover:-translate-y-1 hover:border-text hover:before:translate-y-0 active:scale-[0.97] motion-reduce:transition-none"
              >
                <PhosphorIcon
                  name={m.iconName}
                  className={`nd-mi nd-mi-${m.iconName} h-[34px] w-[34px] text-text`}
                  style={{ '--nd-mi-d': `${i * 120}ms` } as React.CSSProperties}
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
