'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    Typography,
    IconButton,
    Menu,
    MenuItem,
    Chip,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreIcon,
} from '@mui/icons-material';
import { AppLayout, Loading, ErrorState, EmptyState, Card } from '@/components';
import { GET_PROJECTS } from '@/graphql/queries';
import { CREATE_PROJECT, DELETE_PROJECT, UPDATE_PROJECT } from '@/graphql/mutations';

import { useTranslations } from 'next-intl';

export default function ProjectsPage() {
    const t = useTranslations('projects');
    const tCommon = useTranslations('common');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDescription, setNewProjectDescription] = useState('');
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedProject, setSelectedProject] = useState<any>(null);

    // Query projects
    const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
        fetchPolicy: 'cache-and-network',
    });

    // Create project mutation with cache update
    const [createProject, { loading: creating }] = useMutation(CREATE_PROJECT, {
        update(cache, { data: mutationData }) {
            if (!mutationData?.createProject) return;

            // Read existing projects from cache
            const existingData: any = cache.readQuery({ query: GET_PROJECTS });

            // Write updated projects to cache
            cache.writeQuery({
                query: GET_PROJECTS,
                data: {
                    projects: [...(existingData?.projects || []), mutationData.createProject],
                },
            });
        },
        onCompleted: () => {
            setCreateDialogOpen(false);
            setNewProjectName('');
            setNewProjectDescription('');
        },
    });

    // Delete project mutation with cache eviction
    const [deleteProject] = useMutation(DELETE_PROJECT, {
        update(cache, { data: mutationData }) {
            if (!mutationData?.deleteProject) return;

            // Evict deleted project from cache
            cache.evict({
                id: cache.identify({
                    __typename: 'Project',
                    id: mutationData.deleteProject.id,
                }),
            });
            cache.gc(); // Garbage collect
        },
    });

    // Update project status mutation
    const [updateProject] = useMutation(UPDATE_PROJECT, {
        // No need to manually update cache - Apollo auto-updates by id
    });

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) return;

        await createProject({
            variables: {
                input: {
                    name: newProjectName,
                    description: newProjectDescription,
                    status: 'ACTIVE',
                },
            },
        });
    };

    const handleDeleteProject = async (projectId: string) => {
        if (confirm(t('deleteConfirmation'))) {
            await deleteProject({
                variables: { id: projectId },
            });
        }
        setMenuAnchor(null);
    };

    const handleArchiveProject = async (projectId: string) => {
        await updateProject({
            variables: {
                id: projectId,
                input: { status: 'ARCHIVED' },
            },
        });
        setMenuAnchor(null);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, project: any) => {
        setMenuAnchor(event.currentTarget);
        setSelectedProject(project);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedProject(null);
    };

    if (loading && !data) {
        return (
            <AppLayout>
                <Loading message={tCommon('loading')} />
            </AppLayout>
        );
    }

    if (error) {
        return (
            <AppLayout>
                <ErrorState
                    message={error.message}
                    action={<Button onClick={() => refetch()}>{tCommon('reset')}</Button>}
                />
            </AppLayout>
        );
    }

    const projects = data?.projects || [];

    return (
        <AppLayout>
            <Box>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            {t('title')}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {t('subtitle')}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        {t('newProject')}
                    </Button>
                </Box>

                {/* Projects Grid */}
                {projects.length === 0 ? (
                    <EmptyState
                        title={t('emptyTitle')}
                        description={t('emptyDesc')}
                        action={{
                            label: t('createFirst'),
                            onClick: () => setCreateDialogOpen(true),
                        }}
                    />
                ) : (
                    <Grid container spacing={3}>
                        {projects.map((project: any) => (
                            <Grid item xs={12} sm={6} lg={4} key={project.id}>
                                <Card>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Typography variant="h6" fontWeight={600}>
                                            {project.name}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleMenuOpen(e, project)}
                                        >
                                            <MoreIcon />
                                        </IconButton>
                                    </Box>

                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {project.description || t('noDescription')}
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Chip
                                            label={project.status}
                                            size="small"
                                            color={project.status === 'ACTIVE' ? 'success' : 'default'}
                                        />
                                        <Typography variant="caption" color="text.secondary">
                                            {t('by', { name: project.owner?.name || t('unknown') })}
                                        </Typography>
                                    </Box>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {/* Context Menu */}
                <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleArchiveProject(selectedProject?.id)}>
                        {t('archive')}
                    </MenuItem>
                    <MenuItem
                        onClick={() => handleDeleteProject(selectedProject?.id)}
                        sx={{ color: 'error.main' }}
                    >
                        {tCommon('delete')}
                    </MenuItem>
                </Menu>

                {/* Create Project Dialog */}
                <Dialog
                    open={createDialogOpen}
                    onClose={() => setCreateDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>{t('createDialogTitle')}</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                            <TextField
                                label={t('projectName')}
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                fullWidth
                                required
                                autoFocus
                            />
                            <TextField
                                label={t('description')}
                                value={newProjectDescription}
                                onChange={(e) => setNewProjectDescription(e.target.value)}
                                fullWidth
                                multiline
                                rows={3}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCreateDialogOpen(false)}>{tCommon('cancel')}</Button>
                        <Button
                            variant="contained"
                            onClick={handleCreateProject}
                            disabled={creating || !newProjectName.trim()}
                        >
                            {creating ? tCommon('creating') : tCommon('create', { defaultMessage: 'Create' })}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </AppLayout>
    );
}
