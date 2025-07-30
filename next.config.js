/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable CORS for widget embedding
  async headers() {
    return [
      {
        // Apply headers to widget routes - ALLOW ALL ORIGINS FOR IFRAME
        source: '/widget/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allow embedding from any domain
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // Allow all domains to embed
          },
        ],
      },
      {
        // CORS for API routes
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        // Headers for embed script
        source: '/embed.js',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Optimize for production
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },

  // Enable compression
  compress: true,

  // Custom webpack config for widget optimization
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize bundle size for client-side widget
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          widget: {
            name: 'widget',
            chunks: 'all',
            test: /[\\/]widget[\\/]/,
            priority: 20,
          },
        },
      };
    }
    return config;
  },

  // Static export for CDN deployment (optional)
  // Uncomment if you want to deploy to a CDN
  // output: 'export',
  // trailingSlash: true,
  // images: {
  //   unoptimized: true
  // }
};

module.exports = nextConfig;