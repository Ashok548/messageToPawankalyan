import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'te'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
    te: 'తెలుగు',
    en: 'English',
};

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ locale }) => {
    // Use the locale from params or fall back to default
    const currentLocale = locale || defaultLocale;

    // Validate that the locale is valid
    if (!locales.includes(currentLocale as Locale)) {
        notFound();
    }

    return {
        locale: currentLocale,
        messages: (await import(`../messages/${currentLocale}.json`)).default
    };
});
