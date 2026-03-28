'use client';

import { Box, Container, Typography, Divider, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import teMessages from '../../../../messages/te.json';

export default function WhyJoinJanaSenaPage() {
    const locale = useLocale();
    // Always use Telugu content for this page
    const t = (key: string) => getNestedValue(teMessages.whyJoin, key);
    const fadeInUp = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                    color: 'white',
                    py: { xs: 6, md: 10 },
                    textAlign: 'center',
                }}
            >
                <Container maxWidth="lg">
                    <motion.div {...fadeInUp}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2rem', md: '3.5rem' },
                                mb: 2,
                                background: 'linear-gradient(90deg, #fff 0%, #E31E24 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}
                        >
                            {t('title')}
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 400,
                                fontSize: { xs: '1.1rem', md: '1.5rem' },
                                color: 'rgba(255, 255, 255, 0.9)',
                                maxWidth: '800px',
                                mx: 'auto',
                            }}
                        >
                            {t('subtitle')}
                        </Typography>
                    </motion.div>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: 6 }}>
                {/* Introduction */}
                <motion.div {...fadeInUp}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.125rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 6,
                            textAlign: 'center',
                            fontStyle: 'italic',
                        }}
                    >
                        {t('intro')}
                    </Typography>
                </motion.div>

                {/* JanaSena Ideology */}
                <Section
                    title={t('ideology.title')}
                    content={[
                        t('ideology.points.0'),
                        t('ideology.points.1'),
                        t('ideology.points.2')
                    ]}
                />

                <RefBox
                    label={t('refs.evidenceLabel')}
                    links={[
                        { text: t('refs.disciplinary'), href: `/${locale}/disciplinary-cases` },
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Values & Principles */}
                <Section
                    title={t('values.title')}
                    content={[
                        {
                            heading: t('values.items.0.heading'),
                            text: t('values.items.0.text')
                        },
                        {
                            heading: t('values.items.1.heading'),
                            text: t('values.items.1.text')
                        },
                        {
                            heading: t('values.items.2.heading'),
                            text: t('values.items.2.text')
                        },
                        {
                            heading: t('values.items.3.heading'),
                            text: t('values.items.3.text')
                        }
                    ]}
                />

                <RefBox
                    label={t('refs.leaderLabel')}
                    links={[
                        { text: t('refs.leaders'), href: `/${locale}/leaders-society-needs` },
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* About Pawan Kalyan Garu */}
                <Box sx={{ mb: 6 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 3,
                            color: '#E31E24',
                        }}
                    >
                        {t('leadership.title')}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        {t('leadership.p1')}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        {t('leadership.p2')}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        {t('leadership.p3')}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                        }}
                    >
                        {t('leadership.p4')}
                    </Typography>

                    <RefBox
                        label={t('refs.governanceLabel')}
                        links={[
                            { text: t('refs.governance'), href: `/${locale}/governance-highlights` },
                        ]}
                    />
                </Box>

                <Divider sx={{ my: 6 }} />

                {/* Relevance Today */}
                <Section
                    title={t('relevance.title')}
                    content={[
                        t('relevance.points.0'),
                        t('relevance.points.1'),
                        t('relevance.points.2')
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Vision for the Future */}
                <Section
                    title={t('vision.title')}
                    content={[
                        t('vision.points.0'),
                        t('vision.points.1'),
                        t('vision.points.2'),
                        t('vision.points.3')
                    ]}
                />

                <Divider sx={{ my: 6 }} />

                {/* Closing Message */}
                <Box
                    sx={{
                        backgroundColor: '#f5f5f5',
                        borderLeft: '4px solid #E31E24',
                        p: 4,
                        borderRadius: 1,
                        mt: 6,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 600,
                            mb: 2,
                            color: '#1a1a1a',
                        }}
                    >
                        {t('closing.title')}
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                        }}
                    >
                        {t('closing.text')}
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}

// Helper to get nested values from objects
function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
}
function RefBox({ label, links }: { label: string; links: { text: string; href: string }[] }) {
    return (
        <Box
            sx={{
                backgroundColor: '#fff3f3',
                border: '1px solid #E31E24',
                borderRadius: 2,
                p: 2.5,
                mb: 4,
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 1.5,
            }}
        >
            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a', mr: 1 }}>
                {label}
            </Typography>
            {links.map((link) => (
                <Chip
                    key={link.href}
                    label={link.text}
                    component={Link}
                    href={link.href}
                    clickable
                    size="small"
                    sx={{
                        backgroundColor: '#E31E24',
                        color: '#fff',
                        fontWeight: 500,
                        '&:hover': { backgroundColor: '#b71c1c' },
                    }}
                />
            ))}
        </Box>
    );
}

// Section Component
function Section({ title, content }: { title: string; content: (string | { heading: string; text: string })[] }) {
    return (
        <Box sx={{ mb: 6 }}>
            <Typography
                variant="h4"
                sx={{
                    fontWeight: 700,
                    mb: 3,
                    color: '#E31E24',
                }}
            >
                {title}
            </Typography>
            {content.map((item, index) => (
                typeof item === 'string' ? (
                    <Typography
                        key={index}
                        variant="body1"
                        sx={{
                            fontSize: '1.0625rem',
                            lineHeight: 1.8,
                            color: 'text.secondary',
                            mb: 3,
                        }}
                    >
                        {item}
                    </Typography>
                ) : (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                mb: 1,
                                color: '#1a1a1a',
                            }}
                        >
                            {item.heading}
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                fontSize: '1.0625rem',
                                lineHeight: 1.8,
                                color: 'text.secondary',
                            }}
                        >
                            {item.text}
                        </Typography>
                    </Box>
                )
            ))}
        </Box>
    );
}
