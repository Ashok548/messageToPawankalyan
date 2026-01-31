import React from 'react';
import { Box, Card, CardContent, Typography, Stack, Avatar, Divider, Button } from '@mui/material';
import { CalendarToday, Person, Description, ArrowForward } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CaseStatusBadge, CaseVisibility } from './ui/case-status-badge';

interface DisciplinaryCase {
    id: string;
    caseNumber: string;
    leaderName: string;
    position: string;
    issueCategory: string;
    issueDescription: string;
    status: string;
    actionOutcome?: string;
    visiblity: string;
    initiationDate: string;
    leader: {
        photo?: string;
    };
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

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                },
                position: 'relative',
                overflow: 'visible'
            }}
        >
            {/* Visibility Badge for Admins */}
            {isAdmin && (
                <Box sx={{ position: 'absolute', top: -10, right: 10, zIndex: 1 }}>
                    <CaseStatusBadge visibility={data.visiblity} size="small" />
                </Box>
            )}

            <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Header with Case ID and Status */}
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                        {data.caseNumber}
                    </Typography>
                    <CaseStatusBadge status={data.status} action={data.actionOutcome} size="small" />
                </Stack>

                {/* Leader Info */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                        src={data.leader?.photo}
                        alt={data.leaderName}
                        sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}
                    >
                        {data.leaderName.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" component="div" sx={{ lineHeight: 1.2 }}>
                            {data.leaderName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {data.position}
                        </Typography>
                    </Box>
                </Stack>

                <Divider />

                {/* Issue Details */}
                <Box>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                        {data.issueCategory.replace(/_/g, ' ')}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {data.issueDescription}
                    </Typography>
                </Box>

                {/* Footer with Date and Action */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto" pt={1}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <CalendarToday fontSize="small" color="action" sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" color="text.secondary">
                            {format(new Date(data.initiationDate), 'MMM d, yyyy')}
                        </Typography>
                    </Stack>

                    <Button
                        size="small"
                        endIcon={<ArrowForward fontSize="small" />}
                        onClick={handleViewDetails}
                    >
                        View Details
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};
