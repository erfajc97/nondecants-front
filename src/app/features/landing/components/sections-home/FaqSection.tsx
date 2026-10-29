import { useState } from 'react';
import SectionHead from '../shared/SectionHead';
import Reveal from '@/app/components/Reveal';
import { HOME_FAQ, type FaqItem } from '../../data/faqItems';

function FaqRow({ item, id }: { item: FaqItem; id: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          id={`${id}-btn`}
          className="flex w-full items-center justify-between gap-4 py-[18px] text-left font-body text-[16px] font-semibold leading-snug text-text"
        >
          {item.question}
          <span
            className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border text-[18px] font-normal leading-none transition-[transform,background-color,border-color] duration-300 ${
              open ? 'rotate-45 border-text bg-text text-bg' : ''
            }`}
            aria-hidden="true"
          >
            +
          </span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-btn`}
        className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <p className="max-w-[60ch] pb-5 font-body text-[15px] leading-relaxed text-text-muted">{item.answer}</p>
        </div>
      </div>
    </div>
  );
}

/** "Lo que más nos preguntan": acordeón de 2 columnas en escritorio y 1 en móvil. */
export default function FaqSection() {
  // Dos pilas independientes: al abrir una respuesta no se estira la otra columna.
  const left = HOME_FAQ.filter((_, i) => i % 2 === 0);
  const right = HOME_FAQ.filter((_, i) => i % 2 === 1);

  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]" aria-labelledby="home-faq-title">
      <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
        <Reveal>
          <SectionHead eyebrow="Preguntas frecuentes" title={<span id="home-faq-title">Lo que más nos preguntan</span>} />
          {/* Móvil: una columna en el orden original. */}
          <div className="border-t border-border min-[821px]:hidden">
            {HOME_FAQ.map((item, i) => (
              <FaqRow key={item.question} item={item} id={`faq-m${i}`} />
            ))}
          </div>
          {/* Escritorio: dos pilas independientes (abrir una no estira la otra). */}
          <div className="hidden gap-x-12 min-[821px]:grid min-[821px]:grid-cols-2">
            <div className="border-t border-border">
              {left.map((item, i) => (
                <FaqRow key={item.question} item={item} id={`faq-l${i}`} />
              ))}
            </div>
            <div className="border-t border-border">
              {right.map((item, i) => (
                <FaqRow key={item.question} item={item} id={`faq-r${i}`} />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
