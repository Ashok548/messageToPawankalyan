'use client';

import { useQuery, useMutation } from '@apollo/client';
import {
    GET_PUBLIC_ISSUES,
    GET_PUBLIC_ISSUE,
    GET_ALL_PUBLIC_ISSUES,
    CREATE_PUBLIC_ISSUE,
    UPDATE_PUBLIC_ISSUE,
    UPDATE_PUBLIC_ISSUE_STATUS,
    TOGGLE_PUBLIC_ISSUE_SUPPORT,
    DELETE_PUBLIC_ISSUE,
} from '@/graphql/public-issues';
import { GET_ANALYSES, CREATE_ANALYSIS } from '@/graphql/analysis';

// ============================================
// Query Hooks
// ============================================

export function usePublicIssues(filter?: Record<string, unknown>, pagination?: { take: number; skip: number }) {
    const { data, loading, error, refetch } = useQuery(GET_PUBLIC_ISSUES, {
        variables: { filter, pagination },
        fetchPolicy: 'cache-and-network',
    });

    return {
        issues: data?.publicIssues ?? [],
        loading,
        error,
        refetch,
    };
}

export function usePublicIssue(id: string) {
    const { data, loading, error, refetch } = useQuery(GET_PUBLIC_ISSUE, {
        variables: { id },
        fetchPolicy: 'cache-and-network',
        skip: !id,
    });

    return {
        issue: data?.publicIssue,
        loading,
        error,
        refetch,
    };
}

export function useAllPublicIssues(
    filter?: Record<string, unknown>,
    pagination?: { take: number; skip: number },
    options?: { skip?: boolean },
) {
    const { data, loading, error, refetch } = useQuery(GET_ALL_PUBLIC_ISSUES, {
        variables: { filter, pagination },
        fetchPolicy: 'cache-and-network',
        skip: options?.skip,
    });

    return {
        issues: data?.allPublicIssues ?? [],
        loading,
        error,
        refetch,
    };
}

export function useIssueAnalyses(issueId: string) {
    const { data, loading, error, refetch } = useQuery(GET_ANALYSES, {
        variables: { issueId },
        fetchPolicy: 'cache-and-network',
        skip: !issueId,
    });

    return {
        analyses: data?.analyses ?? [],
        loading,
        error,
        refetch,
    };
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreatePublicIssue() {
    const [createPublicIssue, { loading, error }] = useMutation(CREATE_PUBLIC_ISSUE);

    return { createPublicIssue, loading, error };
}

export function useUpdatePublicIssue() {
    const [updatePublicIssue, { loading, error }] = useMutation(UPDATE_PUBLIC_ISSUE);

    return { updatePublicIssue, loading, error };
}

export function useUpdatePublicIssueStatus() {
    const [updatePublicIssueStatus, { loading, error }] = useMutation(UPDATE_PUBLIC_ISSUE_STATUS);

    return { updatePublicIssueStatus, loading, error };
}

export function useTogglePublicIssueSupport() {
    const [toggleSupport, { loading, error }] = useMutation(TOGGLE_PUBLIC_ISSUE_SUPPORT);

    return { toggleSupport, loading, error };
}

export function useDeletePublicIssue() {
    const [deletePublicIssue, { loading, error }] = useMutation(DELETE_PUBLIC_ISSUE, {
        update(cache, { data }) {
            if (!data?.deletePublicIssue) return;
            cache.evict({
                id: cache.identify({ __typename: 'PublicIssue', id: data.deletePublicIssue.id }),
            });
            cache.gc();
        },
    });

    return { deletePublicIssue, loading, error };
}

export function useCreateAnalysis() {
    const [createAnalysis, { loading, error }] = useMutation(CREATE_ANALYSIS);

    return { createAnalysis, loading, error };
}
