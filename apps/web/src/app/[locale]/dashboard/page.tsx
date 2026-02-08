'use client';

import { useQuery } from '@apollo/client';
import { Box, Grid, Typography, Paper } from '@mui/material';
import {
    Folder as ProjectsIcon,
    CheckCircle as CompletedIcon,
    Schedule as ActiveIcon,
} from '@mui/icons-material';
import { useTranslations } from 'next-intl';
import { AppLayout, Loading, ErrorState, Card } from '@/components';
import { GET_PROJECTS, GET_CURRENT_USER } from '@/graphql/queries';

function StatCard({ title, value, icon, color }: any) {
    return (
        <Paper sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: `${color}.50`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {icon}
            </Box>
            <Box>
                <Typography variant="body2" color="text.secondary">
                    {title}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                    {value}
                </Typography>
            </Box>
        </Paper>
    );
}

export default function DashboardPage() {
    const t = useTranslations('dashboard');
    const tCommon = useTranslations('common');
    const { data: userData, loading: userLoading } = useQuery(GET_CURRENT_USER);
    const { data: projectsData, loading: projectsLoading, error } = useQuery(GET_PROJECTS);

    if (userLoading || projectsLoading) {
        return (
            <AppLayout>
                <Loading message={tCommon('loading')} />
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <ErrorState message={error.message} />
            </AppLayout>
        );
    }

    const projects = projectsData?.projects || [];
    const totalProjects = projects.length;
    const activeProjects = projects.filter((p: any) => p.status === 'ACTIVE').length;
    const completedProjects = projects.filter((p: any) => p.status === 'COMPLETED').length;

    return (
        <AppLayout>
            <Box>
                {/* Welcome Section */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" fontWeight={700} gutterBottom>
                        {t('welcomeUser', { name: userData?.me?.name || 'User' })}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        {t('happening')}
                    </Typography>
                </Box>

                {/* Stats Grid */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title={t('totalProjects')}
                            value={totalProjects}
                            icon={<ProjectsIcon sx={{ fontSize: 28, color: 'primary.main' }} />}
                            color="primary"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title={t('activeProjects')}
                            value={activeProjects}
                            icon={<ActiveIcon sx={{ fontSize: 28, color: 'warning.main' }} />}
                            color="warning"
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard
                            title={t('completed')}
                            value={completedProjects}
                            icon={<CompletedIcon sx={{ fontSize: 28, color: 'success.main' }} />}
                            color="success"
                        />
                    </Grid>
                </Grid>

                {/* Recent Projects */}
                <Card title={t('recentProjects')} subtitle={t('latestProjects')}>
                    {projects.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">
                            {t('noProjects')}
                        </Typography>
                    ) : (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {projects.slice(0, 5).map((project: any) => (
                                <Paper
                                    key={project.id}
                                    variant="outlined"
                                    sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {project.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {project.description || t('noDescription')}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 1,
                                            bgcolor: project.status === 'ACTIVE' ? 'success.50' : 'grey.100',
                                            color: project.status === 'ACTIVE' ? 'success.main' : 'text.secondary',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {project.status}
                                    </Typography>
                                </Paper>
                            ))}
                        </Box>
                    )}
                </Card>
            </Box>
        </AppLayout>
    );
}
