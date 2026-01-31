'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    Divider,
    Stack,
    Chip,
    Avatar,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton
} from '@mui/material';
import {
    ArrowBack,
    Gavel,
    Edit,
    Visibility,
    Image as ImageIcon,
    Description,
    History,
    Person,
    Security,
    Add,
    Close,
    NavigateBefore,
    NavigateNext,
    Article,
    Download
} from '@mui/icons-material';
import { useRouter, useParams } from 'next/navigation';
import { CaseStatusBadge, CaseStatus, ActionOutcome, CaseVisibility } from '@/components/ui/case-status-badge';
import {
    GET_DISCIPLINARY_CASE_DETAILS,
    UPDATE_CASE_STATUS,
    RECORD_CASE_DECISION,
    UPDATE_CASE_VISIBILITY,
    ADD_CASE_INTERNAL_NOTE
} from '@/graphql/disciplinary-cases';
import { useAuth } from '@/hooks/use-auth';

// Helper for displaying content safely
const InfoRow = ({ label, value, icon }: { label: string, value: React.ReactNode, icon?: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5} gutterBottom>
            {icon} {label}
        </Typography>
        <Typography variant="body1">
            {value || 'N/A'}
        </Typography>
    </Box>
);

export default function DisciplinaryCaseDetailPage() {
    const router = useRouter();
    const params = useParams();
    const { user } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // State for modals
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [decisionModalOpen, setDecisionModalOpen] = useState(false);
    const [visibilityModalOpen, setVisibilityModalOpen] = useState(false);
    const [noteModalOpen, setNoteModalOpen] = useState(false);

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Form states
    const [newStatus, setNewStatus] = useState('');
    const [decisionData, setDecisionData] = useState({ outcome: '', rationale: '', effectiveFrom: '', effectiveTo: '' });
    const [newVisibility, setNewVisibility] = useState('');
    const [newNote, setNewNote] = useState('');

    const { data, loading, error, refetch } = useQuery(GET_DISCIPLINARY_CASE_DETAILS, {
        variables: { id: params.id },
        skip: !params.id
    });

    const [updateStatus] = useMutation(UPDATE_CASE_STATUS);
    const [recordDecision] = useMutation(RECORD_CASE_DECISION);
    const [updateVisibility] = useMutation(UPDATE_CASE_VISIBILITY);
    const [addNote] = useMutation(ADD_CASE_INTERNAL_NOTE);

    if (loading) return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">Error: {error.message}</Alert>;
    if (!data?.disciplinaryCase) return <Alert severity="warning">Case not found</Alert>;

    const caseData = data.disciplinaryCase;

    const handleStatusUpdate = async () => {
        try {
            await updateStatus({
                variables: {
                    id: caseData.id,
                    input: { status: newStatus }
                }
            });
            setStatusModalOpen(false);
            refetch();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRecordDecision = async () => {
        try {
            await recordDecision({
                variables: {
                    id: caseData.id,
                    input: {
                        actionOutcome: decisionData.outcome,
                        decisionRationale: decisionData.rationale,
                        effectiveFrom: decisionData.effectiveFrom || undefined,
                        effectiveTo: decisionData.effectiveTo || undefined
                    }
                }
            });
            setDecisionModalOpen(false);
            refetch();
        } catch (e) {
            console.error(e);
        }
    };

    const handleVisibilityUpdate = async () => {
        try {
            await updateVisibility({
                variables: {
                    id: caseData.id,
                    visibility: newVisibility
                }
            });
            setVisibilityModalOpen(false);
            refetch();
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddNote = async () => {
        try {
            await addNote({
                variables: {
                    id: caseData.id,
                    note: newNote
                }
            });
            setNewNote('');
            setNoteModalOpen(false);
            refetch();
        } catch (e) {
            console.error(e);
        }
    };

    const handleImageClick = (index: number) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const handleNextImage = () => {
        if (caseData.imageUrls) {
            setCurrentImageIndex((prev) => (prev + 1) % caseData.imageUrls.length);
        }
    };

    const handlePrevImage = () => {
        if (caseData.imageUrls) {
            setCurrentImageIndex((prev) => (prev - 1 + caseData.imageUrls.length) % caseData.imageUrls.length);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Header Navigation */}
            <Button
                startIcon={<ArrowBack />}
                onClick={() => router.push('/disciplinary-cases')}
                sx={{ mb: 2 }}
            >
                Back to Register
            </Button>

            {/* Case Header Card */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderTop: 6, borderColor: 'primary.main', borderRadius: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems="start" spacing={2}>
                    <Box>
                        <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                            <Typography variant="h4" fontWeight="bold">
                                {caseData.caseNumber}
                            </Typography>
                            <CaseStatusBadge status={caseData.status} />
                            {isAdmin && <CaseStatusBadge visibility={caseData.visibility} variant="outlined" />}
                        </Stack>
                        <Typography variant="subtitle1" color="text.secondary">
                            Initiated on {new Date(caseData.initiationDate).toLocaleDateString()}
                        </Typography>
                    </Box>

                    {isAdmin && (
                        <Stack direction="row" spacing={1}>
                            <Button variant="outlined" startIcon={<Edit />} onClick={() => setStatusModalOpen(true)}>
                                Update Status
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Gavel />}
                                onClick={() => setDecisionModalOpen(true)}
                                disabled={caseData.status === 'ACTION_TAKEN' || caseData.status === 'CLOSED'}
                            >
                                Record Decision
                            </Button>
                            {isSuperAdmin && (
                                <IconButton onClick={() => setVisibilityModalOpen(true)} title="Change Visibility">
                                    <Visibility />
                                </IconButton>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Paper>

            <Grid container spacing={3}>
                {/* Left Column: Subject & Case Info */}
                <Grid item xs={12} md={8}>
                    {/* Leader Details */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person /> Subject Leader
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Avatar
                                    src={caseData.leader?.photo}
                                    sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}
                                >
                                    {caseData.leaderName.charAt(0)}
                                </Avatar>
                                <Box>
                                    <Typography variant="h5">{caseData.leaderName}</Typography>
                                    <Typography variant="body1" color="text.secondary">{caseData.position}</Typography>
                                    <Typography variant="body2">{caseData.constituency} | {caseData.leader?.district}</Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>

                    {/* Issue Details */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Description /> Issue Details
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 3 }}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                    <InfoRow label="Category" value={caseData.issueCategory.replace(/_/g, ' ')} />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <InfoRow label="Source" value={caseData.issueSource.replace(/_/g, ' ')} />
                                </Grid>
                                <Grid item xs={12}>
                                    <Divider sx={{ mb: 2 }} />
                                    <Typography variant="caption" color="text.secondary" gutterBottom>
                                        Description
                                    </Typography>
                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {caseData.issueDescription}
                                    </Typography>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>

                    {/* Action & Decision */}
                    {(caseData.actionOutcome || caseData.status === 'ACTION_TAKEN') && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" gutterBottom color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Gavel /> Disciplinary Action
                            </Typography>
                            <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.light', bgcolor: '#fff5f5' }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <InfoRow
                                            label="Outcome"
                                            value={<CaseStatusBadge action={caseData.actionOutcome} />}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <InfoRow
                                            label="Decision Date"
                                            value={caseData.decisionDate ? new Date(caseData.decisionDate).toLocaleDateString() : 'N/A'}
                                        />
                                    </Grid>
                                    {caseData.decisionRationale && (
                                        <Grid item xs={12}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                                Rationale
                                            </Typography>
                                            <Typography variant="body1">
                                                {caseData.decisionRationale}
                                            </Typography>
                                        </Grid>
                                    )}
                                </Grid>
                            </Paper>
                        </Box>
                    )}

                    {/* Evidence & Gallery */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ImageIcon /> Evidence
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            {caseData.imageUrls?.length > 0 ? (
                                <Grid container spacing={2}>
                                    {caseData.imageUrls.map((url: string, index: number) => (
                                        <Grid item xs={6} sm={4} md={3} key={index}>
                                            <Box
                                                component="img"
                                                src={url}
                                                alt={`Evidence ${index + 1}`}
                                                sx={{
                                                    width: '100%',
                                                    height: 120,
                                                    objectFit: 'cover',
                                                    borderRadius: 1,
                                                    cursor: 'pointer',
                                                    '&:hover': { opacity: 0.9 }
                                                }}
                                                onClick={() => handleImageClick(index)}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Typography color="text.secondary" fontStyle="italic">No image evidence attached.</Typography>
                            )}
                        </Paper>
                    </Box>
                </Grid>

                {/* Right Column: Meta & Admin */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={1} sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                            <History fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                            Case Timeline
                        </Typography>
                        <Stack spacing={2} sx={{ mt: 2 }}>
                            <Box sx={{ position: 'relative', pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(caseData.initiationDate).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2" fontWeight="medium">Case Initiated</Typography>
                                <Typography variant="caption" color="text.secondary">By {caseData.initiatedByUser?.name}</Typography>
                            </Box>

                            {caseData.reviewStartDate && (
                                <Box sx={{ position: 'relative', pl: 2, borderLeft: 2, borderColor: 'divider' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(caseData.reviewStartDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium">Review Started</Typography>
                                </Box>
                            )}

                            {caseData.decisionDate && (
                                <Box sx={{ position: 'relative', pl: 2, borderLeft: 2, borderColor: 'error.main' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(caseData.decisionDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="medium" color="error">Decision Recorded</Typography>
                                    <Typography variant="caption" color="text.secondary">By {caseData.decisionAuthorityUser?.name}</Typography>
                                </Box>
                            )}
                        </Stack>
                    </Paper>

                    {isAdmin && (
                        <Box mt={3}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    <Security fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
                                    Internal Notes
                                </Typography>
                                <Button size="small" startIcon={<Add />} onClick={() => setNoteModalOpen(true)}>Add</Button>
                            </Stack>
                            <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto' }}>
                                {caseData.internalNotes ? (
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                                        {caseData.internalNotes}
                                    </Typography>
                                ) : (
                                    <Typography variant="caption" color="text.secondary">No internal notes.</Typography>
                                )}
                            </Paper>
                        </Box>
                    )}
                </Grid>
            </Grid>

            {/* --- Dialogs --- */}

            {/* Update Status Dialog */}
            <Dialog open={statusModalOpen} onClose={() => setStatusModalOpen(false)}>
                <DialogTitle>Update Case Status</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 1 }}>
                    <TextField
                        select
                        fullWidth
                        label="New Status"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        sx={{ mt: 1 }}
                    >
                        {Object.keys(CaseStatus).map((status) => (
                            <MenuItem key={status} value={status}>{status.replace(/_/g, ' ')}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleStatusUpdate} variant="contained" disabled={!newStatus}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* Record Decision Dialog */}
            <Dialog open={decisionModalOpen} onClose={() => setDecisionModalOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Record Final Decision</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            select
                            fullWidth
                            label="Action Outcome"
                            value={decisionData.outcome}
                            onChange={(e) => setDecisionData({ ...decisionData, outcome: e.target.value })}
                        >
                            {Object.keys(ActionOutcome).map((outcome) => (
                                <MenuItem key={outcome} value={outcome}>{outcome.replace(/_/g, ' ')}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            label="Rationale / Comments"
                            value={decisionData.rationale}
                            onChange={(e) => setDecisionData({ ...decisionData, rationale: e.target.value })}
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Effective From"
                                    InputLabelProps={{ shrink: true }}
                                    value={decisionData.effectiveFrom}
                                    onChange={(e) => setDecisionData({ ...decisionData, effectiveFrom: e.target.value })}
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    fullWidth
                                    type="date"
                                    label="Effective To (Optional)"
                                    InputLabelProps={{ shrink: true }}
                                    value={decisionData.effectiveTo}
                                    onChange={(e) => setDecisionData({ ...decisionData, effectiveTo: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDecisionModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleRecordDecision} variant="contained" color="error" disabled={!decisionData.outcome}>
                        Confirm Decision
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Visibility Dialog */}
            <Dialog open={visibilityModalOpen} onClose={() => setVisibilityModalOpen(false)}>
                <DialogTitle>Change Visibility</DialogTitle>
                <DialogContent sx={{ minWidth: 300, pt: 1 }}>
                    <TextField
                        select
                        fullWidth
                        label="Visibility Level"
                        value={newVisibility}
                        onChange={(e) => setNewVisibility(e.target.value)}
                        sx={{ mt: 1 }}
                    >
                        {Object.keys(CaseVisibility).map((v) => (
                            <MenuItem key={v} value={v}>{v.replace(/_/g, ' ')}</MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setVisibilityModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleVisibilityUpdate} variant="contained" disabled={!newVisibility}>Update</Button>
                </DialogActions>
            </Dialog>

            {/* Add Note Dialog */}
            <Dialog open={noteModalOpen} onClose={() => setNoteModalOpen(false)} fullWidth>
                <DialogTitle>Add Internal Note</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        placeholder="Enter confidential internal notes..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        sx={{ mt: 1 }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setNoteModalOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddNote} variant="contained" disabled={!newNote.trim()}>Add Note</Button>
                </DialogActions>
            </Dialog>

            {/* Image Lightbox */}
            <Dialog
                open={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                maxWidth="xl"
                PaperProps={{
                    sx: {
                        bgcolor: 'black',
                        boxShadow: 'none',
                        overflow: 'hidden',
                        m: 0,
                        width: '100%',
                        height: '100%',
                        maxHeight: '100%'
                    }
                }}
            >
                <IconButton
                    onClick={() => setLightboxOpen(false)}
                    sx={{ position: 'absolute', right: 10, top: 10, color: 'white', zIndex: 1 }}
                >
                    <Close />
                </IconButton>

                <Box
                    sx={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    {caseData?.imageUrls && caseData.imageUrls.length > 1 && (
                        <IconButton
                            onClick={handlePrevImage}
                            sx={{ position: 'absolute', left: 20, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                        >
                            <NavigateBefore fontSize="large" />
                        </IconButton>
                    )}

                    {caseData?.imageUrls && (
                        <Box
                            component="img"
                            src={caseData.imageUrls[currentImageIndex]}
                            sx={{
                                maxWidth: '95%',
                                maxHeight: '95%',
                                objectFit: 'contain'
                            }}
                        />
                    )}

                    {caseData?.imageUrls && caseData.imageUrls.length > 1 && (
                        <IconButton
                            onClick={handleNextImage}
                            sx={{ position: 'absolute', right: 20, color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                        >
                            <NavigateNext fontSize="large" />
                        </IconButton>
                    )}

                    {/* Image Counter */}
                    <Typography
                        sx={{
                            position: 'absolute',
                            bottom: 20,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            px: 2,
                            py: 0.5,
                            borderRadius: 4
                        }}
                    >
                        {currentImageIndex + 1} / {caseData?.imageUrls?.length || 0}
                    </Typography>
                </Box>
            </Dialog>

        </Container>
    );
}
