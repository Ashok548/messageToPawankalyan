import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    transpilePackages: ['@repo/ui'],
    experimental: {
        // Enable server actions if needed
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

export default withNextIntl(nextConfig);
