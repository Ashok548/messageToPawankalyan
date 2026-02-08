'use client';

import { Chip, ChipProps } from '@mui/material';
import { useTranslations } from 'next-intl';

type StatusType = 'active' | 'archived' | 'completed' | 'on_hold';

interface StatusBadgeProps extends Omit<ChipProps, 'color'> {
    status: StatusType;
}

const statusConfig: Record<StatusType, { labelKey: string; color: ChipProps['color'] }> = {
    active: { labelKey: 'status.active', color: 'success' },
    archived: { labelKey: 'status.archived', color: 'default' },
    completed: { labelKey: 'status.completed', color: 'primary' },
    on_hold: { labelKey: 'status.onHold', color: 'warning' },
};

export function StatusBadge({ status, ...props }: StatusBadgeProps) {
    const t = useTranslations('ui');
    const config = statusConfig[status];

    return (
        <Chip
            label={t(config.labelKey)}
            color={config.color}
            size="small"
            {...props}
        />
    );
}
