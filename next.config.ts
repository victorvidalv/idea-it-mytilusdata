import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Solo usar standalone para Docker, no para Vercel
  ...(process.env.DOCKER_BUILD === "true" && { output: "standalone" }),
};

export default nextConfig;
