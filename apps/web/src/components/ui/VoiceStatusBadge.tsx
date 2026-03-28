'use client';

import { Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

export type VoiceStatusValue = 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW' | 'RESOLVED';

const STATUS_STYLES: Record<VoiceStatusValue, { labelColor: string; bg: string; border: string }> = {
    PENDING: { labelColor: '#8a5a00', bg: '#fff7e1', border: '#f3d17c' },
    APPROVED: { labelColor: '#0f6b34', bg: '#e8f7ee', border: '#86d7a4' },
    REJECTED: { labelColor: '#a12727', bg: '#fdeaea', border: '#f0aaaa' },
    UNDER_REVIEW: { labelColor: '#0b5ea8', bg: '#e8f2ff', border: '#93bcf6' },
    RESOLVED: { labelColor: '#6a2ca0', bg: '#f3e8ff', border: '#c8a6ef' },
};

export function VoiceStatusBadge({ status }: { status: VoiceStatusValue }) {
    const t = useTranslations('voices');
    const style = STATUS_STYLES[status];

    return (
        <Chip
            label={t(`status.${status}`)}
            size="small"
            sx={{
                fontWeight: 700,
                letterSpacing: '0.02em',
                color: style.labelColor,
                backgroundColor: style.bg,
                border: '1px solid',
                borderColor: style.border,
            }}
        />
    );
}