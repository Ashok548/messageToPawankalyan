import { gql } from '@apollo/client';

export const GET_ALL_USERS = gql`
    query GetAllUsers {
        getAllUsers {
            id
            name
            email
            mobile
            role
            isVerified
            createdAt
            updatedAt
        }
    }
`;

export const UPDATE_USER_ROLE = gql`
    mutation UpdateUserRole($input: UpdateUserRoleInput!) {
        updateUserRole(input: $input) {
            id
            name
            email
            mobile
            role
            isVerified
            updatedAt
        }
    }
`;
