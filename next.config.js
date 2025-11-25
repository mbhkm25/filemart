const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // PWA Configuration
  // Service Worker is handled via public/sw.js
  // Manifest is handled via app/manifest.ts
  compress: true,
  poweredByHeader: false,
  outputFileTracingRoot: path.join(__dirname),
  experimental: {
    // Enable App Router features
  },
}

module.exports = nextConfig

