import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  experimental: {
    // Dev server only: ask Turbopack to keep its working set near this size (bytes) instead of growing
    // with every page compiled. Without it the dev server reaches well over 1 GB on this machine.
    ...(isDev ? { turbopackMemoryLimit: 600 * 1024 * 1024 } : {}),
  },
};

export default nextConfig;
