import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images for better performance
  images: {
    // Disable image optimization in development to avoid "resolved to private ip" errors
    unoptimized: process.env.NODE_ENV !== "production",
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ermav2-backend.onrender.com",
        pathname: "/**",
      },
    ],
  },

  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole:
      process.env.NODE_ENV === "production"
        ? {
            exclude: ["error", "warn"],
          }
        : false,
  },

  // Modularize imports for better tree-shaking
  // modularizeImports: {
  //   "lucide-react": {
  //     transform: "lucide-react/dist/esm/icons/{{member}}",
  //   },
  // },

  // Enable experimental optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: ["lucide-react", "recharts"],

    // Enable optimized CSS loading
    optimizeCss: true,
  },

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // React strict mode for development
  reactStrictMode: true,
};

export default nextConfig;
