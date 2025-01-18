/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}${process.env.NEXT_PUBLIC_API_PATH_PREFIX}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
