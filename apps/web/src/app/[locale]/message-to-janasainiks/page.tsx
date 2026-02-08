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
                    <Typography component="p">
                        {t('p1')}
                    </Typography>

                    <Typography component="p">
                        {t('p2')}
                    </Typography>

                    <Typography component="p">
                        {t('p3')}
                    </Typography>

                    <Typography component="p">
                        {t('p4')}
                    </Typography>

                    <Typography component="p">
                        {t('p5')}
                    </Typography>

                    <Typography component="p">
                        {t('p6')}
                    </Typography>

                    <Typography component="p">
                        {t('p7')}
                    </Typography>

                    <Typography component="p">
                        {t('p8')}
                    </Typography>

                    <Typography component="p">
                        {t('p9')}
                    </Typography>

                    <Typography component="p">
                        {t('p10')}
                    </Typography>

                    <Typography component="p">
                        {t('p11')}
                    </Typography>

                    <Typography component="p">
                        {t('p12')}
                    </Typography>

                    <Typography component="p">
                        {t('p13')}
                    </Typography>

                    <Typography component="p">
                        {t('p14')}
                    </Typography>

                    <Typography component="p">
                        {t('p15')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
