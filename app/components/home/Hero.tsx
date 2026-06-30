import Image from "next/image";

export default function Hero() {
  return (
    <section className="px-margin-mobile pt-1">
      <div className="relative h-[168px] rounded-2xl overflow-hidden bg-primary">
        <Image
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSmkSgMDgNa_sr1692th8VHhzWjJcPzbq5aqrhkiFTAqBeOYrD_GLVUzLIJcaD0_t_enhC0N0oTus5Zcqve-i5kPJ2i_kpruq18MlKlu5-lUxW9YUi9gTxp2XePM3c1zNi4mKdrjHkpwogX34HJFKQfTfZ1wL_W_zUvd9lUAEy0ugypQjvMTIw56SUBw7Y_CA2lgJGoAJNMUYDp7mCUOVOxZpsR2ER83lifNQsf8-zRum06W4wlWdFSxMOgByn6YQA-WiQYbLPsME"
          alt="Hoa tươi đẹp từ FlowerPlus"
          fill
          priority
          sizes="(max-width: 430px) 100vw, 430px"
          style={{ objectFit: "cover", filter: "brightness(75%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-[30%] to-[rgba(70,28,22,0.55)]" />
        <h1 className="absolute left-5 bottom-[18px] right-5 font-serif font-medium text-[30px] leading-[1.12] tracking-heading text-neutral-canvas m-0">
          Hoa cho mọi khoảnh khắc
        </h1>
      </div>
    </section>
  );
}
