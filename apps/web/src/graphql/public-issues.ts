import { gql } from '@apollo/client';

// Fields safe to expose in public list views — excludes internal admin data and user identity
const PUBLIC_ISSUE_CARD_FIELDS = `
  id
  title
  description
  category
  state
  district
  constituency
  mandal
  village
  images
  mediaUrls
  verificationStatus
  evidenceNote
  status
  supportCount
  isHighPriority
  priority
  isHighlighted
  hasUserSupported
  approvedAt
  takenUpAt
  inProgressAt
  resolvedAt
  createdAt
  updatedAt
`;

// Full fields including admin-only data — used in detail views and admin operations
const PUBLIC_ISSUE_FIELDS = `
  ${PUBLIC_ISSUE_CARD_FIELDS}
  adminNotes
  rejectionReason
  reviewedAt
  reviewedByUser {
    id
    name
    role
  }
`;

export const GET_PUBLIC_ISSUES = gql`
  query GetPublicIssues($filter: PublicIssueFilterInput, $pagination: PaginationInput) {
    publicIssues(filter: $filter, pagination: $pagination) {
      ${PUBLIC_ISSUE_CARD_FIELDS}
    }
  }
`;

export const GET_PUBLIC_ISSUE = gql`
  query GetPublicIssue($id: String!) {
    publicIssue(id: $id) {
      ${PUBLIC_ISSUE_FIELDS}
    }
  }
`;

export const GET_ALL_PUBLIC_ISSUES = gql`
  query GetAllPublicIssues($filter: PublicIssueFilterInput, $pagination: PaginationInput) {
    allPublicIssues(filter: $filter, pagination: $pagination) {
      ${PUBLIC_ISSUE_FIELDS}
    }
  }
`;

export const CREATE_PUBLIC_ISSUE = gql`
  mutation CreatePublicIssue($input: CreatePublicIssueInput!) {
    createPublicIssue(input: $input) {
      ${PUBLIC_ISSUE_FIELDS}
    }
  }
`;

export const UPDATE_PUBLIC_ISSUE = gql`
  mutation UpdatePublicIssue($id: String!, $input: UpdatePublicIssueInput!) {
    updatePublicIssue(id: $id, input: $input) {
      ${PUBLIC_ISSUE_FIELDS}
    }
  }
`;

export const UPDATE_PUBLIC_ISSUE_STATUS = gql`
  mutation UpdatePublicIssueStatus($id: String!, $input: UpdatePublicIssueStatusInput!) {
    updatePublicIssueStatus(id: $id, input: $input) {
      ${PUBLIC_ISSUE_FIELDS}
    }
  }
`;

export const TOGGLE_PUBLIC_ISSUE_SUPPORT = gql`
  mutation TogglePublicIssueSupport($id: String!) {
    togglePublicIssueSupport(id: $id) {
      ${PUBLIC_ISSUE_CARD_FIELDS}
    }
  }
`;

export const DELETE_PUBLIC_ISSUE = gql`
  mutation DeletePublicIssue($id: String!) {
    deletePublicIssue(id: $id) {
      id
    }
  }
`;
