import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const backend = process.env.FLOWERPLUS_API_ORIGIN ?? "http://localhost:8080";
    return [
      { source: "/api/:path*", destination: `${backend}/api/:path*` },
      { source: "/media/:path*", destination: `${backend}/media/:path*` },
    ];
  },
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
