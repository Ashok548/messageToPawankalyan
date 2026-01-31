'use client';

import Link from 'next/link';

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            fontFamily: 'sans-serif',
            textAlign: 'center',
            padding: '2rem'
        }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Page Not Found</h2>
            <p style={{ marginBottom: '2rem', color: '#666' }}>Could not find requested resource</p>
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
                Return Home
            </Link>
        </div>
    );
}
