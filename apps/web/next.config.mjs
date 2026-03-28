import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@repo/ui'],
    webpack(config) {
        // Suppress the harmless next-intl FileSystemInfo warning about dynamic import(t)
        // in extractor/format/index.js — it cannot be statically traced by webpack but
        // has no runtime impact.
        config.infrastructureLogging = {
            ...config.infrastructureLogging,
            level: 'error',
        };
        return config;
    },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ik.imagekit.io',
            },
        ],
    },
    experimental: {
        // Enable server actions if needed
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default withNextIntl(nextConfig);
