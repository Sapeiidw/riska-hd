import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    skipWaiting: true,
    runtimeCaching: [
      {
        // Exclude auth API from caching - always go to network
        urlPattern: /^https?:\/\/.*\/api\/auth\/.*/i,
        handler: "NetworkOnly",
      },
      {
        // Portal API - always realtime, no cache
        urlPattern: /^https?:\/\/.*\/api\/portal\/.*/i,
        handler: "NetworkOnly",
      },
      {
        // Exclude all API routes from caching
        urlPattern: /^https?:\/\/.*\/api\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "api-cache",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 60, // 1 minute
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        // Cache static assets
        urlPattern: /\.(?:js|css|woff2?|png|jpg|jpeg|gif|svg|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets",
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
          },
        },
      },
      {
        // Default: pages use StaleWhileRevalidate
        urlPattern: /^https?:\/\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages-cache",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24, // 1 day
          },
        },
      },
    ],
  },
});

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default withPWA(nextConfig);
