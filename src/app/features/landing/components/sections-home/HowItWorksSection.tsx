import SectionHead from '../shared/SectionHead';

const STEPS = [
  { n: '01', h: 'Descubre', t: 'Empieza con 3 ml. Conoce el perfume antes de invertir en un frasco completo.' },
  { n: '02', h: 'Decide', t: 'Decide con calma cuÃ¡l es tu fragancia, probando las que quieras.' },
  { n: '03', h: 'Disfruta', t: 'RecÃ­belo en decant o en frasco sellado, como prefieras.' },
];

/**
 * "Cómo funciona" — tres pasos (prototipo .how / .steps3): fondo tile, números
 * Gloock en dorado oscuro y tarjetas con borde fino.
 *
 * Sin el rótulo "— Cómo funciona" (REQ-007): el título arranca la sección.
 */
export default function HowItWorksSection() {
  return (
    <section className="bg-bg-alt py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <SectionHead eyebrow="Cómo funciona" title="Tres pasos hacia tu fragancia." className="md:mb-9" />

        <ol className="grid gap-3 min-[821px]:grid-cols-3 min-[821px]:gap-[18px]">
          {STEPS.map((s) => (
            <li
              key={s.n}
              className="flex items-start gap-4 rounded-[4px] border border-border bg-surface p-5 min-[821px]:p-6"
            >
              <span className="font-display text-[34px] font-normal leading-[0.9] text-accent-hover">{s.n}</span>
              <div>
                <h3 className="font-display text-2xl font-normal leading-none text-text">{s.h}</h3>
                <p className="mt-2 font-body text-sm leading-relaxed text-text-soft">{s.t}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
