'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Box, Container, Typography, Alert, Snackbar } from '@mui/material';
import { useRouter } from 'next/navigation';
import { GET_ALL_USERS, UPDATE_USER_ROLE } from '@/graphql/user-management';
import { UserManagementTable } from './components/UserManagementTable';
import { RoleChangeDialog } from './components/RoleChangeDialog';
import { Spinner } from '@/components/ui/spinner';
import { useAuth } from '@/hooks/use-auth';

interface User {
    id: string;
    name: string;
    email?: string;
    mobile: string;
    role: string;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}

/**
 * Inner component that handles the actual user management logic.
 * Only rendered when user is confirmed to be SUPER_ADMIN.
 */
function UserManagementContent() {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [newRole, setNewRole] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    const { data, loading, error, refetch } = useQuery(GET_ALL_USERS);

    const [updateUserRole] = useMutation(UPDATE_USER_ROLE, {
        onCompleted: () => {
            setSnackbar({
                open: true,
                message: 'User role updated successfully!',
                severity: 'success',
            });
            setDialogOpen(false);
            refetch();
        },
        onError: (error) => {
            setSnackbar({
                open: true,
                message: error.message || 'Failed to update user role',
                severity: 'error',
            });
            setDialogOpen(false);
        },
    });

    const handleRoleChange = (userId: string, role: string) => {
        const user = data?.getAllUsers.find((u: User) => u.id === userId);
        if (user && user.role !== role) {
            setSelectedUser(user);
            setNewRole(role);
            setDialogOpen(true);
        }
    };

    const handleConfirmRoleChange = async () => {
        if (selectedUser && newRole) {
            await updateUserRole({
                variables: {
                    input: {
                        userId: selectedUser.id,
                        role: newRole,
                    },
                },
            });
        }
    };

    const handleCancelRoleChange = () => {
        setDialogOpen(false);
        setSelectedUser(null);
        setNewRole('');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    if (loading) {
        return <Spinner fullScreen />;
    }

    if (error) {
        return (
            <Box
                component="main"
                sx={{
                    minHeight: {
                        xs: 'calc(100vh - 52px)',
                        sm: 'calc(100vh - 48px)',
                    },
                    backgroundColor: '#fafafa',
                    py: { xs: 4, sm: 6 },
                }}
            >
                <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                    <Alert severity="error">
                        <Typography variant="body1">
                            Error loading users: {error.message}
                        </Typography>
                    </Alert>
                </Container>
            </Box>
        );
    }

    const users: User[] = data?.getAllUsers || [];

    return (
        <>
            <Box
                component="main"
                sx={{
                    minHeight: {
                        xs: 'calc(100vh - 52px)',
                        sm: 'calc(100vh - 48px)',
                    },
                    backgroundColor: '#fafafa',
                    py: { xs: 4, sm: 6 },
                }}
            >
                <Container maxWidth={false} sx={{ px: { xs: 2, sm: 3 } }}>
                    {/* Page Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography
                            variant="h4"
                            component="h1"
                            sx={{
                                fontWeight: 700,
                                mb: 1,
                                color: 'text.primary',
                            }}
                        >
                            User Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Manage user roles and permissions. Only SUPER_ADMIN users can access this page.
                        </Typography>
                    </Box>

                    {/* User Statistics */}
                    <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box
                            sx={{
                                bgcolor: 'white',
                                p: 2,
                                borderRadius: 1,
                                boxShadow: 1,
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Total Users
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                                {users.length}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'white',
                                p: 2,
                                borderRadius: 1,
                                boxShadow: 1,
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Super Admins
                            </Typography>
                            <Typography variant="h5" fontWeight={600} color="error.main">
                                {users.filter((u) => u.role === 'SUPER_ADMIN').length}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'white',
                                p: 2,
                                borderRadius: 1,
                                boxShadow: 1,
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Admins
                            </Typography>
                            <Typography variant="h5" fontWeight={600} color="primary.main">
                                {users.filter((u) => u.role === 'ADMIN').length}
                            </Typography>
                        </Box>
                        <Box
                            sx={{
                                bgcolor: 'white',
                                p: 2,
                                borderRadius: 1,
                                boxShadow: 1,
                                minWidth: 150,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Regular Users
                            </Typography>
                            <Typography variant="h5" fontWeight={600}>
                                {users.filter((u) => u.role === 'USER').length}
                            </Typography>
                        </Box>
                    </Box>

                    {/* User Table */}
                    <UserManagementTable users={users} onRoleChange={handleRoleChange} />
                </Container>
            </Box>

            {/* Role Change Dialog */}
            <RoleChangeDialog
                open={dialogOpen}
                user={selectedUser}
                newRole={newRole}
                onConfirm={handleConfirmRoleChange}
                onCancel={handleCancelRoleChange}
            />

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}

/**
 * Wrapper component that handles authorization check.
 * Prevents queries from running for unauthorized users.
 */
export default function UserManagementPage() {
    const router = useRouter();
    const { user: currentUser, isAuthenticated } = useAuth();

    // Check if user is SUPER_ADMIN
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    // Redirect if not SUPER_ADMIN
    useEffect(() => {
        if (isAuthenticated && !isSuperAdmin) {
            router.push('/');
        }
    }, [isAuthenticated, isSuperAdmin, router]);

    // Don't render content for unauthorized users (prevents useQuery from running)
    if (!isSuperAdmin) {
        return null;
    }

    // Only render content component when authorized
    return <UserManagementContent />;
}
