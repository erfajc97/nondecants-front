import AppProviders from '@/app/providers/AppProviders';
import { useHomeHook } from './hooks/useHomeHook';
import HeroSection from './components/hero/HeroSection';
import BannerCarousel from './components/BannerCarousel';
import FeaturedProductsSection from './components/sections/FeaturedProductsSection';
import NewArrivalsSection from './components/sections/NewArrivalsSection';
import NewsletterSection from './components/sections/NewsletterSection';

function HomeContent() {
  const { banners, bannersLoading, featuredProducts, featuredLoading, newArrivals, newArrivalsLoading } = useHomeHook();

  return (
    <div>
      {!bannersLoading && banners.length > 0 ? (
        <BannerCarousel banners={banners} />
      ) : (
        <HeroSection />
      )}
      <FeaturedProductsSection products={featuredProducts} isLoading={featuredLoading} />
      <NewArrivalsSection products={newArrivals} isLoading={newArrivalsLoading} />
      <NewsletterSection />
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
