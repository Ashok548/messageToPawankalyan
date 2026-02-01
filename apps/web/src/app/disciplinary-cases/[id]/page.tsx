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
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    CircularProgress,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    ArrowBack,
    Gavel,
    Edit,
    Visibility,
    Close,
    NavigateBefore,
    NavigateNext,
    CheckCircle,
    VisibilityOff,
    CalendarToday,
    Person,
    Category,
    Source,
    Security,
    Link,
    OpenInNew
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
    if (error) return <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}><Alert severity="error">Error: {error.message}</Alert></Container>;
    if (!data?.disciplinaryCase) return <Container maxWidth={false} sx={{ py: 4, px: { xs: 2, sm: 3 } }}><Alert severity="warning">Case not found</Alert></Container>;

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
        <Box component="main" sx={{ minHeight: '100vh', backgroundColor: '#f8f9fa', py: { xs: 2, md: 5 } }}>
            <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                {/* Back Navigation & Admin Actions Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => router.push('/disciplinary-cases')}
                        sx={{ color: 'text.secondary', '&:hover': { background: 'transparent', color: 'text.primary' } }}
                    >
                        Back to Register
                    </Button>

                    {/* Admin Actions */}
                    {isAdmin && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Update Status">
                                <IconButton
                                    color="primary"
                                    onClick={() => setStatusModalOpen(true)}
                                    sx={{
                                        bgcolor: 'primary.50',
                                        '&:hover': { bgcolor: 'primary.100' }
                                    }}
                                >
                                    <Edit />
                                </IconButton>
                            </Tooltip>
                            {caseData.status !== 'ACTION_TAKEN' && caseData.status !== 'CLOSED' && (
                                <Tooltip title="Record Decision">
                                    <IconButton
                                        color="error"
                                        onClick={() => setDecisionModalOpen(true)}
                                        sx={{
                                            bgcolor: 'error.50',
                                            '&:hover': { bgcolor: 'error.100' }
                                        }}
                                    >
                                        <Gavel />
                                    </IconButton>
                                </Tooltip>
                            )}
                            {isSuperAdmin && (
                                <Tooltip title="Change Visibility">
                                    <IconButton
                                        color="success"
                                        onClick={() => setVisibilityModalOpen(true)}
                                        sx={{
                                            bgcolor: 'success.50',
                                            '&:hover': { bgcolor: 'success.100' }
                                        }}
                                    >
                                        <Visibility />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </Box>
                    )}
                </Box>

                <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>

                    {/* 1. Header / Identity Section - Left Column Fixed + Right Fluid */}
                    <Grid container spacing={4} alignItems="flex-start">

                        {/* LEFT COLUMN: Photo */}
                        <Grid item xs={12} md={4} lg={3}>
                            <Box
                                sx={{
                                    height: { xs: 300, md: 260 },
                                    width: '100%',
                                    backgroundColor: '#f5f5f5',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    mb: 2
                                }}
                            >
                                {caseData.leaderPhotoUrl ? (
                                    <Box
                                        component="img"
                                        src={caseData.leaderPhotoUrl}
                                        alt={caseData.leaderName}
                                        sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                        }}
                                    />
                                ) : (
                                    <Typography variant="h3" color="text.secondary" sx={{ fontWeight: 300 }}>
                                        {caseData.leaderName.charAt(0)}
                                    </Typography>
                                )}
                            </Box>
                        </Grid>

                        {/* RIGHT COLUMN: Identity & Case Details */}
                        <Grid item xs={12} md={8} lg={9}>
                            <Box>
                                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}>
                                    {caseData.leaderName}
                                </Typography>
                                <Typography variant="subtitle1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    {caseData.position}
                                    {caseData.constituency && ` • ${caseData.constituency}`}
                                    {caseData.district && ` (${caseData.district})`}
                                </Typography>

                                {/* Case Metadata */}
                                <Stack spacing={1} sx={{ mt: 3 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                        <Gavel fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Case Number:
                                            </Typography>
                                            <strong>{caseData.caseNumber}</strong>
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.primary' }}>
                                        <CalendarToday fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Initiated:
                                            </Typography>
                                            {new Date(caseData.initiationDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            Status:
                                        </Typography>
                                        <CaseStatusBadge status={caseData.status} />
                                        {isAdmin && <CaseStatusBadge visibility={caseData.visibility} variant="outlined" />}
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* 2. Case Details Metadata */}
                    <Grid container spacing={6}>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Issue Information
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Category fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                            Category:
                                        </Typography>
                                        {caseData.issueCategory.replace(/_/g, ' ')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Source fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                            Source:
                                        </Typography>
                                        {caseData.issueSource.replace(/_/g, ' ')}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Timeline
                            </Typography>
                            <Stack spacing={1.5}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Person fontSize="small" color="action" />
                                    <Typography variant="body2">
                                        <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                            Initiated by:
                                        </Typography>
                                        {caseData.initiatedByUser?.name || 'N/A'}
                                    </Typography>
                                </Box>
                                {caseData.decisionDate && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <CalendarToday fontSize="small" color="action" />
                                        <Typography variant="body2">
                                            <Typography component="span" variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
                                                Decision Date:
                                            </Typography>
                                            {new Date(caseData.decisionDate).toLocaleDateString()}
                                        </Typography>
                                    </Box>
                                )}
                            </Stack>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 5 }} />

                    {/* 3. Issue Description */}
                    <Box sx={{ maxWidth: '80ch' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
                            Issue Description
                        </Typography>
                        <Typography
                            variant="body1"
                            sx={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.8,
                                color: 'text.primary',
                                fontSize: '1.05rem'
                            }}
                        >
                            {caseData.issueDescription}
                        </Typography>
                    </Box>

                    {/* 4. Evidence Gallery */}
                    {caseData.imageUrls && caseData.imageUrls.length > 0 && (
                        <Box sx={{ mt: 6 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', mb: 2 }}>
                                Evidence Gallery ({caseData.imageUrls.length})
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                {caseData.imageUrls.map((img: string, idx: number) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            width: 120,
                                            height: 120,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            cursor: 'pointer',
                                            '&:hover': { opacity: 0.9 }
                                        }}
                                        onClick={() => handleImageClick(idx)}
                                    >
                                        <Box
                                            component="img"
                                            src={img}
                                            alt={`Evidence ${idx + 1}`}
                                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    )}

                    {/* Source Links */}
                    {caseData.sourceLinks && caseData.sourceLinks.length > 0 && (
                        <>
                            <Divider sx={{ my: 5 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                                    Source References
                                </Typography>
                                <Stack spacing={2}>
                                    {caseData.sourceLinks.map((link: string, idx: number) => (
                                        <Paper
                                            key={idx}
                                            variant="outlined"
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 2,
                                                '&:hover': {
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'primary.50'
                                                }
                                            }}
                                        >
                                            <Link fontSize="small" color="action" />
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Source {idx + 1}
                                                </Typography>
                                                <Typography
                                                    component="a"
                                                    href={link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    variant="body2"
                                                    sx={{
                                                        color: 'primary.main',
                                                        textDecoration: 'none',
                                                        wordBreak: 'break-all',
                                                        '&:hover': { textDecoration: 'underline' },
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    {link}
                                                </Typography>
                                            </Box>
                                            <IconButton
                                                component="a"
                                                href={link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                size="small"
                                                aria-label="Open link"
                                            >
                                                <OpenInNew fontSize="small" />
                                            </IconButton>
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}

                    {/* 5. Action & Decision */}
                    {(caseData.actionOutcome || caseData.status === 'ACTION_TAKEN') && (
                        <>
                            <Divider sx={{ my: 5 }} />
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, color: 'error.main' }}>
                                    Disciplinary Action Taken
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 3, borderColor: 'error.light', bgcolor: '#fff5f5' }}>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                                Outcome
                                            </Typography>
                                            <CaseStatusBadge action={caseData.actionOutcome} />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                                Decision Date
                                            </Typography>
                                            <Typography variant="body1">
                                                {caseData.decisionDate ? new Date(caseData.decisionDate).toLocaleDateString() : 'N/A'}
                                            </Typography>
                                        </Grid>
                                        {caseData.decisionRationale && (
                                            <Grid item xs={12}>
                                                <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                                                    Rationale
                                                </Typography>
                                                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                                    {caseData.decisionRationale}
                                                </Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Paper>
                            </Box>
                        </>
                    )}

                    <Divider sx={{ my: 5 }} />

                    {/* 6. Case Status & Internal Notes */}
                    <Box sx={{ mb: 5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                            Case Status
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={4}>
                                <Chip
                                    label={caseData.status.replace(/_/g, ' ')}
                                    color={caseData.status === 'CLOSED' ? 'success' : 'default'}
                                    variant="outlined"
                                    sx={{ width: '100%', justifyContent: 'flex-start', pl: 1, fontWeight: 600 }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md={8} sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Created:</strong> {new Date(caseData.createdAt).toLocaleDateString()}
                                </Typography>
                                {caseData.updatedAt && (
                                    <Typography variant="body2" color="text.secondary">
                                        <strong>Updated:</strong> {new Date(caseData.updatedAt).toLocaleDateString()}
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>

                    {/* Internal Notes (Admin Only) */}
                    {isAdmin && (
                        <Box sx={{ mt: 4 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Security fontSize="small" />
                                    Internal Notes
                                </Typography>
                                <Button size="small" variant="outlined" onClick={() => setNoteModalOpen(true)}>
                                    Add Note
                                </Button>
                            </Stack>
                            <Paper variant="outlined" sx={{ p: 2, maxHeight: 300, overflowY: 'auto', bgcolor: 'grey.50' }}>
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

                </Paper>

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
                    maxWidth="lg"
                    PaperProps={{
                        sx: { backgroundColor: 'transparent', boxShadow: 'none' }
                    }}
                >
                    <Box sx={{ position: 'relative' }}>
                        <IconButton
                            onClick={() => setLightboxOpen(false)}
                            sx={{ position: 'absolute', top: -40, right: 0, color: 'white' }}
                        >
                            <Close />
                        </IconButton>

                        {caseData?.imageUrls && caseData.imageUrls.length > 1 && (
                            <IconButton
                                onClick={handlePrevImage}
                                sx={{ position: 'absolute', left: -50, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                            >
                                <NavigateBefore fontSize="large" />
                            </IconButton>
                        )}

                        <Box
                            component="img"
                            src={caseData?.imageUrls?.[currentImageIndex] || ''}
                            sx={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 1 }}
                        />

                        {caseData?.imageUrls && caseData.imageUrls.length > 1 && (
                            <IconButton
                                onClick={handleNextImage}
                                sx={{ position: 'absolute', right: -50, top: '50%', transform: 'translateY(-50%)', color: 'white', bgcolor: 'rgba(0,0,0,0.5)', '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' } }}
                            >
                                <NavigateNext fontSize="large" />
                            </IconButton>
                        )}

                        {caseData?.imageUrls && caseData.imageUrls.length > 1 && (
                            <Typography
                                sx={{
                                    position: 'absolute',
                                    bottom: -30,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    color: 'white',
                                    bgcolor: 'rgba(0,0,0,0.5)',
                                    px: 2,
                                    py: 0.5,
                                    borderRadius: 4
                                }}
                            >
                                {currentImageIndex + 1} / {caseData.imageUrls.length}
                            </Typography>
                        )}
                    </Box>
                </Dialog>

            </Container>
        </Box>
    );
}
