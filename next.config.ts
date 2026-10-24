import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // sweph is a native addon loaded via node-gyp-build at runtime.
  // serverExternalPackages keeps it a real require() instead of Turbopack
  // bundling its JS; outputFileTracingIncludes is still needed separately to
  // actually copy the prebuilt .node binaries, which tracing can't discover
  // on its own since node-gyp-build builds that path at runtime.
  serverExternalPackages: ["sweph"],
  outputFileTracingIncludes: {
    "/api/generate-reading": ["./node_modules/sweph/prebuilds/**"],
  },
};

export default nextConfig;
