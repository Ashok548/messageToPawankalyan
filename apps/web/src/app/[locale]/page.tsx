import { Box, Container, Typography } from '@mui/material';
import { setRequestLocale } from 'next-intl/server';
import { HomePageTabs } from '@/components/page-components/HomePageTabs';
import { useTranslations } from 'next-intl';

export default function HomePage({ params: { locale } }: { params: { locale: string } }) {
    setRequestLocale(locale);
    const t = useTranslations('home');

    return (
        <Box
            component="main"
            sx={{
                minHeight: 'calc(100vh - 48px)',
                backgroundColor: '#fafafa',
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: { xs: '100%', md: 900, lg: 1100 },
                    px: { xs: 2, sm: 4, md: 6 },
                }}
            >
                {/* Article Title */}
                <Typography
                    component="h1"
                    sx={{
                        fontSize: { xs: 28, sm: 36, md: 42 },
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: '#1a1a1a',
                        mb: 2,
                        letterSpacing: '-0.02em',
                    }}
                >
                    {t('title')}
                </Typography>

                {/* Article Metadata */}
                <Typography
                    sx={{
                        fontSize: 14,
                        color: 'text.secondary',
                        mb: 5,
                    }}
                >
                    {t('publishedDate')}
                </Typography>

                {/* Tabs Component */}
                <HomePageTabs />
            </Container>
        </Box>
    );
}
