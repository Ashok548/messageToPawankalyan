'use client';

import { Box, Typography } from '@mui/material';
import { useQuery } from '@apollo/client';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { GET_VISITOR_STATS } from '@/graphql/visitor-stats';

export function Footer() {
    const { data } = useQuery(GET_VISITOR_STATS, {
        pollInterval: 30000, // Refresh every 30 seconds
    });

    const visitorCount = data?.getVisitorStats?.totalVisitors || 0;

    return (
        <Box
            component="footer"
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(227, 30, 36, 0.3)',
                py: 0.75,
                px: 2,
                zIndex: 1000,
                boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: 'wrap',
                }}
            >
                {/* Visitor Counter */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <VisibilityIcon
                        sx={{
                            fontSize: 16,
                            color: '#E31E24',
                            animation: 'pulse 2s ease-in-out infinite',
                            '@keyframes pulse': {
                                '0%, 100%': { opacity: 1 },
                                '50%': { opacity: 0.6 },
                            },
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#fff',
                            fontSize: '0.813rem',
                            fontWeight: 500,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Visitors: <Box component="span" sx={{ color: '#E31E24', fontWeight: 700 }}>
                            {visitorCount.toLocaleString()}
                        </Box>
                    </Typography>
                </Box>

                {/* Divider for larger screens */}
                <Box
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        height: '14px',
                        width: '1px',
                        bgcolor: 'rgba(255,255,255,0.3)'
                    }}
                />

                {/* Disclaimer */}
                <Typography
                    variant="caption"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.75rem',
                        textAlign: 'center',
                    }}
                >
                    Disclaimer: This is a volunteer initiative, not an official JSP website.
                </Typography>
            </Box>
        </Box>
    );
}
