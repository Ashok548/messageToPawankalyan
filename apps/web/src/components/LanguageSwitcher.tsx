'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { Box, ButtonBase } from '@mui/material';
import { type Locale } from '@/i18n';

export function LanguageSwitcher() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();

    const handleLanguageToggle = () => {
        const newLocale: Locale = locale === 'en' ? 'te' : 'en';
        const segments = pathname.split('/');
        segments[1] = newLocale; // Replace locale segment
        const newPath = segments.join('/');

        router.push(newPath);
    };

    return (
        <ButtonBase
            onClick={handleLanguageToggle}
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'all 0.2s ease',
                '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderColor: 'primary.main',
                },
            }}
            aria-label="Toggle language"
        >
            {/* Globe Icon */}
            <Box
                component="span"
                sx={{
                    fontSize: 16,
                    lineHeight: 1,
                }}
            >
                🌐
            </Box>

            {/* Show opposite language */}
            <Box
                component="span"
                sx={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'text.primary',
                }}
            >
                {locale === 'en' ? 'తే' : 'EN'}
            </Box>
        </ButtonBase>
    );
}
