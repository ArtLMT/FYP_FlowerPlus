import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        // Current placeholder images from Lovable/AIDA
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // When your backend is ready, add its hostname here, e.g.:
      // {
      //   protocol: "https",
      //   hostname: "api.flowerplus.com",
      //   pathname: "/images/**",
      // },
    ],
  },
};

export default nextConfig;
