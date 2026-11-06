import { getProducts } from "@/lib/services/products";
import Link from "next/link";
import Container from "@/components/ui/Container";
import ShopBrowser from "@/features/catalog/components/ShopBrowser";
import { filtersFromParams } from "@/features/catalog/filters";
import CategoryStrip from "@/features/catalog/components/CategoryStrip";

/**
 * Browse / Shop — /shop
 *
 * Lives in the (storefront) group, so it inherits the Header / Footer /
 * BottomNav / ChatbotFAB chrome. Server Component: fetches products, reads the
 * initial filter state from the URL, and hands both to the interactive
 * ShopBrowser (which owns all filtering).
 *
 * The destination for the BottomNav "Khám phá", the Header "Bộ sưu tập", the
 * product-detail links, homepage category rows, and "XEM THÊM" links.
 */
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const products = await getProducts();
  const sp = await searchParams;
  const initial = filtersFromParams(sp);
  const query = typeof sp.q === "string" ? sp.q : "";

  return (
    <main className="pt-6 md:pt-10 pb-section bg-neutral-canvas min-h-dvh">
      <Container>
        {/* Page heading and subtitle. */}
        <h1 className="font-serif font-medium text-heading-lg md:text-[36px] leading-[1.2] text-text-primary m-0">
          Bộ sưu tập
        </h1>
        <p className="font-sans text-body text-text-muted mt-1 mb-5 md:mb-6">
          Khám phá toàn bộ các mẫu hoa của chúng tôi.
        </p>
        {/* Horizontal category chips. */}
        <CategoryStrip />
        {/* Filter panel, sort/result bar, and the product grid (see ShopBrowser.tsx). */}
        <ShopBrowser products={products} initial={initial} query={query} />
        {/* The way into the custom builder from the shop. */}
        <section className="mt-10 rounded-2xl bg-neutral-raised p-6 text-center">
          <p className="font-serif text-heading-md text-text-primary m-0">Chưa tìm được mẫu ưng ý?</p>
          <Link href="/custom" className="mt-4 inline-block rounded-lg bg-primary px-6 py-3 font-sans text-body-sm font-bold tracking-[0.05em] text-white hover:bg-primary-hover">TỰ THIẾT KẾ BÓ HOA</Link>
        </section>
      </Container>
    </main>
  );
}
