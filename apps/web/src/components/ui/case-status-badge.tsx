import React from 'react';
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
            return { color: 'warning', label: 'Under Review', icon: <AccessTime fontSize="small" /> };
        case CaseStatus.CLARIFICATION_REQUIRED:
            return { color: 'info', label: 'Clarification Needed', icon: <Help fontSize="small" /> };
        case CaseStatus.REVIEW_COMPLETED:
            return { color: 'primary', label: 'Review Completed', icon: <CheckCircle fontSize="small" /> };
        case CaseStatus.ACTION_TAKEN:
            return { color: 'error', label: 'Action Taken', icon: <Gavel fontSize="small" /> };
        case CaseStatus.CLOSED:
            return { color: 'success', label: 'Closed', icon: <CheckCircle fontSize="small" /> };
        case CaseStatus.ARCHIVED:
            return { color: 'default', label: 'Archived', icon: <Inventory fontSize="small" /> };
        default:
            return { color: 'default', label: status, icon: undefined };
    }
};

const getActionConfig = (action: string) => {
    switch (action) {
        case ActionOutcome.NO_ACTION:
            return { color: 'success', label: 'No Action Taken', icon: <CheckCircle fontSize="small" /> };
        case ActionOutcome.WARNING:
            return { color: 'warning', label: 'Warning Issued', icon: <Warning fontSize="small" /> };
        case ActionOutcome.TEMPORARY_SUSPENSION:
            return { color: 'error', label: 'Temporary Suspension', icon: <Block fontSize="small" /> };
        case ActionOutcome.PERMANENT_SUSPENSION:
            return { color: 'error', label: 'Permanent Suspension', icon: <Block fontSize="small" /> };
        case ActionOutcome.POSITION_REVOKED:
            return { color: 'error', label: 'Position Revoked', icon: <RemoveCircle fontSize="small" /> };
        case ActionOutcome.MEMBERSHIP_REVOKED:
            return { color: 'error', label: 'Membership Revoked', icon: <Cancel fontSize="small" /> };
        default:
            return { color: 'default', label: action, icon: undefined };
    }
};

const getVisibilityConfig = (visibility: string) => {
    switch (visibility) {
        case CaseVisibility.INTERNAL_ONLY:
            return { color: 'error', label: 'Internal Only', icon: <VisibilityOff fontSize="small" /> };
        case CaseVisibility.PUBLIC:
            return { color: 'success', label: 'Public', icon: <Visibility fontSize="small" /> };
        case CaseVisibility.RESTRICTED:
            return { color: 'warning', label: 'Restricted', icon: <Lock fontSize="small" /> };
        default:
            return { color: 'default', label: visibility, icon: undefined };
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
    if (visibility) {
        const config = getVisibilityConfig(visibility);
        return (
            <Chip
                label={config.label}
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
        return (
            <Chip
                label={config.label}
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
        return (
            <Chip
                label={config.label}
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
