import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["fs", "path"],
};

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV !== "production",
  register: false,
  reloadOnOnline: true,
  cacheOnNavigation: true,
  globPublicPatterns: ["**/*.{html,png,svg,ico,css,js,woff,woff2}"],
});

export default withSerwist(nextConfig);
