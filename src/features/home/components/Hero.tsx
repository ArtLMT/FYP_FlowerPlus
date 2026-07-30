import Image from "next/image";
import Container from "@/components/ui/Container";

/**
 * Hero — responsive banner.
 *
 * Mobile: short 168px banner, headline anchored bottom-left (nothing else).
 * Desktop: tall 440px banner, a left-aligned block with eyebrow + big headline
 *          + subtitle + CTA. The extra text is `hidden md:block` so it only
 *          appears on wide screens; the gradient also flips from vertical
 *          (mobile, darken bottom) to horizontal (desktop, darken left).
 */
export default function Hero() {
  return (
    <section className="pt-1 md:pt-8">
      <Container>
        <div className="relative h-[168px] md:h-[440px] rounded-2xl md:rounded-3xl overflow-hidden bg-primary">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME"
            alt="Hoa tươi đẹp từ FlowerPlus"
            fill
            priority
            sizes="(max-width: 1240px) 100vw, 1240px"
            style={{ objectFit: "cover", filter: "brightness(75%)" }}
          />

          {/* Gradient: darken bottom on mobile, darken left on desktop */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[30%] to-[rgba(70,28,22,0.55)] md:bg-gradient-to-r md:from-[rgba(70,28,22,0.62)] md:via-[rgba(70,28,22,0.25)] md:to-transparent" />

          {/* Content block */}
          <div className="absolute inset-0 flex flex-col justify-end p-5 md:justify-center md:p-0 md:pl-14 md:max-w-[560px]">
            <p className="hidden md:block font-sans font-bold text-[12px] tracking-[0.18em] text-[#ffe1da] mb-4">
              HOA TƯƠI THỦ CÔNG
            </p>
            <h1 className="font-serif font-medium text-[30px] md:text-[60px] leading-[1.12] md:leading-[1.05] tracking-heading text-neutral-canvas m-0 md:mb-5">
              Hoa cho mọi khoảnh khắc
            </h1>
            <p className="hidden md:block font-sans text-[17px] leading-[1.6] text-[#ffeae5] mb-[30px]">
              Bộ sưu tập được tuyển chọn mỗi ngày, gói ghém trọn vẹn từng cảm xúc.
            </p>
            <button className="hidden md:inline-block self-start bg-neutral-canvas text-primary border-none rounded-[10px] px-[30px] py-[15px] font-sans font-bold text-body-sm tracking-button cursor-pointer hover:opacity-90 transition-opacity">
              KHÁM PHÁ NGAY
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
