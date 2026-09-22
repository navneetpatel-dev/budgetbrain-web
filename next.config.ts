import type { NextConfig } from 'next';
import withBundleAnalyzerFactory from '@next/bundle-analyzer';

const withBundleAnalyzer = withBundleAnalyzerFactory({ enabled: process.env.ANALYZE === 'true' });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    // No next/image usage exists yet (receipts/avatars currently render as plain <img>
    // blob previews or download links) — this is forward-looking so a future remote
    // thumbnail feature doesn't need its own config PR. Matches the backend's S3 URL
    // shape (`${bucket}.s3.${region}.amazonaws.com`, see core/storage/s3.service.ts).
    remotePatterns: [{ protocol: 'https', hostname: '*.s3.*.amazonaws.com' }],
  },
};

export default withBundleAnalyzer(nextConfig);
