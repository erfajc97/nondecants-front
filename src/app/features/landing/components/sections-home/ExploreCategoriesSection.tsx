import { useExploreCategories } from '../../hooks/useExploreCategories';
import SectionHead, { PillLink } from '../shared/SectionHead';
import type { ExploreCategoryCard } from '../../types';

function DesktopCard({ card }: { card: ExploreCategoryCard }) {
  return (
    <a
      href={card.href}
      className="group relative flex min-h-[300px] flex-col justify-end overflow-hidden rounded-[4px] border border-border"
    >
      {card.imageUrl ? (
        <img
          src={card.imageUrl}
          alt=""
          className="absolute inset-0 h-full w-full scale-110 object-cover blur-md transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-125"
        />
      ) : (
        <div className="absolute inset-0 bg-text" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-text via-text/70 to-text/25" />
      <div className="relative px-6 py-6">
        <p className="k font-body text-[13px] font-semibold text-bg/90">
          {card.marcaCount} {card.marcaCount === 1 ? 'marca' : 'marcas'}
        </p>
        <h3 className="mt-2 font-display text-[clamp(28px,2.8vw,42px)] font-normal leading-none text-bg">
          {card.heading}
        </h3>
        {card.brandLineDesktop && (
          <p className="mt-3 font-body text-[13px] leading-relaxed text-bg/80">
            {card.brandLineDesktop}
          </p>
        )}
      </div>
    </a>
  );
}

function MobileCard({ card }: { card: ExploreCategoryCard }) {
  return (
    <a href={card.href} className="block rounded-[4px] border border-border bg-surface px-5 py-5 transition-colors hover:border-text">
      <p className="k font-body text-[13px] font-semibold text-accent-hover">
        {card.marcaCount} {card.marcaCount === 1 ? 'marca' : 'marcas'}
      </p>
      <h3 className="mt-2 font-display text-[28px] font-normal leading-none text-text">
        {card.heading}
      </h3>
      {card.brandLineMobile && (
        <p className="mt-2 font-body text-sm text-text-soft">{card.brandLineMobile}</p>
      )}
    </a>
  );
}

export default function ExploreCategoriesSection() {
  const { cards, isLoading, marcaCount } = useExploreCategories();

  if (isLoading) {
    return (
      <section className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)] pb-6 pt-8 md:py-16" aria-hidden="true">
        <div className="mb-6 h-8 w-64 animate-pulse bg-bg-alt md:mb-8" />
        <div className="hidden grid-cols-3 gap-[18px] md:grid">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="min-h-[300px] animate-pulse bg-bg-alt" />
          ))}
        </div>
        <div className="flex flex-col gap-3 md:hidden">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse border border-border bg-bg-alt" />
          ))}
        </div>
      </section>
    );
  }

  if (cards.length === 0) return null;

  return (
    <section className="bg-bg py-[clamp(44px,5.5vw,76px)]">
     <div className="mx-auto max-w-[1480px] px-[max(16px,3.4vw)]">
      <SectionHead
        eyebrow="Casas y marcas"
        title="Explora por categoría"
        right={
          <span className="max-md:hidden">
            <PillLink href="/catalogo/perfumes">
              {marcaCount > 0 ? `Ver las ${marcaCount} marcas` : 'Ver catálogo'}
            </PillLink>
          </span>
        }
      />

      <div className="hidden grid-cols-3 gap-[18px] md:grid">
        {cards.map((card) => (
          <DesktopCard key={card.id} card={card} />
        ))}
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {cards.map((card) => (
          <MobileCard key={card.id} card={card} />
        ))}
      </div>
     </div>
    </section>
  );
}
