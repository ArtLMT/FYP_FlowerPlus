import Hero from "@/app/components/home/Hero";
import SaleSection from "@/app/components/home/SaleSection";
import OccasionsTabs from "@/app/components/home/OccasionsTabs";
import FeaturedCollections from "@/app/components/home/FeaturedCollections";
import ProductsGrid from "@/app/components/home/ProductsGrid";
import CustomOrderBanner from "@/app/components/home/CustomOrderBanner";
import TrustStrip from "@/app/components/home/TrustStrip";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <SaleSection />
      <OccasionsTabs />
      <FeaturedCollections />
      <ProductsGrid />
      <CustomOrderBanner />
      <TrustStrip />
    </main>
  );
}
