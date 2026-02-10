'use client';

import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

export default function Loading() {
    console.log('[Loading] 🔄 loading.tsx RENDERED — spinner is showing');

    useEffect(() => {
        console.log('[Loading] ✅ loading.tsx MOUNTED');
        return () => {
            console.log('[Loading] ❌ loading.tsx UNMOUNTED — page loaded, spinner hiding');
        };
    }, []);

    return <Spinner fullScreen />;
}
