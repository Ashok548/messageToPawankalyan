'use client';

import { Chip, ChipProps } from '@mui/material';

type StatusType = 'active' | 'archived' | 'completed' | 'on_hold';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
    status: StatusType;
}

const statusConfig: Record<StatusType, { label: string; color: ChipProps['color'] }> = {
    active: { label: 'Active', color: 'success' },
    archived: { label: 'Archived', color: 'default' },
    completed: { label: 'Completed', color: 'primary' },
    on_hold: { label: 'On Hold', color: 'warning' },
};

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Chip
            label={config.label}
            color={config.color}
            size="small"
            {...props}
        />
    );
}
