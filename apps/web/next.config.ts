import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: path.resolve(process.cwd(), "..", ".."),
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
