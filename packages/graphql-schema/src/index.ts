import { gql } from 'graphql-tag';

// ============================================
// GraphQL Fragments
// ============================================

export const USER_FIELDS = gql`
  fragment UserFields on User {
    id
    email
    name
    role
    createdAt
    updatedAt
  }
`;

export const PROJECT_FIELDS = gql`
  fragment ProjectFields on Project {
    id
    name
    description
    status
    createdAt
    updatedAt
  }
`;

export const PROJECT_WITH_OWNER = gql`
  ${PROJECT_FIELDS}
  ${USER_FIELDS}
  
  fragment ProjectWithOwner on Project {
    ...ProjectFields
    owner {
      ...UserFields
    }
  }
`;

// ============================================
// Export Schema
// ============================================

export { default as schema } from './schema.graphql';
