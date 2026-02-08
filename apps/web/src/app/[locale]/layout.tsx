import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { ApolloProvider } from '@/components/providers/apollo-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout/Footer';
import { JspWelcomeModal } from '@/components/jsp-welcome-modal';
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
    console.log('locale:', locale);

    if (!locales.includes(locale as any)) {
        notFound();
    }

    const messages = await getMessages({ locale });

    return (
        <html lang={locale}>
            <body>
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <ThemeProvider>
                        <ApolloProvider>
                            <JspWelcomeModal />
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
