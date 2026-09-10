import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  env: {
    MOCK_MODE: process.env.MOCK_MODE ?? "true",
  },
};

export default nextConfig;
