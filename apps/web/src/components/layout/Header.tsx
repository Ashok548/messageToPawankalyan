'use client';

import { Box, Container, Link as MuiLink, Stack, Typography, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Avatar, Menu, MenuItem } from '@mui/material';
import Link from 'next/link';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/use-auth';

/**
 * Compact Header Component with Hamburger Menu
 * 
 * Height Control Strategy:
 * - Desktop: 48px (explicit height on outer Box)
 * - Mobile: 52px (slightly taller for touch targets)
 * - No AppBar component (causes height bloat)
 * - Minimal vertical padding (py: 0)
 * - Typography sized to fit within height constraint
 */
export default function Header() {
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [isJanaSenaSupporter, setIsJanaSenaSupporter] = useState<boolean>(true); // Default to true
    const { user, isAuthenticated, logout } = useAuth();
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
    const isSuperAdmin = user?.role === 'SUPER_ADMIN';

    // Check localStorage for user's choice
    useEffect(() => {
        const storedChoice = localStorage.getItem('isJanaSenaSupporter');
        if (storedChoice !== null) {
            setIsJanaSenaSupporter(storedChoice === 'yes');
        }
    }, []);

    const toggleDrawer = (open: boolean) => () => {
        setDrawerOpen(open);
    };

    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        logout();
        handleProfileMenuClose();
        router.push('/');
    };

    // Define all menu items
    const allMenuItems = [
        { label: 'Why Join JanaSena', href: '/why-join-janasena', showForAll: true },
        { label: 'Message to Janasainiks', href: '/message-to-janasainiks', showForAll: false },
        { label: 'Atrocities to Janasainiks', href: '/atrocities-to-janasainiks', showForAll: false },
        { label: 'Leaders Society Needs', href: '/leaders-society-needs', showForAll: true },
        { label: 'Social Media Warriors', href: '/social-media-warriors', showForAll: false },
        { label: 'Governance Highlights', href: '/governance-highlights', showForAll: true },
        { label: 'Disciplinary Register', href: '/disciplinary-cases', showForAll: true },
        { label: 'Voices', href: '/voices', showForAll: true },
        ...(isSuperAdmin ? [{ label: 'User Management', href: '/user-management', showForAll: true }] : []),
    ];

    // Filter menu items based on user's supporter status
    const menuItems = allMenuItems.filter(item =>
        item.showForAll || isJanaSenaSupporter
    );

    return (
        <>
            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1100,
                    backgroundColor: '#ffffff',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    height: { xs: 52, sm: 48 }, // Explicit height control
                }}
            >
                <Container
                    maxWidth={false}
                    sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: { xs: 2, sm: 3 },
                        py: 0, // No vertical padding
                    }}
                >
                    {/* Left: Hamburger Menu */}
                    <IconButton
                        onClick={toggleDrawer(true)}
                        sx={{
                            mr: 2,
                            color: 'text.primary',
                            '&:hover': {
                                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                            },
                        }}
                        aria-label="Open menu"
                    >
                        <MenuIcon />
                    </IconButton>

                    {/* Center: Logo & Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden' }}>
                        <Box
                            component="img"
                            src="/assets/logo.svg"
                            alt="PK Logo"
                            sx={{
                                width: { xs: 24, sm: 28 },
                                height: { xs: 24, sm: 28 },
                                mr: 1.5,
                                flexShrink: 0,
                                objectFit: 'contain'
                            }}
                        />
                        <Box
                            component="h1"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: { xs: 0.3, sm: 0.5 },
                                fontSize: { xs: 15, sm: 17 },
                                fontWeight: 800,
                                lineHeight: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                m: 0,
                                textTransform: 'uppercase',
                                letterSpacing: '0.03em',
                            }}
                        >
                            {/* "MESSAGE" - Black start of gradient */}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(90deg, #000 0%, #333 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                MESSAGE
                            </Box>

                            {/* "2" - Transition gradient */}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(90deg, #555 0%, #d32f2f 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                2
                            </Box>

                            {/* "PAWAN KALYAN" - Red end of gradient */}
                            <Box
                                component="span"
                                sx={{
                                    background: 'linear-gradient(90deg, #d32f2f 0%, #b71c1c 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                    textShadow: 'none', // Remove shadow for gradient
                                }}
                            >
                                PAWAN KALYAN
                            </Box>
                        </Box>
                    </Box>

                    {/* Right: Navigation Links */}
                    <Stack
                        direction="row"
                        spacing={{ xs: 1, sm: 2 }}
                        alignItems="center"
                    >


                        {/* Conditional: Login Link or Profile Icon */}
                        {isAuthenticated ? (
                            <IconButton
                                onClick={handleProfileMenuOpen}
                                sx={{
                                    color: 'text.primary',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                                aria-label="Profile menu"
                            >
                                <AccountCircleIcon />
                            </IconButton>
                        ) : (
                            <MuiLink
                                component={Link}
                                href="/login"
                                underline="none"
                                sx={{
                                    fontSize: { xs: 14, sm: 15 },
                                    fontWeight: 500,
                                    color: 'primary.main',
                                    px: 1.5,
                                    py: 0.5,
                                    borderRadius: 0.5,
                                    transition: 'all 0.15s ease',
                                    lineHeight: 1,
                                    whiteSpace: 'nowrap',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                        color: 'primary.dark',
                                    },
                                }}
                            >
                                Login
                            </MuiLink>
                        )}
                    </Stack>
                </Container>
            </Box>

            {/* Hamburger Menu Drawer */}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer(false)}
                sx={{
                    '& .MuiDrawer-paper': {
                        width: 280,
                    },
                }}
            >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Menu
                    </Typography>
                    <IconButton onClick={toggleDrawer(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <List>
                    {menuItems.map((item) => (
                        <ListItem key={item.href} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                onClick={toggleDrawer(false)}
                                sx={{
                                    py: 1.5,
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            >
                                <ListItemText
                                    primary={item.label}
                                    primaryTypographyProps={{
                                        fontSize: 15,
                                        fontWeight: 500,
                                    }}
                                />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Profile Menu */}
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleProfileMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
        </>
    );
}
