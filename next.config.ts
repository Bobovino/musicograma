import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No backend/API routes for this phase — ship as a fully static site
  // (works great with the offline service worker and needs no server).
  output: "export",
};

export default nextConfig;
