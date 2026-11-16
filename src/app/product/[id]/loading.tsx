import Header from "@/components/layout/Header";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

/** Shown at once while a product loads on the server: the Header, then the gallery and info in their real places. */
export default function ProductLoading() {
  return (
    <div className="min-h-dvh bg-neutral-canvas">
      <Header />
      <SkeletonGroup label="Đang tải sản phẩm..." className="md:max-w-[1120px] md:mx-auto md:px-8 md:py-10">
        <div className="md:grid md:grid-cols-2 md:gap-12 md:items-start">
          <div>
            <Skeleton className="h-[320px] w-full rounded-none md:h-auto md:aspect-square md:rounded-2xl" />
            <div className="flex gap-3 px-[18px] pt-4 md:px-0">
              {[0, 1, 2].map((index) => <Skeleton key={index} className="h-[70px] w-[70px] rounded-[10px] md:h-20 md:w-20" />)}
            </div>
          </div>
          <div className="px-[18px] pb-8 pt-[18px] md:px-0 md:pt-0">
            <div className="mb-3 flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-10 w-4/5 md:h-12" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-6 h-8 w-40" />
            <Skeleton className="mt-6 h-12 w-full rounded-lg" />
          </div>
        </div>
      </SkeletonGroup>
    </div>
  );
}
