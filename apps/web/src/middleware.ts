import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './i18n';

export default createMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always', // Always show locale in URL
});

export const config = {
    matcher: ['/', '/(te|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
