import { gql } from '@apollo/client';

export const GET_VISITOR_STATS = gql`
    query GetVisitorStats {
        getVisitorStats {
            id
            totalVisitors
            updatedAt
        }
    }
`;

export const INCREMENT_VISITOR_COUNT = gql`
    mutation IncrementVisitorCount {
        incrementVisitorCount {
            id
            totalVisitors
            updatedAt
        }
    }
`;
