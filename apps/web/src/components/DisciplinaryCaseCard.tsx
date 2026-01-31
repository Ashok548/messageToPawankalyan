import React from 'react';
import { Box, Card, CardContent, Typography, IconButton, Chip } from '@mui/material';
import { CalendarToday, Visibility, Edit } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CaseStatusBadge } from './ui/case-status-badge';

interface DisciplinaryCase {
    id: string;
    caseNumber: string;
    leaderName: string;
    leaderPhotoUrl?: string;
    position: string;
    constituency?: string;
    district?: string;
    issueCategory: string;
    issueDescription: string;
    status: string;
    actionOutcome?: string;
    visibility: string;
    initiationDate: string;
}

interface DisciplinaryCaseCardProps {
    data: DisciplinaryCase;
    isAdmin?: boolean;
}

export const DisciplinaryCaseCard: React.FC<DisciplinaryCaseCardProps> = ({ data, isAdmin = false }) => {
    const router = useRouter();

    const handleViewDetails = () => {
        router.push(`/disciplinary-cases/${data.id}`);
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        router.push(`/disciplinary-cases/${data.id}/edit`);
    };

    return (
        <Card
            onClick={handleViewDetails}
            sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 1,
                border: '1px solid',
                borderColor: 'divider',
                transition: 'box-shadow 0.2s ease',
                '&:hover': {
                    boxShadow: 3,
                },
            }}
        >
            {/* LEFT SECTION: Avatar (Fixed 140px width on desktop) */}
            <Box
                sx={{
                    width: { xs: '100%', sm: 140 },
                    minWidth: { sm: 140 },
                    height: { xs: 200, sm: 'auto' },
                    bgcolor: '#f5f5f5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                }}
            >
                {data.leaderPhotoUrl ? (
                    <Box
                        component="img"
                        src={data.leaderPhotoUrl}
                        alt={data.leaderName}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            maxHeight: { xs: 200, sm: '100%' },
                        }}
                    />
                ) : (
                    <Typography variant="h3" color="text.secondary" sx={{ fontWeight: 300 }}>
                        {data.leaderName.charAt(0)}
                    </Typography>
                )}
            </Box>

            {/* CENTER & RIGHT SECTIONS: Content */}
            <CardContent sx={{ flex: 1, p: 3, '&:last-child': { pb: 3 } }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                    {/* CENTER: Main Content */}
                    <Box sx={{ flex: 1 }}>
                        {/* Header: Case Number & Status */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5 }}>
                                {data.caseNumber}
                            </Typography>
                            <CaseStatusBadge status={data.status} action={data.actionOutcome} size="small" />
                        </Box>

                        {/* Leader Name & Position */}
                        <Box sx={{ mb: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5, color: '#1a1a1a' }}>
                                {data.leaderName}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                                {data.position}
                                {data.constituency && `, ${data.constituency}`}
                                {data.district && ` (${data.district})`}
                            </Typography>
                        </Box>

                        {/* Issue Category */}
                        <Typography variant="subtitle2" color="primary" sx={{ mb: 1, fontWeight: 600 }}>
                            {data.issueCategory.replace(/_/g, ' ')}
                        </Typography>

                        {/* Issue Description */}
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                lineHeight: 1.6,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                            }}
                        >
                            {data.issueDescription}
                        </Typography>

                        {/* Initiation Date */}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                            <Typography variant="body2" color="text.secondary">
                                {format(new Date(data.initiationDate), 'MMM d, yyyy')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* RIGHT: Actions */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'flex-start', md: 'flex-end' },
                            justifyContent: 'space-between',
                            gap: 1,
                            minWidth: { md: 120 }
                        }}
                    >
                        {/* Visibility Badge (Admin Only) */}
                        {isAdmin && (
                            <CaseStatusBadge visibility={data.visibility} size="small" />
                        )}

                        {/* Action Buttons */}
                        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
                            {isAdmin && (
                                <IconButton
                                    color="primary"
                                    size="small"
                                    onClick={handleEdit}
                                    aria-label="Edit Case"
                                >
                                    <Edit />
                                </IconButton>
                            )}

                            <IconButton
                                color="primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewDetails();
                                }}
                                aria-label="View Details"
                                sx={{
                                    '&:hover': { backgroundColor: 'primary.50' }
                                }}
                            >
                                <Visibility />
                            </IconButton>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
};
