/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", `${process.env.NEXT_PUBLIC_API_URL}`],
  },
  async rewrites() {
  return [
    {
      source: "/api/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
    },
    {
      source: "/api/sanctum/:path*",
      destination: `${process.env.NEXT_PUBLIC_API_URL}/sanctum/:path*`,
    },
  ];
},
};

module.exports = nextConfig;
