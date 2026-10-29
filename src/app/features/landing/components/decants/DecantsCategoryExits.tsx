import AppProviders from '@/app/providers/AppProviders';
import { useExploreCategories } from '../../hooks/useExploreCategories';

function DecantsCategoryExitsContent() {
  const { cards, isLoading } = useExploreCategories();

  if (isLoading || cards.length === 0) return null;

  return (
    <section className="border-t border-border bg-bg-alt px-[max(16px,3.4vw)] py-10 md:py-12">
      <h2 className="font-display text-[clamp(28px,3.2vw,46px)] font-normal leading-none tracking-[-0.02em] text-text">
        Empieza por aquí
      </h2>
      <div className="mt-5 grid grid-cols-1 overflow-hidden rounded-[4px] border border-border md:grid-cols-3">
        {cards.map((card, index) => (
          <a
            key={card.id}
            href={card.href}
            className={`bg-surface px-6 py-6 transition-colors hover:bg-gold-light ${index > 0 ? 'border-t border-border md:border-l md:border-t-0' : ''}`}
          >
            <h3 className="font-display text-2xl font-normal leading-none text-text">{card.heading}</h3>
            {card.brandLineMobile && (
              <p className="mt-2 font-body text-[13px] text-text-soft">{card.brandLineMobile}</p>
            )}
            <span className="mt-3 inline-block font-body text-[13px] font-semibold text-accent-hover">
              Ver catálogo →
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function DecantsCategoryExits() {
  return (
    <AppProviders withToaster={false}>
      <DecantsCategoryExitsContent />
    </AppProviders>
  );
}
