import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ApolloProvider } from '@/components/providers/apollo-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout/Footer';
import { JspWelcomeModal } from '@/components/jsp-welcome-modal';
import { NavigationLoadingWatcher } from '@/components/NavigationLoadingWatcher';
import { locales } from '@/i18n';
import '../globals.css';

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    if (!locales.includes(locale as any)) {
        notFound();
    }

    setRequestLocale(locale);
    const messages = await getMessages({ locale });
    console.log('[Layout] messages keys for', locale, ':', Object.keys(messages).slice(0, 20));
    console.log('[Layout] has home key:', !!messages.home);

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ThemeProvider>
                        <ApolloProvider>
                            <JspWelcomeModal />
                            <NavigationLoadingWatcher />
                            <Header />
                            {children}
                            <Footer />
                        </ApolloProvider>
                    </ThemeProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
