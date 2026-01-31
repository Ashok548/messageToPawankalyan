'use client';

import { motion } from 'framer-motion';
import { ReactNode, useState, CSSProperties } from 'react';

interface MagnetButtonProps {
    children: ReactNode;
    onClick?: () => void;
    className?: string;
    variant?: 'primary' | 'secondary';
}

export function MagnetButton({
    children,
    onClick,
    className = '',
    variant = 'secondary'
}: MagnetButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    // Janasena brand colors: Maroon (#E31E24) and Black
    const getButtonStyle = (): CSSProperties => {
        const baseStyle: CSSProperties = {
            padding: '12px 32px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: variant === 'primary' ? 700 : 600,
            fontSize: '1rem',
            border: '2px solid',
            transition: 'all 0.3s ease',
        };

        if (variant === 'primary') {
            return {
                ...baseStyle,
                background: isHovered
                    ? 'linear-gradient(to right, #FF2630, #E31E24)'
                    : 'linear-gradient(to right, #E31E24, #B01419)',
                color: '#FFFFFF',
                borderColor: '#E31E24',
                boxShadow: isHovered
                    ? '0 0 20px rgba(227, 30, 36, 0.6), 0 0 40px rgba(227, 30, 36, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2)'
                    : '0 0 10px rgba(227, 30, 36, 0.4), 0 2px 8px rgba(0, 0, 0, 0.15)',
            };
        } else {
            return {
                ...baseStyle,
                background: isHovered ? 'rgba(227, 30, 36, 0.1)' : 'transparent',
                color: '#E31E24',
                borderColor: isHovered ? '#E31E24' : 'rgba(227, 30, 36, 0.6)',
                boxShadow: 'none',
            };
        }
    };

    return (
        <motion.button
            className={className}
            style={getButtonStyle()}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
        >
            {children}
        </motion.button>
    );
}
