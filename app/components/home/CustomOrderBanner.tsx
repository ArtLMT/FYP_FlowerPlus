export default function CustomOrderBanner() {
  return (
    <section className="bg-neutral-raised py-[44px] px-[28px] text-center">
      <h2 className="font-serif font-medium text-[30px] leading-[1.2] text-text-primary mb-3 m-0">
        Chưa tìm được mẫu ưng ý?
      </h2>
      <p className="font-sans text-body text-text-secondary mb-[26px] m-0">
        Tự thiết kế — chúng tôi sẽ làm theo yêu cầu của bạn.
      </p>
      <button className="bg-primary hover:bg-primary-hover text-white border-none rounded-lg py-[15px] px-[30px] font-sans font-bold text-label tracking-button cursor-pointer transition-colors">
        ĐẶT THIẾT KẾ RIÊNG
      </button>
    </section>
  );
}
