/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: `${process.env.NEXT_PUBLIC_API_PATH_PREFIX}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PATH_PREFIX}/:path*`,
      },
      {
        source: `${process.env.NEXT_PUBLIC_R2_PATH_PREFIX}/:path*`,
        destination: `${process.env.NEXT_PUBLIC_R2_BASE_URL}${process.env.NEXT_PUBLIC_R2_PATH_PREFIX}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
