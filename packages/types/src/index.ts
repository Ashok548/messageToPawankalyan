// ============================================
// Common Domain Types
// ============================================

/**
 * Project status enum
 * Matches Prisma schema enum
 */
export enum ProjectStatus {
    ACTIVE = 'ACTIVE',
    ARCHIVED = 'ARCHIVED',
    COMPLETED = 'COMPLETED',
    ON_HOLD = 'ON_HOLD',
}

/**
 * User role enum
 */
export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER',
    GUEST = 'GUEST',
}

// ============================================
// API Response Types
// ============================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ResponseMeta;
}

/**
 * API error structure
 */
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, any>;
}

/**
 * Response metadata (pagination, etc.)
 */
export interface ResponseMeta {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
}

// ============================================
// Pagination Types
// ============================================

export interface PaginationInput {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

// ============================================
// Filter and Sort Types
// ============================================

export enum SortOrder {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface SortInput {
    field: string;
    order: SortOrder;
}

export interface FilterInput {
    field: string;
    operator: FilterOperator;
    value: any;
}

export enum FilterOperator {
    EQUALS = 'EQUALS',
    NOT_EQUALS = 'NOT_EQUALS',
    CONTAINS = 'CONTAINS',
    STARTS_WITH = 'STARTS_WITH',
    ENDS_WITH = 'ENDS_WITH',
    IN = 'IN',
    NOT_IN = 'NOT_IN',
    GT = 'GT',
    GTE = 'GTE',
    LT = 'LT',
    LTE = 'LTE',
}

// ============================================
// Date Range Types
// ============================================

export interface DateRange {
    start: Date | string;
    end: Date | string;
}

// ============================================
// Validation Types
// ============================================

export interface ValidationError {
    field: string;
    message: string;
    code?: string;
}

export interface ValidationResult {
    valid: boolean;
    errors?: ValidationError[];
}

// ============================================
// Auth Types (Frontend-safe)
// ============================================

/**
 * Public user info (safe to share with frontend)
 * NEVER include passwordHash or sensitive data
 */
export interface PublicUser {
    id: string;
    email: string;
    name: string;
    role?: UserRole;
    createdAt: Date | string;
}

/**
 * Auth token payload (what's stored in JWT)
 */
export interface TokenPayload {
    userId: string;
    email: string;
    role?: UserRole;
    iat?: number;
    exp?: number;
}

// ============================================
// Project Types (Domain-specific)
// ============================================

export interface ProjectBase {
    id: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    createdAt: Date | string;
    updatedAt: Date | string;
}

export interface ProjectWithOwner extends ProjectBase {
    owner: PublicUser;
}

// ============================================
// Type Guards
// ============================================

export function isProjectStatus(value: any): value is ProjectStatus {
    return Object.values(ProjectStatus).includes(value);
}

export function isUserRole(value: any): value is UserRole {
    return Object.values(UserRole).includes(value);
}

export function isSortOrder(value: any): value is SortOrder {
    return Object.values(SortOrder).includes(value);
}
