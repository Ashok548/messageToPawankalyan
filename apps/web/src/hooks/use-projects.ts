'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_PROJECTS, GET_PROJECT_BY_ID } from '@/graphql/queries';

import { CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT } from '@/graphql/mutations';

interface Project {
    id: string;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
}

interface GetProjectsQuery {
    projects: Project[];
}

interface CreateProjectMutation {
    createProject: Project;
}

// ============================================
// Example: Query Hook Usage
// ============================================

export function useProjects(status?: string) {
    const { data, loading, error, refetch } = useQuery(GET_PROJECTS, {
        variables: { status },
        // Cache policy options:
        // - 'cache-first': Use cache, fetch if not cached (default)
        // - 'cache-and-network': Show cached data immediately, fetch fresh data
        // - 'network-only': Always fetch from network, update cache
        // - 'no-cache': Fetch from network, don't cache
        // - 'cache-only': Only use cache, error if not cached
        fetchPolicy: 'cache-and-network',
    });

    return {
        projects: data?.projects || [],
        loading,
        error,
        refetch,
    };
}

export function useProject(id: string) {
    const { data, loading, error } = useQuery(GET_PROJECT_BY_ID, {
        variables: { id },
        skip: !id, // Skip query if no ID provided
    });

    return {
        project: data?.project,
        loading,
        error,
    };
}

// ============================================
// Example: Mutation Hook Usage
// ============================================

export function useCreateProject() {
    const [createProject, { loading, error }] = useMutation(CREATE_PROJECT, {
        // Option 1: Refetch queries after mutation
        refetchQueries: [{ query: GET_PROJECTS }],

        // Option 2: Update cache manually (more efficient)
        update(cache, { data }) {
            if (!data?.createProject) return;

            // Read existing projects from cache
            const existingProjects = cache.readQuery<GetProjectsQuery>({
                query: GET_PROJECTS,
            });

            // Write updated projects to cache
            if (existingProjects) {
                cache.writeQuery({
                    query: GET_PROJECTS,
                    data: {
                        projects: [...existingProjects.projects, data.createProject],
                    },
                });
            }
        },

        // Optimistic response (optional - shows UI update immediately)
        // optimisticResponse: (variables) => ({
        //   createProject: {
        //     __typename: 'Project',
        //     id: 'temp-id',
        //     name: variables.input.name,
        //     description: variables.input.description,
        //     status: 'ACTIVE',
        //     createdAt: new Date().toISOString(),
        //     owner: null,
        //   },
        // }),
    });

    return {
        createProject,
        loading,
        error,
    };
}

export function useUpdateProject() {
    const [updateProject, { loading, error }] = useMutation(UPDATE_PROJECT, {
        // No need to refetch - Apollo automatically updates cache
        // because mutation returns object with id
    });

    return {
        updateProject,
        loading,
        error,
    };
}

export function useDeleteProject() {
    const [deleteProject, { loading, error }] = useMutation(DELETE_PROJECT, {
        update(cache, { data }) {
            if (!data?.deleteProject) return;

            // Remove deleted project from cache
            cache.evict({
                id: cache.identify({
                    __typename: 'Project',
                    id: data.deleteProject.id,
                }),
            });
            cache.gc(); // Garbage collect orphaned objects
        },
    });

    return {
        deleteProject,
        loading,
        error,
    };
}
