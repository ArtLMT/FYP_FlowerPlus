import Container from "@/components/ui/Container";

const CATEGORIES = ["Trang chủ", "Bộ sưu tập", "Đặt riêng", "Ưu đãi"];

/**
 * Footer.
 * Mobile: everything stacks in one column.
 * Desktop: a 3-column grid (brand/address · categories · newsletter) plus a
 *          full-width bottom bar for the copyright line.
 */
export default function Footer() {
  return (
    <footer className="bg-neutral-raised mt-8 md:mt-16">
      <Container className="pt-[34px] md:pt-14 pb-[30px] md:pb-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-[1.4fr_1fr_1.3fr] md:gap-12">
          {/* Brand + address */}
          <div>
            <p className="font-serif text-[28px] md:text-[30px] italic text-primary tracking-heading mb-4 m-0">
              FlowerPlus
            </p>
            <address className="not-italic font-sans text-body md:text-[14px] leading-[1.7] text-text-secondary">
              12 Đường Hoa Sữa, Phường Bến Nghé<br />
              Quận 1, TP. Hồ Chí Minh<br />
              T2–T7: 09:00 – 19:00
            </address>
          </div>

          {/* Categories — desktop only (mobile keeps the footer compact) */}
          <div className="hidden md:block">
            <p className="font-sans font-bold text-label tracking-[0.14em] text-text-muted mb-4 m-0">
              DANH MỤC
            </p>
            <div className="flex flex-col gap-[10px]">
              {CATEGORIES.map((c) => (
                <a key={c} href="#" className="font-sans text-[14px] text-text-secondary no-underline hover:text-primary transition-colors">
                  {c}
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="font-sans font-bold text-label tracking-badge text-text-muted mb-3 md:mb-4 m-0">
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
          </div>
        </div>
      </Container>

      {/* Bottom bar */}
      <div className="border-t border-neutral-border">
        <Container className="py-5">
          <p className="font-sans text-[12px] text-text-muted m-0">
            © 2024 FlowerPlus. Thanh lịch từ thiên nhiên.
          </p>
        </Container>
      </div>
    </footer>
  );
}
