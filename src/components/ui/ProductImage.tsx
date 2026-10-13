"use client";

import { useState } from "react";
import Image from "next/image";

interface ProductImageProps {
  src?: string | null;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
}

/** One fallback for missing image URLs and image requests that fail to load. */
export default function ProductImage({ src, alt, sizes, className, priority }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (!src?.trim() || failedSrc === src) {
    return (
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#111] text-white/75"
        role={alt ? "img" : undefined}
        aria-label={alt ? `Chưa có ảnh: ${alt}` : undefined}
        aria-hidden={alt ? undefined : true}
      >
        <span className="material-symbols-outlined" style={{ fontSize: 42 }} aria-hidden="true">local_florist</span>
        <span className="font-sans text-[12px] tracking-wide" aria-hidden="true">CHƯA CÓ ẢNH</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      style={{ objectFit: "cover" }}
      className={className}
      onError={() => setFailedSrc(src)}
    />
  );
}
