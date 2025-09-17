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
    let bufferPath = null;
    try {
      // Try resolve optional polyfill if installed
      bufferPath = req.resolve("buffer");
    } catch (e) {
      // If not present, skip adding the polyfill to avoid crashing dev
      console.warn("Optional 'buffer' polyfill not installed; skipping webpack fallback.");
    }

    if (bufferPath) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve?.fallback || {}),
        buffer: bufferPath,
      };
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
        })
      );
    }

    return config;
  },
};

export default nextConfig;
