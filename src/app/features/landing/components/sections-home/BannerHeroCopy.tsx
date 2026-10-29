/**
 * Copy y CTAs del banner. En desktop van sobre el slide 1 (onDark);
 * en móvil, debajo de la foto. Tipografía y botones del prototipo de marca.
 */
export default function BannerHeroCopy({
  onDark = false,
  asHero = false,
}: {
  onDark?: boolean;
  asHero?: boolean;
}) {
  const TitleTag = asHero ? 'h1' : 'p';
  return (
    <div className="flex max-w-[34rem] flex-col items-start gap-3.5 md:gap-[18px]">
      <span className="eyebrow k">
        {onDark ? <span className="text-bg/90">Perfumería · Ecuador</span> : 'Perfumería · Ecuador'}
      </span>
      <TitleTag
        className={`font-display text-[clamp(36px,4.4vw,66px)] font-normal leading-[0.98] tracking-[-0.025em] text-balance ${
          onDark ? 'text-bg' : 'text-text'
        }`}
      >
        Perfumes originales y decants en Ecuador
      </TitleTag>
      <p
        className={`max-w-[40ch] font-body text-base leading-relaxed md:text-[17px] ${
          onDark ? 'text-bg/90' : 'text-text-soft'
        }`}
      >
        Prueba en decant de 3 ml{' '}
        <strong className={`font-semibold ${onDark ? 'text-bg' : 'text-text'}`}>
          desde $3,75
        </strong>{' '}
        antes de comprometerte con el frasco entero. Árabes, nicho y de diseñador.
      </p>
      <div className="mt-1 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <a
          href="/catalogo/perfumes"
          className={`group inline-flex h-[52px] items-center justify-center gap-2.5 whitespace-nowrap rounded-[3px] px-7 font-body text-[14.5px] font-semibold tracking-[0.01em] transition-[background-color,transform] duration-200 active:scale-[0.985] ${
            onDark ? 'bg-accent text-text hover:bg-accent/85' : 'bg-text text-bg hover:bg-text-soft'
          }`}
        >
          Ver el catálogo
          <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
        </a>
        <a
          href="/decants"
          className={`inline-flex h-10 items-center justify-center whitespace-nowrap rounded-full border px-[18px] font-body text-[13px] font-semibold transition-colors ${
            onDark
              ? 'border-bg/70 text-bg hover:bg-bg hover:text-text'
              : 'border-text text-text hover:bg-text hover:text-bg'
          }`}
        >
          Cómo funcionan los decants
        </a>
      </div>
    </div>
  );
}
