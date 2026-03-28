import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function MessageToJanasainiksPage() {
    const t = useTranslations('messageToJanasainiks');
    return (
        <Box
            component="main"
            sx={{
                minHeight: '100vh',
                backgroundColor: '#fafafa',
                py: { xs: 4, sm: 6 },
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    maxWidth: 680,
                    px: { xs: 3, sm: 4 },
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

                {/* Article Body */}
                <Box
                    sx={{
                        '& p': {
                            fontSize: { xs: 17, sm: 18 },
                            lineHeight: 1.7,
                            color: '#2e2e2e',
                            mb: 3,
                            fontFamily: 'Georgia, serif',
                        },
                    }}
                >
                    <Typography component="p">{t('greeting')}</Typography>

                    <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: '#1a1a1a', mt: 5, mb: 2, borderLeft: '4px solid #E31E24', pl: 2 }}>
                        {t('s1heading')}
                    </Typography>
                    <Typography component="p">{t('s1p1')}</Typography>
                    <Typography component="p">{t('s1p2')}</Typography>

                    <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: '#1a1a1a', mt: 5, mb: 2, borderLeft: '4px solid #E31E24', pl: 2 }}>
                        {t('s2heading')}
                    </Typography>
                    <Typography component="p">{t('s2p1')}</Typography>
                    <Typography component="p">{t('s2p2')}</Typography>
                    <Typography component="p">{t('s2p3')}</Typography>

                    <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: '#1a1a1a', mt: 5, mb: 2, borderLeft: '4px solid #E31E24', pl: 2 }}>
                        {t('s3heading')}
                    </Typography>
                    <Typography component="p">{t('s3p1')}</Typography>
                    <Typography component="p">{t('s3p2')}</Typography>

                    <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: '#1a1a1a', mt: 5, mb: 2, borderLeft: '4px solid #E31E24', pl: 2 }}>
                        {t('s4heading')}
                    </Typography>
                    <Typography component="p">{t('s4p1')}</Typography>

                    <Typography sx={{ fontSize: { xs: 20, sm: 22 }, fontWeight: 700, color: '#1a1a1a', mt: 5, mb: 2, borderLeft: '4px solid #E31E24', pl: 2 }}>
                        {t('s5heading')}
                    </Typography>
                    <Typography component="p">{t('s5p1')}</Typography>
                    <Typography component="p">{t('s5p2')}</Typography>
                </Box>
            </Container>
        </Box>
    );
}
