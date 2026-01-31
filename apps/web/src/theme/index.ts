'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// ============================================
// Color Palette - Neutral & Minimal
// ============================================

const palette = {
    primary: {
        main: '#2563eb', // Clean blue
        light: '#60a5fa',
        dark: '#1e40af',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#64748b', // Slate gray
        light: '#94a3b8',
        dark: '#475569',
        contrastText: '#ffffff',
    },
    error: {
        main: '#ef4444',
        light: '#f87171',
        dark: '#dc2626',
    },
    warning: {
        main: '#f59e0b',
        light: '#fbbf24',
        dark: '#d97706',
    },
    success: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
    },
    info: {
        main: '#3b82f6',
        light: '#60a5fa',
        dark: '#2563eb',
    },
    background: {
        default: '#f8fafc', // Very light gray
        paper: '#ffffff',
    },
    text: {
        primary: '#0f172a', // Almost black
        secondary: '#64748b', // Slate gray
        disabled: '#cbd5e1',
    },
    divider: '#e2e8f0',
    grey: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
    },
};

// ============================================
// Typography - Clean & Readable
// ============================================

const typography = {
    fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
    ].join(','),
    h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
    },
    h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
    },
    h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.3,
    },
    h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
    },
    h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.4,
    },
    h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.5,
    },
    body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
    },
    body2: {
        fontSize: '0.875rem',
        lineHeight: 1.6,
    },
    button: {
        textTransform: 'none' as const,
        fontWeight: 500,
    },
    caption: {
        fontSize: '0.75rem',
        lineHeight: 1.5,
    },
    overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.08em',
    },
};

// ============================================
// Spacing & Breakpoints
// ============================================

const spacing = 8; // Base unit: 8px

const breakpoints = {
    values: {
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
    },
};

// ============================================
// Shape - Rounded Corners
// ============================================

const shape = {
    borderRadius: 12, // Consistent rounded corners
};

// ============================================
// Shadows - Reduced Elevation
// ============================================

const shadows = [
    'none',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)', // sm
    '0 1px 3px 0 rgb(0 0 0 / 0.1)', // md
    '0 4px 6px -1px rgb(0 0 0 / 0.1)', // lg
    '0 10px 15px -3px rgb(0 0 0 / 0.1)', // xl
    '0 20px 25px -5px rgb(0 0 0 / 0.1)', // 2xl
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1)',
] as any;

// ============================================
// Component Overrides
// ============================================

const components = {
    MuiButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                padding: '10px 20px',
                fontSize: '0.875rem',
                fontWeight: 500,
                boxShadow: 'none',
                '&:hover': {
                    boxShadow: 'none',
                },
            },
            contained: {
                '&:hover': {
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                },
            },
            outlined: {
                borderWidth: '1.5px',
                '&:hover': {
                    borderWidth: '1.5px',
                },
            },
            sizeSmall: {
                padding: '6px 16px',
                fontSize: '0.8125rem',
            },
            sizeLarge: {
                padding: '12px 24px',
                fontSize: '0.9375rem',
            },
        },
    },
    MuiCard: {
        styleOverrides: {
            root: {
                borderRadius: 12,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                border: '1px solid #e2e8f0',
            },
        },
    },
    MuiPaper: {
        styleOverrides: {
            root: {
                borderRadius: 12,
            },
            outlined: {
                border: '1px solid #e2e8f0',
            },
        },
    },
    MuiTextField: {
        styleOverrides: {
            root: {
                '& .MuiOutlinedInput-root': {
                    borderRadius: 8,
                    '& fieldset': {
                        borderColor: '#e2e8f0',
                    },
                    '&:hover fieldset': {
                        borderColor: '#cbd5e1',
                    },
                },
            },
        },
    },
    MuiChip: {
        styleOverrides: {
            root: {
                borderRadius: 6,
                fontWeight: 500,
            },
        },
    },
    MuiAppBar: {
        styleOverrides: {
            root: {
                boxShadow: 'none',
                borderBottom: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
            },
        },
    },
    MuiDrawer: {
        styleOverrides: {
            paper: {
                borderRight: '1px solid #e2e8f0',
                boxShadow: 'none',
            },
        },
    },
    MuiListItemButton: {
        styleOverrides: {
            root: {
                borderRadius: 8,
                marginBottom: 4,
                '&.Mui-selected': {
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    '&:hover': {
                        backgroundColor: '#dbeafe',
                    },
                },
            },
        },
    },
    MuiTableCell: {
        styleOverrides: {
            root: {
                borderColor: '#e2e8f0',
            },
            head: {
                fontWeight: 600,
                backgroundColor: '#f8fafc',
            },
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: {
                borderRadius: 8,
            },
        },
    },
    MuiDialog: {
        styleOverrides: {
            paper: {
                borderRadius: 12,
            },
        },
    },
};

// ============================================
// Create Theme
// ============================================

const themeOptions: ThemeOptions = {
    palette,
    typography,
    spacing,
    breakpoints,
    shape,
    shadows,
    components,
};

export const theme = createTheme(themeOptions);
