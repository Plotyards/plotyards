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
      }
    ],
  },
  async rewrites() {
    // Determine the target backend URL for API proxying
    // We strip any trailing '/api' so we can cleanly append '/api/:path*'
    let backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.plotyards.com';
    backendUrl = backendUrl.replace(/\/api\/?$/, '');
    
    // Ensure it has a protocol and is not empty or a relative path
    if (!backendUrl || backendUrl.startsWith('/')) {
      backendUrl = 'https://api.plotyards.com';
    } else if (!backendUrl.startsWith('http')) {
      backendUrl = `https://${backendUrl}`;
    }

    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`, // Proxy to Backend
      },
    ];
  },
};

export default nextConfig;
