/** @type {import('next').NextConfig} */
const nextConfig = {
  // Since the app uses react-router-dom for client-side routing,
  // we need to rewrite all routes to the catch-all page
  async rewrites() {
    return [
      {
        source: '/:path*',
        destination: '/',
      },
    ];
  },
  // Transpile packages that need it
  transpilePackages: ['lucide-react'],
};

export default nextConfig;
