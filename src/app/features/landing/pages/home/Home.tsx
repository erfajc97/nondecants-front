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
import FaqSection from '../../components/sections-home/FaqSection';

/** "Antetítulo · Título" → { eyebrow, title }; sin separador usa el antetítulo por defecto. */
function splitSectionTitle(raw: string, fallbackEyebrow: string) {
  const [head, ...tail] = raw.split(/\s+[·•]\s+/);
  return tail.length > 0
    ? { eyebrow: head.trim(), title: tail.join(' · ').trim() }
    : { eyebrow: fallbackEyebrow, title: raw.trim() };
}

function HomeContent() {
  const { sections, sectionsLoading } = useHomeHook();

  // Mientras cargan las secciones se pintan los esqueletos con la forma final
  // del home, para que nada salte al llegar la data.
  if (sectionsLoading) {
    return (
      <div className="bg-bg">
        <ProductCarouselSection title="" products={[]} isLoading />
        <ProductCarouselSection title="" products={[]} isLoading />
        <DecantExplainerSection />
        <ExploreCategoriesSection />
        <BlogCarousel />
      </div>
    );
  }

  // Posición fija: 1ª sección → "Recién llegados · Novedades", 2ª → "Lo que más
  // se pide · Tienes que probarlos", el resto → carruseles por casa/mundo que
  // van después de los banners Nicho/Árabes. Los títulos vienen del admin con
  // el formato "Antetítulo · Título".
  const sorted = [...sections].sort((a, b) => a.order - b.order);
  const [first, second, ...rest] = sorted;

  const renderSection = (section: (typeof sorted)[number], fallbackEyebrow: string) => {
    const { eyebrow, title } = splitSectionTitle(section.title, fallbackEyebrow);
    return (
      <ProductCarouselSection
        key={section.id}
        title={title}
        eyebrow={eyebrow}
        products={section.products}
      />
    );
  };

  return (
    <div className="bg-bg">
      <FeaturedHouseSection />

      {first && renderSection(first, 'Recién llegados')}
      {second && renderSection(second, 'Lo que más se pide')}

      <DecantExplainerSection />
      <CombosSection />
      <MomentsSection />
      <PromiseBand />

      <ExploreCategoriesSection />

      {rest.map((section) => renderSection(section, 'Selección de la casa'))}

      <VerifiedReviewsSection />

      {/* El blog no está en el prototipo; se mantiene entre reseñas y preguntas. */}
      <BlogCarousel />

      <FaqSection />
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
