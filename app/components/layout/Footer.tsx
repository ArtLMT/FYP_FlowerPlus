export default function Footer() {
  return (
    <footer className="bg-neutral-raised pt-[34px] pb-[30px] px-[24px]">
      {/* Wordmark */}
      <p className="font-serif text-[28px] italic text-primary tracking-heading mb-4 m-0">
        FlowerPlus
      </p>

      {/* Address */}
      <address className="not-italic font-sans text-body leading-[1.7] text-text-secondary mb-[22px]">
        12 Đường Hoa Sữa, Phường Bến Nghé<br />
        Quận 1, TP. Hồ Chí Minh<br />
        T2–T7: 09:00 – 19:00
      </address>

      {/* Newsletter */}
      <p className="font-sans font-bold text-label tracking-badge text-text-muted mb-3 m-0">
        ĐĂNG KÝ NHẬN TIN
      </p>
      <div className="flex items-center gap-[10px] bg-neutral-canvas border border-neutral-border rounded-full pl-[18px] pr-[6px] py-[6px]">
        <input
          type="email"
          placeholder="email@address.com"
          aria-label="Địa chỉ email đăng ký nhận tin"
          className="flex-1 bg-transparent font-sans text-[14px] text-text-primary placeholder:text-text-muted outline-none min-w-0"
        />
        <button
          className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white hover:bg-primary-hover transition-colors"
          aria-label="Đăng ký"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
            arrow_forward
          </span>
        </button>
      </div>

      {/* Legal */}
      <p className="font-sans text-[12px] text-text-muted mt-[26px] m-0">
        © 2024 FlowerPlus. Thanh lịch từ thiên nhiên.
      </p>
    </footer>
  );
}
