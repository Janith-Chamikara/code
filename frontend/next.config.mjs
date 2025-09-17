import { createRequire } from "module";

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },

  // Polyfills for browser builds (nsfwjs requires Buffer)
  webpack: (config, { webpack }) => {
    const req = createRequire(import.meta.url);
    config.resolve = config.resolve || {};
    config.resolve.fallback = {
      ...(config.resolve?.fallback || {}),
      buffer: req.resolve("buffer/")
    };
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      })
    );

    return config;
  },
};

export default nextConfig;
