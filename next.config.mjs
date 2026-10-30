import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  turbopack: {
    root: __dirname
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'srv1853103.hstgr.cloud',
      }
    ],
  },
  async rewrites() {
    let apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'https://srv1853103.hstgr.cloud/api').trim().replace(/\/+$/, '');
    if (apiUrl.includes('187.127.153.144') || apiUrl.includes('187.127.175.192')) {
      apiUrl = 'https://srv1853103.hstgr.cloud/api';
    }
    const targetUrl = apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
    return [
      {
        source: '/api/:path*',
        destination: `${targetUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
