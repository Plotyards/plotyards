/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '5000',
        pathname: '/**',
      },
      // You can add more domains if images come from elsewhere (e.g. AWS S3, Cloudinary)
    ],
  },
};

export default nextConfig;
