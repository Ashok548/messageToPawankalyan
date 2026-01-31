import { gql } from '@apollo/client';

export const GET_ATROCITIES = gql`
    query GetAtrocities {
        atrocities {
            id
            atrocityType
            leaderName
            atrocityBy
            state
            district
            constituency
            mandal
            village
            position
            subject
            description
            images
            isVerified
            createdAt
        }
    }
`;

export const GET_UNVERIFIED_ATROCITIES = gql`
    query GetUnverifiedAtrocities {
        unverifiedAtrocities {
            id
            atrocityType
            leaderName
            atrocityBy
            state
            district
            constituency
            mandal
            village
            position
            subject
            description
            images
            isVerified
            createdAt
        }
    }
`;

export const GET_ATROCITY = gql`
    query GetAtrocity($id: String!) {
        atrocity(id: $id) {
            id
            leaderName
            atrocityBy
            state
            district
            constituency
            mandal
            village
            position
            subject
            description
            images
            isVerified
            createdAt
            updatedAt
        }
    }
`;

export const APPROVE_ATROCITY_MUTATION = gql`
    mutation ApproveAtrocity($id: String!) {
        approveAtrocity(id: $id) {
            id
            isVerified
        }
    }
`;

export const REMOVE_ATROCITY_IMAGE_MUTATION = gql`
    mutation RemoveAtrocityImage($id: String!, $imageUrl: String!) {
        removeAtrocityImage(id: $id, imageUrl: $imageUrl) {
            id
            images
        }
    }
`;
