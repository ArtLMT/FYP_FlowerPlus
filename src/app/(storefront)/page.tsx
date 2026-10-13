import Hero from "@/features/home/components/Hero";
import QuickActions from "@/features/home/components/QuickActions";
import Container from "@/components/ui/Container";
import FeaturedCollections from "@/features/home/components/FeaturedCollections";
import CuratedSections from "@/features/home/components/CuratedSections";
import ProductsGrid from "@/features/home/components/ProductsGrid";
import CustomOrderBanner from "@/features/home/components/CustomOrderBanner";
import TrustStrip from "@/features/home/components/TrustStrip";

/**
 * Homepage — "/" (the (storefront) group folder adds no URL segment).
 * Chrome (Header/Footer/BottomNav/ChatbotFAB) comes from (storefront)/layout.tsx.
 *
 * QuickActions (the "sub navigation" shortcuts) is home-page content, NOT part
 * of the Header — so it lives here and appears on the home page only:
 *   • mobile  → grid row at the top, above the hero
 *   • desktop → row below the hero
 */
export default function HomePage() {
  return (
    <main>
      {/* Mobile quick-action row (desktop shows it below the hero instead) */}
      <Container className="md:hidden pt-3 pb-1">
        <QuickActions layout="grid" />
      </Container>

      <Hero />

      {/* Desktop quick-action row under the hero */}
      <Container className="hidden md:block mt-6">
        <QuickActions layout="row" />
      </Container>

      <FeaturedCollections />
      <CuratedSections />
      <ProductsGrid />
      <CustomOrderBanner />
      <TrustStrip />
    </main>
  );
}
