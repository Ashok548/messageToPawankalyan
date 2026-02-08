import type { Metadata } from 'next';
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
    return children;
}
