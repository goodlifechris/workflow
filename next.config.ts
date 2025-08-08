import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript:{
ignoreBuildErrors:true
  },
  images: {
    domains: ['reactflow.dev'],
    // or with the new syntax in newer Next.js versions:
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'reactflow.dev',
        pathname: '/**',
      },
    ],
  }
};

export default nextConfig;
