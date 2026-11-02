import Container from "@/components/ui/Container";

const TRUST_ITEMS = [
  {
    icon: "eco",
    title: "NGUYÊN LIỆU TƯƠI MỖI NGÀY",
    body: "Tuyển chọn từ các nông trại địa phương bền vững.",
  },
  {
    icon: "lock",
    title: "THANH TOÁN AN TOÀN",
    body: "Giao dịch được mã hóa, an tâm tuyệt đối.",
  },
  {
    icon: "local_shipping",
    title: "THEO DÕI ĐƠN HÀNG",
    body: "Theo dõi đơn hoa từ cửa hàng đến tận tay bạn.",
  },
] as const;

/**
 * TrustStrip — brand trust signals.
 * Mobile: the three items stack vertically.
 * Desktop: they sit in a 3-column grid (md:grid-cols-3). Same markup, reflowed.
 */
export default function TrustStrip() {
  return (
    <section className="py-9 md:py-16 bg-neutral-canvas" aria-label="Vì sao chọn FlowerPlus">
      <Container>
        {/* Trust items: icon, title, and short description. */}
        <div className="flex flex-col gap-[22px] md:grid md:grid-cols-3 md:gap-8">
          {TRUST_ITEMS.map(({ icon, title, body }) => (
            <div key={title} className="flex gap-[15px] items-start">
              <span className="material-symbols-outlined text-primary flex-shrink-0 mt-[1px]" aria-hidden="true">
                {icon}
              </span>
              <div>
                <h4 className="font-sans font-bold text-[12px] md:text-[13px] tracking-[0.1em] text-text-primary mb-[5px] md:mb-[6px] m-0">
                  {title}
                </h4>
                <p className="font-sans text-body md:text-[14px] leading-[1.5] text-text-secondary m-0">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* COD note — mobile only (the desktop mockup omits it here) */}
        <p className="md:hidden font-sans text-body-sm text-text-muted text-center leading-[1.5] mt-8 m-0">
          Hỗ trợ thanh toán khi nhận hàng tại một số khu vực nội thành.
        </p>
      </Container>
    </section>
  );
}
