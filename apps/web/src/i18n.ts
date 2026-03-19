import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import path from 'path';
import fs from 'fs';

export const locales = ['en', 'te'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
    te: 'తెలుగు',
    en: 'English',
};

export const defaultLocale: Locale = 'en';

export default getRequestConfig(async ({ requestLocale }) => {
    const locale = await requestLocale;
    console.log('[i18n] getRequestConfig called with locale:', locale);
    // Use the locale from params or fall back to default
    const currentLocale = locale || defaultLocale;
    console.log('[i18n] resolved to currentLocale:', currentLocale);

    // Validate that the locale is valid
    if (!locales.includes(currentLocale as Locale)) {
        notFound();
    }

    const messagesPath = path.join(process.cwd(), 'messages', `${currentLocale}.json`);
    console.log('[i18n] reading messages from:', messagesPath);
    const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

    return {
        locale: currentLocale,
        messages
    };
});
