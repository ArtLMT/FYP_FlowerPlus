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

export default function TrustStrip() {
  return (
    <section className="py-[36px] px-[24px] bg-neutral-canvas" aria-label="Vì sao chọn FlowerPlus">
      <div className="flex flex-col gap-[22px]">
        {TRUST_ITEMS.map(({ icon, title, body }) => (
          <div key={title} className="flex gap-[15px] items-start">
            <span className="material-symbols-outlined text-primary flex-shrink-0 mt-[1px]" aria-hidden="true">
              {icon}
            </span>
            <div>
              <h4 className="font-sans font-bold text-[12px] tracking-[0.1em] text-text-primary mb-[5px] m-0">
                {title}
              </h4>
              <p className="font-sans text-body leading-[1.5] text-text-secondary m-0">{body}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="font-sans text-body-sm text-text-muted text-center leading-[1.5] mt-8 m-0">
        Hỗ trợ thanh toán khi nhận hàng tại một số khu vực nội thành.
      </p>
    </section>
  );
}
