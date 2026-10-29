import Reveal from '../shared/Reveal';

/* Copy del prototipo de marca. Los "desde $X" son orientativos: el precio real
   de cada formato se ve en cada ficha. */
const SIZES = [
  { v: '3', unit: 'ml', title: 'Para conocerlo', text: 'Unas 35 pulverizaciones, más de una semana', from: 'desde $4,15' },
  { v: '5', unit: 'ml', title: 'Para confirmarlo', text: 'Unas 60 pulverizaciones, unas 3 semanas', from: 'desde $5,90' },
  { v: '10', unit: 'ml', title: 'Para llevarlo contigo', text: 'Unas 120 pulverizaciones, más de un mes', from: 'desde $10,15' },
  { v: 'Frasco', unit: '', title: 'Cuando ya lo sabes', text: 'Sellado y original, o bajo pedido en 13 a 17 días', from: 'desde $59,99' },
];

const STEPS = [
  'Elige el perfume y el tamaño',
  'Paga con transferencia o tarjeta',
  'Recíbelo en 24–72 h en todo Ecuador',
];

/**
 * "¿Qué es un decant y cuánto te dura?" (prototipo .how): foto 4/3 a la
 * izquierda; a la derecha eyebrow, título, párrafo, cuatro tamaños y 3 pasos.
 */
export default function DecantExplainerSection() {
  return (
    <section className="bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal className="grid grid-cols-1 items-center gap-[clamp(24px,4vw,64px)] min-[821px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="aspect-[4/3] max-w-full overflow-hidden rounded-[4px]">
            <img
              src="/images/home/decants.webp"
              alt="Decants de 3, 5 y 10 ml con la etiqueta de la casa"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <span className="eyebrow k">Primera vez aquí</span>
            <h2 className="mt-2 font-display text-[clamp(32px,3.4vw,50px)] font-normal leading-none tracking-[-0.02em] text-balance">
              ¿Qué es un decant y cuánto te dura?
            </h2>
            <p className="mt-3 max-w-[52ch] font-body text-base text-text-muted">
              Un decant es una parte del perfume original, pasada de su frasco sellado a un atomizador pequeño con
              nuestra etiqueta. Sirve para probar un perfume varios días antes de comprar el frasco completo.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2.5 min-[1181px]:grid-cols-4">
              {SIZES.map((s) => (
                <div key={s.title} className="grid content-start gap-1 rounded-[4px] border border-border px-3.5 py-4">
                  <span className="font-display text-[34px] leading-none tabular-nums">
                    {s.v}
                    {s.unit && <small className="ml-0.5 font-body text-sm">{s.unit}</small>}
                  </span>
                  <b className="font-body text-[13.5px] font-semibold">{s.title}</b>
                  <span className="font-body text-[13px] leading-[1.35] text-text-muted">{s.text}</span>
                  <em className="mt-1 font-body text-[13px] font-semibold not-italic text-accent-hover">{s.from}</em>
                </div>
              ))}
            </div>

            <ol className="mt-3 grid grid-cols-1 gap-2.5 min-[821px]:grid-cols-3">
              {STEPS.map((t, i) => (
                <li key={t} className="flex items-start gap-3 font-body text-sm text-text-soft">
                  <b className="font-display text-[28px] font-normal leading-[0.9] text-accent-hover">{i + 1}</b>
                  {t}
                </li>
              ))}
            </ol>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
