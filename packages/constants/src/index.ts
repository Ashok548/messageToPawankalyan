// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'My App';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Full-stack monorepo application';

// ============================================
// API Constants
// ============================================

export const API_VERSION = 'v1';
export const API_PREFIX = `/api/${API_VERSION}`;

// ============================================
// Pagination Constants
// ============================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

// ============================================
// Validation Constants
// ============================================

export const VALIDATION = {
    // User
    EMAIL_MAX_LENGTH: 255,
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_MAX_LENGTH: 128,

    // Project
    PROJECT_NAME_MIN_LENGTH: 3,
    PROJECT_NAME_MAX_LENGTH: 100,
    PROJECT_DESCRIPTION_MAX_LENGTH: 5000,
} as const;

// ============================================
// Regex Patterns
// ============================================

export const REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;

// ============================================
// Error Codes
// ============================================

export const ERROR_CODES = {
    // Authentication
    UNAUTHENTICATED: 'UNAUTHENTICATED',
    UNAUTHORIZED: 'UNAUTHORIZED',
    INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
    TOKEN_EXPIRED: 'TOKEN_EXPIRED',
    TOKEN_INVALID: 'TOKEN_INVALID',

    // Validation
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    INVALID_INPUT: 'INVALID_INPUT',
    REQUIRED_FIELD: 'REQUIRED_FIELD',

    // Resources
    NOT_FOUND: 'NOT_FOUND',
    ALREADY_EXISTS: 'ALREADY_EXISTS',
    CONFLICT: 'CONFLICT',

    // Server
    INTERNAL_ERROR: 'INTERNAL_ERROR',
    SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
    BAD_REQUEST: 'BAD_REQUEST',
} as const;

// ============================================
// HTTP Status Codes
// ============================================

export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// ============================================
// Cache Keys (for Apollo Client)
// ============================================

export const CACHE_KEYS = {
    CURRENT_USER: 'currentUser',
    USERS: 'users',
    PROJECTS: 'projects',
    PROJECT_BY_ID: (id: string) => `project:${id}`,
    USER_PROJECTS: (userId: string) => `userProjects:${userId}`,
} as const;

// ============================================
// Date/Time Constants
// ============================================

export const TIME = {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

export const TOKEN_EXPIRY = {
    ACCESS_TOKEN: 15 * TIME.MINUTE, // 15 minutes
    REFRESH_TOKEN: 7 * TIME.DAY, // 7 days
    REMEMBER_ME: 30 * TIME.DAY, // 30 days
} as const;

// ============================================
// Environment Constants
// ============================================

export const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    STAGING: 'staging',
    PRODUCTION: 'production',
    TEST: 'test',
} as const;

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
    ENABLE_ANALYTICS: true,
    ENABLE_NOTIFICATIONS: true,
    ENABLE_DARK_MODE: true,
    ENABLE_BETA_FEATURES: false,
} as const;

// ============================================
// Routes (Frontend)
// ============================================

export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    DASHBOARD: '/dashboard',
    PROJECTS: '/projects',
    PROJECT_DETAIL: (id: string) => `/projects/${id}`,
    PROFILE: '/profile',
    SETTINGS: '/settings',
} as const;

// ============================================
// GraphQL Operation Names
// ============================================

export const GRAPHQL_OPERATIONS = {
    // Queries
    GET_CURRENT_USER: 'GetCurrentUser',
    GET_USERS: 'GetUsers',
    GET_USER_BY_ID: 'GetUserById',
    GET_PROJECTS: 'GetProjects',
    GET_PROJECT_BY_ID: 'GetProjectById',

    // Mutations
    LOGIN: 'Login',
    REGISTER: 'Register',
    LOGOUT: 'Logout',
    CREATE_PROJECT: 'CreateProject',
    UPDATE_PROJECT: 'UpdateProject',
    DELETE_PROJECT: 'DeleteProject',
} as const;

// ============================================
// Type Exports
// ============================================

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];
export type HttpStatus = (typeof HTTP_STATUS)[keyof typeof HTTP_STATUS];
export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS];
