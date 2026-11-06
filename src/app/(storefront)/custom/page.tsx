import Container from "@/components/ui/Container";
import CustomBuilder from "@/features/custom-order/CustomBuilder";

/** Custom order builder "Thiết kế bó hoa" — /custom. The form lives in `features/custom-order/CustomBuilder.tsx`. */
export default function CustomOrderPage() {
  return (
    <main className="pt-6 md:pt-10 pb-section bg-neutral-surface min-h-dvh">
      <Container>
        <h1 className="font-serif font-medium text-heading-lg md:text-[36px] leading-[1.2] text-text-primary m-0">
          Thiết kế bó hoa
        </h1>
        <p className="font-sans text-body text-text-secondary mt-1 m-0">
          Chọn kiểu cắm, hoa và trang trí bạn thích. Bạn thấy giá tạm tính ngay trước khi gửi cho cửa hàng.
        </p>
        <CustomBuilder />
      </Container>
    </main>
  );
}
