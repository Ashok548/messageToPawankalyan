import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function NotFound() {
    const t = useTranslations('notFound');
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '60vh', // Adjusted height since header/footer exist
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>{t('title')}</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>{t('description')}</p>
            <Link
                href="/"
                style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    fontWeight: 500
                }}
            >
                {t('returnHome')}
            </Link>
        </div>
    );
}
