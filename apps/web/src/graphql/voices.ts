import { gql } from '@apollo/client';

const VOICE_FIELDS = `
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
  videoUrl
  audioUrl
  status
  adminNotes
  rejectionReason
  reviewedAt
  createdAt
  updatedAt
  submittedByUser {
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

export const GET_VOICES = gql`
  query GetVoices($pagination: PaginationInput) {
    voices(pagination: $pagination) {
      ${VOICE_FIELDS}
    }
  }
`;

export const GET_VOICE = gql`
  query GetVoice($id: String!) {
    voice(id: $id) {
      ${VOICE_FIELDS}
    }
  }
`;

export const GET_MY_VOICES = gql`
  query GetMyVoices($pagination: PaginationInput) {
    myVoices(pagination: $pagination) {
      ${VOICE_FIELDS}
    }
  }
`;

export const GET_ALL_VOICES = gql`
  query GetAllVoices($filter: VoiceFilterInput, $pagination: PaginationInput) {
    allVoices(filter: $filter, pagination: $pagination) {
      ${VOICE_FIELDS}
    }
  }
`;

export const GET_VOICE_DASHBOARD_STATS = gql`
  query GetVoiceDashboardStats {
    voiceDashboardStats {
      total
      pending
      approved
      rejected
      underReview
      resolved
    }
  }
`;

export const CREATE_VOICE = gql`
  mutation CreateVoice($input: CreateVoiceInput!) {
    createVoice(input: $input) {
      ${VOICE_FIELDS}
    }
  }
`;

export const UPDATE_VOICE = gql`
  mutation UpdateVoice($id: String!, $input: UpdateVoiceInput!) {
    updateVoice(id: $id, input: $input) {
      ${VOICE_FIELDS}
    }
  }
`;

export const UPDATE_VOICE_STATUS = gql`
  mutation UpdateVoiceStatus($id: String!, $input: UpdateVoiceStatusInput!) {
    updateVoiceStatus(id: $id, input: $input) {
      ${VOICE_FIELDS}
    }
  }
`;

export const DELETE_VOICE = gql`
  mutation DeleteVoice($id: String!) {
    deleteVoice(id: $id) {
      id
    }
  }
`;