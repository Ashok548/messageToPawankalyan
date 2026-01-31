'use client';

import { useEffect } from 'react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center'
        }}>
            <h2>Something went wrong!</h2>
            <p style={{ color: 'red', marginBottom: '1rem' }}>{error.message || 'An unexpected error occurred.'}</p>
            <button
                onClick={() => reset()}
                style={{
                    padding: '0.5rem 1rem',
                    fontSize: '1rem',
                    cursor: 'pointer',
                    backgroundColor: '#0070f3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px'
                }}
            >
                Try again
            </button>
        </div>
    );
}
