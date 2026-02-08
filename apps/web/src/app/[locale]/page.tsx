import { Box, Container, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';

export default function HomePage() {
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
                        {t('intro')}
                    </Typography>

                    <Typography component="p">
                        {t('accountability')}
                    </Typography>

                    <Typography component="p">
                        {t('shift')}
                    </Typography>

                    <Typography component="p">
                        {t('technology')}
                    </Typography>

                    <Typography component="p">
                        {t('challenges')}
                    </Typography>

                    <Typography component="p">
                        {t('janasainiks')}
                    </Typography>

                    <Typography component="p">
                        {t('grassroots')}
                    </Typography>

                    <Typography component="p">
                        {t('violence')}
                    </Typography>

                    <Typography component="p">
                        {t('approach')}
                    </Typography>

                    <Typography component="p">
                        {t('empowerment')}
                    </Typography>

                    <Typography component="p">
                        {t('relationship')}
                    </Typography>

                    <Typography component="p">
                        {t('transparency')}
                    </Typography>

                    <Typography component="p">
                        {t('future')}
                    </Typography>

                    <Typography component="p">
                        {t('pathForward')}
                    </Typography>

                    <Typography component="p">
                        {t('message')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
