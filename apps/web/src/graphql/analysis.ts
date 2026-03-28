import { gql } from '@apollo/client';

const ANALYSIS_FIELDS = `
  id
  issueId
  createdById
  reviewedById
  problemUnderstanding
  impact
  observations
  considerations
  status
  adminNotes
  rejectionReason
  reviewedAt
  createdAt
  updatedAt
  createdByUser {
    id
    name
    role
  }
  reviewedByUser {
    id
    name
    role
  }
`;

export const GET_ANALYSES = gql`
  query GetAnalyses($issueId: String!, $pagination: PaginationInput) {
    analyses(issueId: $issueId, pagination: $pagination) {
      ${ANALYSIS_FIELDS}
    }
  }
`;

export const GET_ANALYSIS = gql`
  query GetAnalysis($id: String!) {
    analysis(id: $id) {
      ${ANALYSIS_FIELDS}
    }
  }
`;

export const GET_ALL_ANALYSES = gql`
  query GetAllAnalyses($filter: AnalysisFilterInput, $pagination: PaginationInput) {
    allAnalyses(filter: $filter, pagination: $pagination) {
      ${ANALYSIS_FIELDS}
    }
  }
`;

export const CREATE_ANALYSIS = gql`
  mutation CreateAnalysis($input: CreateAnalysisInput!) {
    createAnalysis(input: $input) {
      ${ANALYSIS_FIELDS}
    }
  }
`;

export const UPDATE_ANALYSIS_STATUS = gql`
  mutation UpdateAnalysisStatus($id: String!, $input: UpdateAnalysisStatusInput!) {
    updateAnalysisStatus(id: $id, input: $input) {
      ${ANALYSIS_FIELDS}
    }
  }
`;
