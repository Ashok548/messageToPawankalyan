import { gql } from '@apollo/client';

// ============================================
// User Queries
// ============================================

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      name
      role
      createdAt
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    user(id: $id) {
      id
      email
      name
      createdAt
      projects {
        id
        name
        status
        createdAt
      }
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      createdAt
    }
  }
`;

// ============================================
// Project Queries
// ============================================

export const GET_PROJECTS = gql`
  query GetProjects($status: ProjectStatus) {
    projects(status: $status) {
      id
      name
      description
      status
      createdAt
      owner {
        id
        name
        email
      }
    }
  }
`;

export const GET_PROJECT_BY_ID = gql`
  query GetProjectById($id: ID!) {
    project(id: $id) {
      id
      name
      description
      status
      createdAt
      updatedAt
      owner {
        id
        name
        email
      }
    }
  }
`;

export const GET_USER_PROJECTS = gql`
  query GetUserProjects($userId: ID!) {
    user(id: $userId) {
      id
      name
      projects {
        id
        name
        description
        status
        createdAt
      }
    }
  }
`;
