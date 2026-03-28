import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Message to Pawan Kalyan',
    description: 'Next.js app with Apollo Client',
    icons: {
        icon: '/assets/logo_navigation.png',
        shortcut: '/assets/logo_navigation.png',
        apple: '/assets/logo_navigation.png',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
