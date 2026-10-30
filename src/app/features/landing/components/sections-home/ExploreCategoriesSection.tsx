import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useRawCategoriesQuery, type NavCategory } from '@/app/tanstack-queries/categoriesQuery';
import { useProductsQuery } from '@/app/tanstack-queries/productsQuery';
import { useReveal } from '@/app/components/Reveal';
import './home.css';

/** Foto de respaldo (collage del home) con el encuadre de cada casa. */
const FALLBACK_PHOTO = '/home.webp';
const FOCUS: Record<HouseKind, string> = { nicho: '44% 62%', arabes: '66% 62%' };

type HouseKind = 'nicho' | 'arabes';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function findHouse(categories: NavCategory[], kind: HouseKind): NavCategory | undefined {
  return categories.find((c) => (kind === 'nicho' ? /nicho|niche/ : /arab/).test(norm(c.name)));
}

/** Número que cuenta de 0 a `to` cuando `run` pasa a true. */
function useCountUp(to: number, run: boolean, ms = 1100) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!run) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run, ms]);
  return run ? value : 0;
}

function HouseBanner({ kind, category }: { kind: HouseKind; category: NavCategory }) {
  const [rootRef, shown] = useReveal<HTMLAnchorElement>('0px 0px -18% 0px');
  const tiltRef = useRef<HTMLDivElement>(null);
  const houses = category.marcas.length;
  const count = useCountUp(houses, shown);

  const { data } = useProductsQuery({
    queryParams: { categoryId: Number(category.id), limit: 3, sortBy: 'salesCount', sortOrder: 'DESC' },
  });
  const bottles = (data?.content ?? []).filter((p) => p.image).slice(0, 3);

  // Inclinación siguiendo el mouse: solo con puntero fino (escritorio).
  const onMove = (e: MouseEvent<HTMLAnchorElement>) => {
    const tilt = tiltRef.current;
    if (!tilt || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tilt.style.transform = `perspective(900px) rotateY(${(x * 5).toFixed(2)}deg) rotateX(${(-y * 4).toFixed(2)}deg)`;
  };
  const onLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = '';
  };

  const photo = category.imageUrl;
  const heading = kind === 'nicho' ? 'Perfumes nicho' : 'Perfumes árabes';

  return (
    <a
      ref={rootRef}
      href={`/catalogo/perfumes?category=${category.id}`}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`nd-house group block ${shown ? 'in' : ''}`}
    >
      <div ref={tiltRef} className="nd-house-tilt relative aspect-[16/10] overflow-hidden rounded-[4px] bg-text">
        <div className="nd-house-photo absolute inset-0">
          {photo ? (
            <img src={photo} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            <div
              className="h-full w-full bg-cover bg-no-repeat transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
              style={{ backgroundImage: `url(${FALLBACK_PHOTO})`, backgroundSize: '230% auto', backgroundPosition: FOCUS[kind] }}
              role="img"
              aria-label={heading}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-text/85 via-text/35 to-text/10" />
        </div>

        <div className="absolute inset-x-0 bottom-0 p-5 min-[821px]:p-7">
          <p className="k font-body text-[13px] font-semibold tabular-nums text-[#F1E6C8]">
            {count} casas
          </p>
          <div className="mt-1.5 w-fit">
            <h3 className="font-display text-[clamp(28px,3vw,44px)] font-normal leading-none text-bg">{heading}</h3>
            <span className="nd-house-line mt-3 block h-0.5 w-full bg-accent" aria-hidden="true" />
          </div>
          <span className="mt-3.5 inline-flex items-center gap-2 font-body text-[13.5px] font-semibold text-bg">
            Explorar
            <span className="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1" aria-hidden="true">→</span>
          </span>
        </div>

        {bottles.length > 0 && (
          <div className="absolute right-3 top-3 flex -space-x-2 min-[821px]:bottom-5 min-[821px]:right-5 min-[821px]:top-auto min-[821px]:-space-x-3">
            {bottles.map((p) => (
              <span
                key={p.id}
                className="grid h-[42px] w-[42px] place-items-center overflow-hidden rounded-full border-2 border-bg bg-white min-[821px]:h-[58px] min-[821px]:w-[58px]"
              >
                <img src={p.image} alt="" loading="lazy" className="h-full w-full object-contain p-1" />
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

/** Banners "Perfumes nicho · N casas" y "Perfumes árabes · N casas" (reemplazan "Explora por categoría"). */
export default function ExploreCategoriesSection() {
  const { data: categories = [], isLoading } = useRawCategoriesQuery();
  const nicho = findHouse(categories, 'nicho');
  const arabes = findHouse(categories, 'arabes');

  if (isLoading) {
    return (
      <section className="bg-bg py-[clamp(44px,5.5vw,76px)]" aria-hidden="true">
        <div className="mx-auto grid max-w-[1480px] gap-[18px] px-[max(16px,3.4vw)] min-[821px]:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="aspect-[16/10] animate-pulse rounded-[4px] bg-bg-alt" />
          ))}
        </div>
      </section>
    );
  }

  if (!nicho && !arabes) return null;

  return (
    <section className="sec bg-bg py-[clamp(44px,5.5vw,76px)]">
      <div className="mx-auto grid max-w-[1480px] gap-[18px] px-[max(16px,3.4vw)] min-[821px]:grid-cols-2">
        {nicho && <HouseBanner kind="nicho" category={nicho} />}
        {arabes && <HouseBanner kind="arabes" category={arabes} />}
      </div>
    </section>
  );
}
