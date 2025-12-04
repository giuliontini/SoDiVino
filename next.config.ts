import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@supabase/ssr"],

  outputFileTracingIncludes: {
      '/api/**/*': ['./node_modules/**/*.wasm', './node_modules/**/*.proto'],
  },

  // keep other experimental flags here *if* you have them
  experimental: {
    // e.g. ppr: "incremental",
    // etc…
  },
};

export default nextConfig;
