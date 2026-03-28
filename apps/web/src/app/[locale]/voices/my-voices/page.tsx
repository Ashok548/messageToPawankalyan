'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { useNavigate } from '@/hooks/use-navigate';

export default function MyVoicesPage() {
    const locale = useLocale();
    const { navigate } = useNavigate();

    useEffect(() => {
        navigate(`/${locale}/voices`);
    }, [locale, navigate]);

    return null;
}