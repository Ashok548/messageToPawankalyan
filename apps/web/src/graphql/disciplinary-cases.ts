import { gql } from '@apollo/client';

export const GET_DISCIPLINARY_CASES = gql`
  query GetDisciplinaryCases($filter: DisciplinaryCaseFilterInput) {
    disciplinaryCases(filter: $filter) {
      id
      caseNumber
      leaderName
      position
      constituency
      issueCategory
      issueDescription
      status
      actionOutcome
      visibility
      initiationDate
      leader {
        id
        name
        photo
      }
    }
  }
`;

export const GET_DISCIPLINARY_CASE_DETAILS = gql`
  query GetDisciplinaryCaseDetails($id: ID!) {
    disciplinaryCase(id: $id) {
      id
      caseNumber
      leaderId
      leaderName
      position
      constituency
      issueCategory
      issueDescription
      issueSource
      initiationDate
      reviewStartDate
      decisionDate
      effectiveFrom
      effectiveTo
      
      status
      actionOutcome
      visibility
      internalNotes
      evidenceUrls
      imageUrls
      decisionRationale
      
      createdAt
      updatedAt
      
      leader {
        id
        name
        photo
        district
        partyPosition
      }
      
      initiatedByUser {
        id
        name
      }
      
      reviewAuthorityUser {
        id
        name
      }
      
      decisionAuthorityUser {
        id
        name
      }
    }
  }
`;

export const CREATE_DISCIPLINARY_CASE = gql`
  mutation CreateDisciplinaryCase($input: CreateDisciplinaryCaseInput!) {
    createDisciplinaryCase(input: $input) {
      id
      caseNumber
      leaderName
      status
      createdAt
    }
  }
`;

export const UPDATE_CASE_STATUS = gql`
  mutation UpdateCaseStatus($id: ID!, $input: UpdateCaseStatusInput!) {
    updateCaseStatus(id: $id, input: $input) {
      id
      status
      updatedAt
    }
  }
`;

export const RECORD_CASE_DECISION = gql`
  mutation RecordCaseDecision($id: ID!, $input: RecordDecisionInput!) {
    recordDecision(id: $id, input: $input) {
      id
      status
      actionOutcome
      decisionDate
    }
  }
`;

export const UPDATE_CASE_VISIBILITY = gql`
  mutation UpdateCaseVisibility($id: ID!, $visibility: CaseVisibility!) {
    updateCaseVisibility(id: $id, visibility: $visibility) {
      id
      visibility
    }
  }
`;

export const ADD_CASE_INTERNAL_NOTE = gql`
  mutation AddCaseInternalNote($id: ID!, $note: String!) {
    addInternalNote(id: $id, note: $note) {
      id
      internalNotes
    }
  }
`;

export const UPLOAD_CASE_IMAGES = gql`
  mutation UploadCaseImages($id: ID!, $images: [String!]!) {
    uploadCaseImages(id: $id, images: $images) {
      id
      imageUrls
    }
  }
`;
