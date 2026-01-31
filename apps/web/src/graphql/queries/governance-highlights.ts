import { gql } from '@apollo/client';

export const GET_GOVERNANCE_HIGHLIGHTS = gql`
    query GetGovernanceHighlights($category: HighlightCategory) {
        governanceHighlights(category: $category) {
            id
            title
            category
            description
            area
            department
            state
            district
            constituency
            mandal
            village
            yearStarted
            yearCompleted
            period
            status
            sourceType
            sourceUrl
            sourceTitle
            issueContext
            image
            gallery
            createdAt
        }
    }
`;

export const GET_GOVERNANCE_HIGHLIGHT = gql`
    query GetGovernanceHighlight($id: String!) {
        governanceHighlight(id: $id) {
            id
            title
            category
            description
            area
            department
            state
            district
            constituency
            mandal
            village
            yearStarted
            yearCompleted
            period
            status
            sourceType
            sourceUrl
            sourceTitle
            issueContext
            image
            gallery
            isVerified
            isVisible
            adminNotes
            createdAt
            updatedAt
        }
    }
`;

export const CREATE_GOVERNANCE_HIGHLIGHT_MUTATION = gql`
    mutation CreateGovernanceHighlight($input: CreateGovernanceHighlightInput!) {
        createGovernanceHighlight(input: $input) {
            id
            title
            category
            image
            gallery
        }
    }
`;

export const UPDATE_GOVERNANCE_HIGHLIGHT_MUTATION = gql`
    mutation UpdateGovernanceHighlight($id: String!, $input: UpdateGovernanceHighlightInput!) {
        updateGovernanceHighlight(id: $id, input: $input) {
            id
            title
            category
            image
            gallery
        }
    }
`;

export const TOGGLE_GOVERNANCE_HIGHLIGHT_VISIBILITY_MUTATION = gql`
    mutation ToggleGovernanceHighlightVisibility($id: String!) {
        toggleGovernanceHighlightVisibility(id: $id) {
            id
            isVisible
        }
    }
`;

export const DELETE_GOVERNANCE_HIGHLIGHT_MUTATION = gql`
    mutation DeleteGovernanceHighlight($id: String!) {
        deleteGovernanceHighlight(id: $id) {
            id
        }
    }
`;
