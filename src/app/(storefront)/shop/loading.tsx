import Container from "@/components/ui/Container";
import { ProductCardSkeleton, Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

/** Shown at once while /shop loads its products on the server: the real heading, then a placeholder grid. */
export default function ShopLoading() {
  return (
    <main className="pt-6 md:pt-10 pb-section bg-neutral-canvas min-h-dvh">
      <Container>
        <h1 className="font-serif font-medium text-heading-lg md:text-[36px] leading-[1.2] text-text-primary m-0">
          Bộ sưu tập
        </h1>
        <p className="font-sans text-body text-text-muted mt-1 mb-5 md:mb-6">
          Khám phá toàn bộ các mẫu hoa của chúng tôi.
        </p>
        <SkeletonGroup label="Đang tải sản phẩm..." className="md:grid md:grid-cols-[240px_1fr] md:gap-8 md:items-start">
          <div className="hidden space-y-3 md:block">
            {[0, 1, 2, 3, 4].map((index) => <Skeleton key={index} className="h-5 w-3/4" />)}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[14px] md:gap-[22px]">
            {[0, 1, 2, 3, 4, 5].map((index) => <ProductCardSkeleton key={index} />)}
          </div>
        </SkeletonGroup>
      </Container>
    </main>
  );
}
