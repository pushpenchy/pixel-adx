import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tree-shake the big 3D helper library per import instead of pulling the whole barrel
  experimental: { optimizePackageImports: ["@react-three/drei", "three"] },
  // long-lived caching for the generated brand/logo SVGs
  async headers() {
    return [{ source: "/brand/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] }];
  },
};

export default nextConfig;
