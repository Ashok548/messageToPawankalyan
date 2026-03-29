'use client';

const SUPPORTED_ISSUE_IDS_KEY = 'supportedPublicIssueIds';
const ANONYMOUS_SUPPORTER_KEY = 'publicIssueAnonymousSupporterKey';

function readSupportedIssueIds(): string[] {
    if (typeof window === 'undefined') {
        return [];
    }

    try {
        const rawValue = window.localStorage.getItem(SUPPORTED_ISSUE_IDS_KEY);
        if (!rawValue) {
            return [];
        }

        const parsed = JSON.parse(rawValue);
        return Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === 'string') : [];
    } catch {
        return [];
    }
}

function writeSupportedIssueIds(issueIds: string[]): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.localStorage.setItem(SUPPORTED_ISSUE_IDS_KEY, JSON.stringify(Array.from(new Set(issueIds))));
}

export function getSupportedPublicIssueIds(): string[] {
    return readSupportedIssueIds();
}

export function hasSupportedPublicIssue(issueId: string): boolean {
    return readSupportedIssueIds().includes(issueId);
}

export function markPublicIssueSupported(issueId: string): string[] {
    const nextIssueIds = Array.from(new Set([...readSupportedIssueIds(), issueId]));
    writeSupportedIssueIds(nextIssueIds);
    return nextIssueIds;
}

export function getAnonymousPublicIssueSupporterKey(): string {
    if (typeof window === 'undefined') {
        return 'server';
    }

    const existingKey = window.localStorage.getItem(ANONYMOUS_SUPPORTER_KEY);
    if (existingKey) {
        return existingKey;
    }

    const nextKey = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

    window.localStorage.setItem(ANONYMOUS_SUPPORTER_KEY, nextKey);
    return nextKey;
}