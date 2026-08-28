/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.BACKEND_URL ? `${process.env.BACKEND_URL}/api/:path*` : 'http://backend:8000/api/:path*',
      },
      // Guía de usuario servida desde public/docs (URL: /docs)
      {
        source: '/docs',
        destination: '/docs/index.html',
      },
      {
        source: '/docs/',
        destination: '/docs/index.html',
      },
    ];
  },
};

module.exports = nextConfig;
