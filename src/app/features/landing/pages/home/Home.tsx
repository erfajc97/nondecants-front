import AppProviders from '@/app/providers/AppProviders';
import { useHomeHook } from '../../hooks/useHomeHook';
import ProductCarouselSection from '../../components/sections-home/ProductCarouselSection';
import BlogCarousel from '@/app/features/blog/components/BlogCarousel';
import ExploreCategoriesSection from '../../components/sections-home/ExploreCategoriesSection';
import VerifiedReviewsSection from '../../components/sections-home/VerifiedReviewsSection';
import FeaturedHouseSection from '../../components/sections-home/FeaturedHouseSection';
import DecantExplainerSection from '../../components/sections-home/DecantExplainerSection';
import CombosSection from '../../components/sections-home/CombosSection';
import MomentsSection from '../../components/sections-home/MomentsSection';
import PromiseBand from '../../components/sections-home/PromiseBand';

function HomeContent() {
  const { sections, sectionsLoading } = useHomeHook();

  // Mientras cargan las secciones se pintan los esqueletos con la forma final
  // del home, para que nada salte al llegar la data.
  if (sectionsLoading) {
    return (
      <div className="bg-bg">
        <ProductCarouselSection title="" products={[]} isLoading />
        <DecantExplainerSection />
        <ProductCarouselSection title="" products={[]} isLoading />
        <ExploreCategoriesSection />
        <BlogCarousel />
      </div>
    );
  }

  // Orden fijo por posición: 1ª sección → "Recién llegados" · 2ª → "Lo que más
  // se pide" · resto → carruseles al final. Los títulos vienen del admin.
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const [first, second, ...rest] = sorted;

  return (
    <div className="bg-bg">
      <FeaturedHouseSection />

      {first && (
        <ProductCarouselSection
          key={first.id}
          title={first.title}
          products={first.products}
          eyebrow="Recién llegados"
        />
      )}

      {second && (
        <ProductCarouselSection
          key={second.id}
          title={second.title}
          products={second.products}
          eyebrow="Lo que más se pide"
        />
      )}

      <DecantExplainerSection />
      <CombosSection />
      <MomentsSection />
      <PromiseBand />

      <ExploreCategoriesSection />

      {/* El blog cierra después de los productos: cuenta la casa cuando el
          visitante ya vio lo que se vende. Las valoraciones van justo después. */}
      <BlogCarousel />
      <VerifiedReviewsSection />

      {rest.map((section, index) => (
        <ProductCarouselSection
          key={section.id}
          title={section.title}
          products={section.products}
          showCTA={index === rest.length - 1}
        />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <AppProviders>
      <HomeContent />
    </AppProviders>
  );
}
