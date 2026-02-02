import type { Metadata } from 'next';
import { ApolloProvider } from '@/components/providers/apollo-provider';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { Header } from '@/components/layout';
import { Footer } from '@/components/layout/Footer';
import { JspWelcomeModal } from '@/components/jsp-welcome-modal';
import './globals.css';


export const metadata: Metadata = {
    title: 'Message to Pawan Kalyan',
    description: 'Next.js app with Apollo Client',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <ApolloProvider>
                        <JspWelcomeModal />

                        <Header />
                        {children}
                        <Footer />
                    </ApolloProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
