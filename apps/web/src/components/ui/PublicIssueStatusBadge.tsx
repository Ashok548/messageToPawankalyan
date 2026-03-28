'use client';

import { Chip } from '@mui/material';
import { useTranslations } from 'next-intl';

export type PublicIssueStatusValue = 'PENDING' | 'APPROVED' | 'TAKEN_UP' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';

const STATUS_STYLES: Record<PublicIssueStatusValue, { labelColor: string; bg: string; border: string }> = {
    PENDING:     { labelColor: '#8a5a00', bg: '#fff7e1', border: '#f3d17c' },
    APPROVED:    { labelColor: '#0f6b34', bg: '#e8f7ee', border: '#86d7a4' },
    TAKEN_UP:    { labelColor: '#0d5c8c', bg: '#e3f2fd', border: '#90caf9' },
    IN_PROGRESS: { labelColor: '#6a3d9a', bg: '#f3e8ff', border: '#ce93d8' },
    RESOLVED:    { labelColor: '#2e6b3e', bg: '#d4edda', border: '#7ecba3' },
    REJECTED:    { labelColor: '#a12727', bg: '#fdeaea', border: '#f0aaaa' },
};

export function PublicIssueStatusBadge({ status }: { status: PublicIssueStatusValue }) {
    const t = useTranslations('publicIssues');
    const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;

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