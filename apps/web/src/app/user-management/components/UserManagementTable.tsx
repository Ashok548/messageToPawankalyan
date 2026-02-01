'use client';

import { useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Select,
    MenuItem,
    FormControl,
    Box,
    Typography,
    TableSortLabel,
    IconButton,
    Tooltip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';

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

interface UserManagementTableProps {
    users: User[];
    onRoleChange: (userId: string, newRole: string) => void;
}

type Order = 'asc' | 'desc';
type OrderBy = keyof User;

const ROLE_COLORS: Record<string, 'error' | 'primary' | 'default'> = {
    SUPER_ADMIN: 'error',
    ADMIN: 'primary',
    USER: 'default',
};

export function UserManagementTable({ users, onRoleChange }: UserManagementTableProps) {
    const [order, setOrder] = useState<Order>('asc');
    const [orderBy, setOrderBy] = useState<OrderBy>('name');

    const handleRequestSort = (property: OrderBy) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const sortedUsers = [...users].sort((a, b) => {
        const aValue = a[orderBy];
        const bValue = b[orderBy];

        if (aValue === undefined || bValue === undefined) return 0;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
            return order === 'asc'
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
        }

        return 0;
    });

    return (
        <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
            <Table sx={{ minWidth: 650 }}>
                <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'name'}
                                direction={orderBy === 'name' ? order : 'asc'}
                                onClick={() => handleRequestSort('name')}
                            >
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Name
                                </Typography>
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Mobile
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Email
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'role'}
                                direction={orderBy === 'role' ? order : 'asc'}
                                onClick={() => handleRequestSort('role')}
                            >
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Role
                                </Typography>
                            </TableSortLabel>
                        </TableCell>
                        <TableCell align="center">
                            <Typography variant="subtitle2" fontWeight={600}>
                                Verified
                            </Typography>
                        </TableCell>
                        <TableCell>
                            <TableSortLabel
                                active={orderBy === 'createdAt'}
                                direction={orderBy === 'createdAt' ? order : 'asc'}
                                onClick={() => handleRequestSort('createdAt')}
                            >
                                <Typography variant="subtitle2" fontWeight={600}>
                                    Joined
                                </Typography>
                            </TableSortLabel>
                        </TableCell>
                        <TableCell>
                            <Typography variant="subtitle2" fontWeight={600}>
                                Actions
                            </Typography>
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedUsers.map((user, index) => (
                        <TableRow
                            key={user.id}
                            sx={{
                                '&:nth-of-type(odd)': { bgcolor: 'grey.50' },
                                '&:hover': { bgcolor: 'action.hover' },
                            }}
                        >
                            <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                    {user.name}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2">{user.mobile}</Typography>
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                    {user.email || 'N/A'}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={user.role}
                                    color={ROLE_COLORS[user.role] || 'default'}
                                    size="small"
                                    sx={{ fontWeight: 600 }}
                                />
                            </TableCell>
                            <TableCell align="center">
                                {user.isVerified ? (
                                    <Tooltip title="Verified">
                                        <CheckCircleIcon color="success" fontSize="small" />
                                    </Tooltip>
                                ) : (
                                    <Tooltip title="Not Verified">
                                        <CancelIcon color="disabled" fontSize="small" />
                                    </Tooltip>
                                )}
                            </TableCell>
                            <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                    {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <FormControl size="small" sx={{ minWidth: 120 }}>
                                    <Select
                                        value={user.role}
                                        onChange={(e) => onRoleChange(user.id, e.target.value)}
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        <MenuItem value="USER">USER</MenuItem>
                                        <MenuItem value="ADMIN">ADMIN</MenuItem>
                                        <MenuItem value="SUPER_ADMIN">SUPER_ADMIN</MenuItem>
                                    </Select>
                                </FormControl>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {users.length === 0 && (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body1" color="text.secondary">
                        No users found
                    </Typography>
                </Box>
            )}
        </TableContainer>
    );
}
