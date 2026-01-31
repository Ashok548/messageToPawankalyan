import { gql } from '@apollo/client';

// ============================================
// User Mutations
// ============================================

export const REGISTER_USER = gql`
  mutation RegisterUser($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        email
        name
        createdAt
      }
      token
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        email
        name
        createdAt
      }
      token
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $input: UpdateUserInput!) {
    updateUser(id: $id, input: $input) {
      id
      email
      name
      updatedAt
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id
      email
    }
  }
`;

// ============================================
// Project Mutations
// ============================================

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      status
      createdAt
      owner {
        id
        name
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: ID!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      status
      updatedAt
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: ID!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`;

export const CHANGE_PROJECT_STATUS = gql`
  mutation ChangeProjectStatus($id: ID!, $status: ProjectStatus!) {
    updateProject(id: $id, input: { status: $status }) {
      id
      status
      updatedAt
    }
  }
`;
