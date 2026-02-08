'use client';

import { useLocale } from 'next-intl';
import type { Locale } from '@/i18n';

export function useCurrentLocale(): Locale {
    return useLocale() as Locale;
}
