/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true,
    outputFileTracingIncludes: { "/": ["./node_modules/argon2/prebuilds/linux-x64/*.musl.*"] },
  },
};

export default nextConfig;
