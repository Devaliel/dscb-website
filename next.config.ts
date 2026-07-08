import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project (a stray lockfile lives one dir up).
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    // blog covers may be pasted as external URLs from the admin editor
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
