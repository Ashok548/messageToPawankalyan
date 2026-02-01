import { Box, Typography } from '@mui/material';
import Image from 'next/image';

interface SpinnerProps {
    message?: string;
    fullScreen?: boolean;
    size?: number;
    className?: string;
}

export function Spinner({ message, fullScreen = false, size = 48, className }: SpinnerProps) {
    return (
        <Box
            className={className}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                ...(fullScreen && {
                    minHeight: '100vh',
                    width: '100%',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    zIndex: 9999,
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(4px)',
                }),
                ...(!fullScreen && {
                    py: 4,
                    width: '100%',
                    height: '100%'
                }),
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    width: '12rem',
                    height: '12rem',
                }}
            >
                <Image
                    src="/assets/spinner.svg"
                    alt="Loading..."
                    width={200}
                    height={200}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                    }}
                    priority // Load critical asset immediately
                />
            </Box>

            {/* {message && (
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    {message}
                </Typography>
            )} */}
        </Box>
    );
}
