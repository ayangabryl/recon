import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-8ac0d9d4dd9b4f47845b86ce47e96599.r2.dev" },
      { protocol: "https", hostname: "wise-design.figma.site" },
      { protocol: "https", hostname: "wise.design" },
    ],
  },
};

export default nextConfig;
