import AppProviders from '@/app/providers/AppProviders';
import { useHomeHook } from '../../hooks/useHomeHook';
import ProductCarouselSection from '../../components/sections-home/ProductCarouselSection';
import ProductRankingSection from '../../components/sections-home/ProductRankingSection';
import BlogCarousel from '@/app/features/blog/components/BlogCarousel';
import HowItWorksSection from '../../components/sections-home/HowItWorksSection';
import ExploreCategoriesSection from '../../components/sections-home/ExploreCategoriesSection';
import VerifiedReviewsSection from '../../components/sections-home/VerifiedReviewsSection';
import GoogleReviewsSection from '../../components/sections-home/GoogleReviewsSection';

function HomeContent() {
  const { sections, sectionsLoading } = useHomeHook();

  // Mientras cargan las secciones se pintan los esqueletos con la forma final
  // del home: 1 carrusel + carrusel del blog + pasos + ranking. Sin esto la
  // página quedaba en blanco y todo saltaba al llegar la data.
  if (sectionsLoading) {
    return (
      <div className="bg-bg">
        <ProductCarouselSection title="" products={[]} isLoading num="01" />
        <HowItWorksSection />
        <ProductRankingSection title="" products={[]} isLoading num="02" />
        <ExploreCategoriesSection />
        <BlogCarousel />
        <GoogleReviewsSection />
      </div>
    );
  }

  // Orden fijo de secciones por posición (no por order<=1):
  // 1ª sección → carrusel · carrusel del blog · 2ª sección → ranking · resto → carrusel
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const [first, second, ...rest] = sorted;

  return (
    <div className="bg-bg">
      {first && (
        <ProductCarouselSection
          key={first.id}
          title={first.title}
          products={first.products}
          isLoading={sectionsLoading}
          num="01"
        />
      )}

      {/* "Tres pasos hacia tu fragancia" va ANTES del ranking */}
      <HowItWorksSection />

      {second && (
        <ProductRankingSection
          key={second.id}
          title={second.title}
          products={second.products}
          isLoading={sectionsLoading}
          num="02"
        />
      )}

      <ExploreCategoriesSection />

      {/* El blog cierra después del ranking: cuenta la casa cuando el visitante
          ya vio los productos que se venden. Las valoraciones van justo después. */}
      <BlogCarousel />
      <VerifiedReviewsSection />
      <GoogleReviewsSection />

      {rest.map((section, index) => (
        <ProductCarouselSection
          key={section.id}
          title={section.title}
          products={section.products}
          isLoading={sectionsLoading}
          showCTA={index === rest.length - 1}
          num={String(index + 3).padStart(2, '0')}
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
