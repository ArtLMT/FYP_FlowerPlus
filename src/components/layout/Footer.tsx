import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { POLICIES, POLICY_ORDER } from "@/features/policy/policies";
import { DELIVERY_HOURS, SHOP_EMAIL } from "@/lib/shop";

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
              Giao hàng: {DELIVERY_HOURS} hằng ngày<br />
              <a href={`mailto:${SHOP_EMAIL}`} className="text-text-secondary underline hover:text-primary transition-colors">{SHOP_EMAIL}</a>
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
              <Button
                className="w-10 h-10 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white hover:bg-primary-hover transition-colors"
                aria-label="Đăng ký"
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </Button>
            </div>
          </div>
        </div>
      </Container>

      {/* Bottom bar: copyright and the policy pages */}
      <div className="border-t border-neutral-border">
        <Container className="flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <p className="font-sans text-[12px] text-text-muted m-0">
            © 2026 FlowerPlus. Thanh lịch từ thiên nhiên.
          </p>
          <nav aria-label="Chính sách" className="flex flex-wrap gap-x-5 gap-y-2">
            {POLICY_ORDER.map((slug) => (
              <Link key={slug} href={`/policies/${slug}`} className="font-sans text-[12px] text-text-secondary underline hover:text-primary transition-colors">
                {POLICIES[slug].title}
              </Link>
            ))}
          </nav>
        </Container>
      </div>
    </footer>
  );
}
