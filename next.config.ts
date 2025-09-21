import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

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
      {
        protocol: 'https',
        hostname: 'cache.tonapi.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Disable tracing to avoid permission issues
  experimental: {
    // clientInstrumentationHook: false, // This option is not valid in Next.js 15
  },
  // Disable source maps in development to avoid file generation issues
  productionBrowserSourceMaps: false,
};

export default withNextIntl(nextConfig);
