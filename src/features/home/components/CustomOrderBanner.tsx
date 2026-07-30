/**
 * CustomOrderBanner.
 * Mobile: full-bleed surface strip (no side padding, square corners).
 * Desktop: the same surface becomes an inset, rounded card inside the 1240px
 *          container (md:px-10 adds the gutter, md:rounded-3xl rounds it).
 *
 * Note: this hand-rolls its width wrapper instead of <Container>, because it
 * needs NO padding on mobile — and overriding Container's px-5 with px-0 is the
 * kind of Tailwind class conflict that's unreliable. Clearer to be explicit.
 */
export default function CustomOrderBanner() {
  return (
    <section className="mt-8 md:mt-16">
      <div className="mx-auto w-full max-w-[1240px] md:px-10">
        <div className="bg-neutral-raised text-center px-7 py-[44px] md:rounded-3xl md:px-10 md:py-[72px]">
          <h2 className="font-serif font-medium text-[30px] md:text-[44px] leading-[1.2] md:leading-[1.15] text-text-primary mb-3 md:mb-4 m-0">
            Chưa tìm được mẫu ưng ý?
          </h2>
          <p className="font-sans text-body md:text-[17px] text-text-secondary mb-[26px] md:mb-8 md:max-w-[460px] md:mx-auto m-0">
            Tự thiết kế — chúng tôi sẽ làm theo yêu cầu của bạn.
          </p>
          <button className="bg-primary hover:bg-primary-hover text-white border-none rounded-lg md:rounded-[10px] py-[15px] px-[30px] md:px-[34px] font-sans font-bold text-label md:text-body-sm tracking-button cursor-pointer transition-colors">
            ĐẶT THIẾT KẾ RIÊNG
          </button>
        </div>
      </div>
    </section>
  );
}
