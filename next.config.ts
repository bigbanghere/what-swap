import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/core/i18n/i18n.ts');

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.swap.coffee',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'tokens.swap.coffee',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.dyor.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable tracing to avoid permission issues
  experimental: {
    instrumentationHook: false,
  },
  // Disable source maps in development to avoid file generation issues
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
