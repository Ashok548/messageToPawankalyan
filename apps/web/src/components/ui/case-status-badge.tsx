'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Chip, Tooltip } from '@mui/material';
import {
    Gavel,
    Warning,
    Block,
    RemoveCircle,
    Cancel,
    AccessTime,
    CheckCircle,
    Help,
    Inventory,
    Visibility,
    VisibilityOff,
    Lock
} from '@mui/icons-material';

// Enum mappings matching the backend
export enum IssueCategory {
    MISCONDUCT = 'MISCONDUCT',
    POLICY_VIOLATION = 'POLICY_VIOLATION',
    ETHICAL_BREACH = 'ETHICAL_BREACH',
    INSUBORDINATION = 'INSUBORDINATION',
    FINANCIAL_IRREGULARITY = 'FINANCIAL_IRREGULARITY',
    PUBLIC_STATEMENT_VIOLATION = 'PUBLIC_STATEMENT_VIOLATION',
    OTHER = 'OTHER',
}

export enum IssueSource {
    INTERNAL_COMPLAINT = 'INTERNAL_COMPLAINT',
    EXTERNAL_COMPLAINT = 'EXTERNAL_COMPLAINT',
    MEDIA_REPORT = 'MEDIA_REPORT',
    PARTY_OBSERVATION = 'PARTY_OBSERVATION',
    LEGAL_NOTICE = 'LEGAL_NOTICE',
}

export enum CaseStatus {
    UNDER_REVIEW = 'UNDER_REVIEW',
    CLARIFICATION_REQUIRED = 'CLARIFICATION_REQUIRED',
    REVIEW_COMPLETED = 'REVIEW_COMPLETED',
    ACTION_TAKEN = 'ACTION_TAKEN',
    CLOSED = 'CLOSED',
    ARCHIVED = 'ARCHIVED',
}

export enum ActionOutcome {
    NO_ACTION = 'NO_ACTION',
    WARNING = 'WARNING',
    TEMPORARY_SUSPENSION = 'TEMPORARY_SUSPENSION',
    PERMANENT_SUSPENSION = 'PERMANENT_SUSPENSION',
    POSITION_REVOKED = 'POSITION_REVOKED',
    MEMBERSHIP_REVOKED = 'MEMBERSHIP_REVOKED',
}

export enum CaseVisibility {
    INTERNAL_ONLY = 'INTERNAL_ONLY',
    PUBLIC = 'PUBLIC',
    RESTRICTED = 'RESTRICTED',
}

const getStatusConfig = (status: string) => {
    switch (status) {
        case CaseStatus.UNDER_REVIEW:
            return { color: 'warning', labelKey: 'status.UNDER_REVIEW', icon: <AccessTime fontSize="small" /> };
        case CaseStatus.CLARIFICATION_REQUIRED:
            return { color: 'info', labelKey: 'status.CLARIFICATION_REQUIRED', icon: <Help fontSize="small" /> };
        case CaseStatus.REVIEW_COMPLETED:
            return { color: 'primary', labelKey: 'status.REVIEW_COMPLETED', icon: <CheckCircle fontSize="small" /> };
        case CaseStatus.ACTION_TAKEN:
            return { color: 'error', labelKey: 'status.ACTION_TAKEN', icon: <Gavel fontSize="small" /> };
        case CaseStatus.CLOSED:
            return { color: 'success', labelKey: 'status.CLOSED', icon: <CheckCircle fontSize="small" /> };
        case CaseStatus.ARCHIVED:
            return { color: 'default', labelKey: 'status.ARCHIVED', icon: <Inventory fontSize="small" /> };
        default:
            return { color: 'default', labelKey: status, icon: undefined };
    }
};

const getActionConfig = (action: string) => {
    switch (action) {
        case ActionOutcome.NO_ACTION:
            return { color: 'success', labelKey: 'action.NO_ACTION', icon: <CheckCircle fontSize="small" /> };
        case ActionOutcome.WARNING:
            return { color: 'warning', labelKey: 'action.WARNING', icon: <Warning fontSize="small" /> };
        case ActionOutcome.TEMPORARY_SUSPENSION:
            return { color: 'error', labelKey: 'action.TEMPORARY_SUSPENSION', icon: <Block fontSize="small" /> };
        case ActionOutcome.PERMANENT_SUSPENSION:
            return { color: 'error', labelKey: 'action.PERMANENT_SUSPENSION', icon: <Block fontSize="small" /> };
        case ActionOutcome.POSITION_REVOKED:
            return { color: 'error', labelKey: 'action.POSITION_REVOKED', icon: <RemoveCircle fontSize="small" /> };
        case ActionOutcome.MEMBERSHIP_REVOKED:
            return { color: 'error', labelKey: 'action.MEMBERSHIP_REVOKED', icon: <Cancel fontSize="small" /> };
        default:
            return { color: 'default', labelKey: action, icon: undefined };
    }
};

const getVisibilityConfig = (visibility: string) => {
    switch (visibility) {
        case CaseVisibility.INTERNAL_ONLY:
            return { color: 'error', labelKey: 'visibility.INTERNAL_ONLY', icon: <VisibilityOff fontSize="small" /> };
        case CaseVisibility.PUBLIC:
            return { color: 'success', labelKey: 'visibility.PUBLIC', icon: <Visibility fontSize="small" /> };
        case CaseVisibility.RESTRICTED:
            return { color: 'warning', labelKey: 'visibility.RESTRICTED', icon: <Lock fontSize="small" /> };
        default:
            return { color: 'default', labelKey: visibility, icon: undefined };
    }
};

interface CaseStatusBadgeProps {
    status?: string | null;
    action?: string | null;
    visibility?: string | null;
    size?: 'small' | 'medium';
    variant?: 'filled' | 'outlined';
}

export const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({
    status,
    action,
    visibility,
    size = 'small',
    variant = 'filled'
}) => {
    const t = useTranslations('caseStatus');

    if (visibility) {
        const config = getVisibilityConfig(visibility);
        const label = config.labelKey.includes('.') ? t(config.labelKey) : config.labelKey;
        return (
            <Chip
                label={label}
                // @ts-ignore
                color={config.color}
                icon={config.icon}
                size={size}
                variant={variant}
                sx={{ fontWeight: 600 }}
            />
        );
    }

    if (action) {
        const config = getActionConfig(action);
        const label = config.labelKey.includes('.') ? t(config.labelKey) : config.labelKey;
        return (
            <Chip
                label={label}
                // @ts-ignore
                color={config.color}
                icon={config.icon}
                size={size}
                variant={variant}
                sx={{ fontWeight: 600 }}
            />
        );
    }

    if (status) {
        const config = getStatusConfig(status);
        const label = config.labelKey.includes('.') ? t(config.labelKey) : config.labelKey;
        return (
            <Chip
                label={label}
                // @ts-ignore
                color={config.color}
                icon={config.icon}
                size={size}
                variant={variant}
                sx={{ fontWeight: 600 }}
            />
        );
    }

    return null;
};
