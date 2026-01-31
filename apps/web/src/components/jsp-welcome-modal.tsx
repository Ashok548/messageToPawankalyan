'use client';

import { useEffect, useState } from 'react';
import { Box, Modal, Stack, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnetButton } from './ui/magnet-button';
import ElectricBorder from './ElectricBorder';
import DecryptedText from './DecryptedText';

export function JspWelcomeModal() {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        // Show modal with a slight delay for smooth entrance
        const timer = setTimeout(() => setOpen(true), 300);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = (response: 'yes' | 'no') => {
        // Close the modal when user clicks Yes or No
        setOpen(false);
    };

    return (
        <AnimatePresence>
            {open && (
                <Modal
                    open={open}
                    onClose={() => { }} // Prevent closing by clicking backdrop
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                    closeAfterTransition
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Box
                            sx={{
                                position: 'relative',
                                outline: 'none',
                            }}
                        >
                            {/* Backdrop overlay */}
                            <Box
                                sx={{
                                    position: 'fixed',
                                    inset: 0,
                                    // backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    backdropFilter: 'blur(8px)',
                                    zIndex: -1,
                                }}
                            />

                            <motion.div
                                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 10 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 20,
                                    duration: 0.5
                                }}
                                style={{
                                    width: 'auto',
                                    maxWidth: '100%',
                                }}
                            >
                                <ElectricBorder
                                    color="#E31E24"
                                    speed={1}
                                    chaos={0.12}
                                    thickness={2}
                                    style={{ borderRadius: 24 }}
                                    className="p-[2px]"
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: '#000000',
                                            borderRadius: '22px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            padding: { xs: '24px 16px', sm: '48px 40px' },
                                            width: { xs: 'calc(100vw - 40px)', sm: 'auto' },
                                            minWidth: { sm: '420px' },
                                            maxWidth: '500px',
                                            boxShadow: '0 0 15px rgba(227, 30, 36, 0.1)',
                                        }}
                                    >
                                        <Stack
                                            spacing={4}
                                            alignItems="center"
                                            justifyContent="center"
                                        >
                                            {/* Question Text */}
                                            <Box sx={{ width: '100%', textAlign: 'center' }}>
                                                <Typography
                                                    variant="h5"
                                                    component="div"
                                                    sx={{
                                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                                        fontWeight: 600,
                                                        color: '#E31E24',
                                                        textAlign: 'center',
                                                        letterSpacing: '0.5px',
                                                        lineHeight: 1.4,
                                                        textShadow: '0 0 20px rgba(227, 30, 36, 0.3), 0 0 40px rgba(227, 30, 36, 0.15)',
                                                        filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
                                                        px: { xs: 1, sm: 2 },
                                                    }}
                                                >
                                                    <DecryptedText
                                                        text="Are you a Janasena Party supporter?"
                                                        speed={60}
                                                        animateOn="view"
                                                        maxIterations={10}
                                                        revealDirection="start"
                                                        characters="ABCD1234#$%&!?"
                                                        sequential={true}
                                                    />
                                                </Typography>
                                            </Box>

                                            {/* Buttons */}
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.6, duration: 0.4 }}
                                                style={{ width: '100%' }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={{ xs: 2, sm: 3 }}
                                                    justifyContent="center"
                                                    sx={{
                                                        width: '100%',
                                                        pt: 1,
                                                        flexWrap: 'wrap',
                                                        gap: { xs: 2, sm: 0 }
                                                    }}
                                                >
                                                    <MagnetButton
                                                        variant="primary"
                                                        onClick={() => handleClose('yes')}
                                                    >
                                                        Yes
                                                    </MagnetButton>
                                                    <MagnetButton
                                                        variant="secondary"
                                                        onClick={() => handleClose('no')}
                                                    >
                                                        No
                                                    </MagnetButton>
                                                </Stack>
                                            </motion.div>
                                        </Stack>
                                    </Box>
                                </ElectricBorder>
                            </motion.div>
                        </Box>
                    </motion.div>
                </Modal>
            )}
        </AnimatePresence>
    );
}
