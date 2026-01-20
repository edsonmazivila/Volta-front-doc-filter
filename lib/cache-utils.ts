/**
 * Cache Utilities - Centralized cache invalidation with dependency tracking
 *
 * This module provides:
 * 1. Cache dependency mapping for related data invalidation
 * 2. Graceful degradation when cache operations fail
 * 3. Centralized revalidation logic
 */

import { revalidateTag, revalidatePath } from 'next/cache'

/**
 * Cache dependency map
 * When a tag is invalidated, all dependent tags are also invalidated
 */
export const CACHE_DEPENDENCIES: Record<string, string[]> = {
  // Users affect departments, employees, and all user-related data
  users: ['departments', 'employees', 'leaves', 'timesheets', 'documents', 'attendance', 'users-stats'],

  // Departments affect employees (who belong to departments) and users (managers)
  departments: ['employees', 'users', 'department-stats'],

  // Employees affect timesheets, leaves, documents, payroll, attendance
  employees: ['timesheets', 'leaves', 'documents', 'payroll-runs', 'attendance', 'employee-stats'],

  // Timesheets affect payroll calculations
  timesheets: ['payroll-runs', 'timesheet-stats'],

  // Leaves affect employee availability and payroll
  leaves: ['employees', 'payroll-runs', 'leave-stats'],

  // Documents are employee-specific
  documents: ['employees', 'document-stats'],

  // Payroll depends on multiple entities but rarely invalidates others
  'payroll-runs': ['payroll-stats'],

  // Attendance affects employee stats
  attendance: ['attendance-stats', 'attendance-justifications', 'my-attendance'],

  // Meetings affect participants
  meetings: ['meeting-stats'],

  // Paystubs are employee-specific and payroll-dependent
  paystubs: ['employees'],

  // My documents are employee-specific
  'my-documents': ['documents'],

  // My timesheets are employee-specific
  'my-timesheets': ['timesheets'],

  // Company settings affect all data
  company: ['users', 'departments', 'employees', 'payroll-runs', 'leaves', 'attendance', 'meetings'],

  // Tax rules affect payroll calculations
  'tax-rules': ['payroll-runs', 'payroll-stats', 'paystubs'],

  // Stats caches
  'users-stats': [],
  'department-stats': [],
  'employee-stats': [],
  'timesheet-stats': [],
  'leave-stats': [],
  'payroll-stats': [],
  'document-stats': [],
  'attendance-stats': [],
  'attendance-justifications': [],
  'my-attendance': [],
  'meeting-stats': [],
  'dashboard-stats': [],
}

/**
 * Revalidate a tag and all its dependent tags
 *
 * @param tag - The primary cache tag to revalidate
 * @param options - Additional options
 * @param options.includeDependencies - Whether to revalidate dependent tags (default: true)
 * @param options.paths - Additional paths to revalidate
 */
export function revalidateWithDependencies(
  tag: string,
  options: {
    includeDependencies?: boolean
    paths?: string[]
  } = {}
) {
  const { includeDependencies = true, paths = [] } = options

  try {
    // Revalidate primary tag
    revalidateTag(tag)

    // Revalidate dependent tags
    if (includeDependencies) {
      const dependencies = CACHE_DEPENDENCIES[tag] || []
      dependencies.forEach((depTag) => {
        try {
          revalidateTag(depTag)
        } catch (error) {
          console.error(`[Cache] Failed to revalidate dependency ${depTag}:`, error)
          // Continue with other dependencies even if one fails
        }
      })
    }

    // Revalidate paths
    paths.forEach((path) => {
      try {
        revalidatePath(path)
      } catch (error) {
        console.error(`[Cache] Failed to revalidate path ${path}:`, error)
        // Continue with other paths even if one fails
      }
    })
  } catch (error) {
    console.error(`[Cache] Failed to revalidate tag ${tag}:`, error)
    // Don't throw - cache invalidation failures should not break the app
  }
}

/**
 * Revalidate multiple tags and their dependencies
 *
 * @param tags - Array of cache tags to revalidate
 * @param options - Additional options
 */
export function revalidateMultipleTags(
  tags: string[],
  options: {
    includeDependencies?: boolean
    paths?: string[]
  } = {}
) {
  tags.forEach((tag) => {
    revalidateWithDependencies(tag, options)
  })
}

/**
 * Wrapper for fetch operations with graceful error handling
 * Returns fallback data on failure instead of crashing
 *
 * @param fetcher - Async function that fetches data
 * @param fallback - Fallback data to return on error
 * @param options - Additional options
 */
export async function fetchWithGracefulFallback<T>(
  fetcher: () => Promise<T>,
  fallback: T,
  options: {
    logErrors?: boolean
    errorContext?: string
  } = {}
): Promise<T> {
  const { logErrors = true, errorContext = 'fetchWithGracefulFallback' } = options

  try {
    return await fetcher()
  } catch (error) {
    if (logErrors) {
      console.error(`[Cache] ${errorContext} failed:`, error)
    }

    // Return fallback data instead of throwing
    // This prevents the entire page from crashing
    return fallback
  }
}

/**
 * Type-safe helper to get cache tag for an entity
 */
export const CacheTags = {
  USERS: 'users',
  USERS_STATS: 'users-stats',
  DEPARTMENTS: 'departments',
  DEPARTMENT_STATS: 'department-stats',
  EMPLOYEES: 'employees',
  EMPLOYEE_STATS: 'employee-stats',
  TIMESHEETS: 'timesheets',
  TIMESHEET_STATS: 'timesheet-stats',
  LEAVES: 'leaves',
  LEAVE_STATS: 'leave-stats',
  DOCUMENTS: 'documents',
  DOCUMENT_STATS: 'document-stats',
  DOCUMENT_TYPES: 'document-types',
  PAYROLL_RUNS: 'payroll-runs',
  PAYROLL_STATS: 'payroll-stats',
  ATTENDANCE: 'attendance',
  ATTENDANCE_STATS: 'attendance-stats',
  ATTENDANCE_JUSTIFICATIONS: 'attendance-justifications',
  MY_ATTENDANCE: 'my-attendance',
  MEETINGS: 'meetings',
  MEETING_STATS: 'meeting-stats',
  PAYSTUBS: 'paystubs',
  MY_DOCUMENTS: 'my-documents',
  MY_TIMESHEETS: 'my-timesheets',
  COMPANY: 'company',
  COMPANY_STATS: 'company-stats',
  DASHBOARD: 'dashboard',
  DASHBOARD_STATS: 'dashboard-stats',
  REPORTS: 'reports',
  REPORTS_LIST: 'reports-list',
  PAYROLL_CHART: 'payroll-chart',
  EMPLOYEE_METRICS: 'employee-metrics',
  TAX_TREND: 'tax-trend',
  TAX_RULES: 'tax-rules',
} as const

/**
 * Type-safe helper to get cache paths
 */
export const CachePaths = {
  DASHBOARD: '/dashboard',
  DEPARTMENTS: '/dashboard/departments',
  EMPLOYEES: '/dashboard/employees',
  TIMESHEETS: '/dashboard/timesheets',
  MY_TIMESHEETS: '/dashboard/my-timesheets',
  LEAVES: '/dashboard/leaves',
  DOCUMENTS: '/dashboard/documents',
  MY_DOCUMENTS: '/dashboard/my-documents',
  PAYSTUBS: '/dashboard/paystubs',
  PAYROLL: '/dashboard/payroll',
  ATTENDANCE: '/dashboard/attendance',
  MEETINGS: '/dashboard/meetings',
  COMPANY: '/dashboard/company',
  REPORTS: '/dashboard/reports',
  TAX_RULES: '/dashboard/tax-rules',
} as const

/**
 * Get all paths that should be revalidated for a given entity type
 */
export function getPathsForEntity(entity: keyof typeof CacheTags): string[] {
  const entityToPaths: Record<string, string[]> = {
    DEPARTMENTS: [CachePaths.DEPARTMENTS, CachePaths.DASHBOARD],
    EMPLOYEES: [CachePaths.EMPLOYEES, CachePaths.DASHBOARD],
    TIMESHEETS: [CachePaths.TIMESHEETS, CachePaths.MY_TIMESHEETS, CachePaths.PAYROLL, CachePaths.DASHBOARD],
    LEAVES: [CachePaths.LEAVES, CachePaths.DASHBOARD],
    DOCUMENTS: [CachePaths.DOCUMENTS, CachePaths.MY_DOCUMENTS, CachePaths.DASHBOARD],
    PAYROLL_RUNS: [CachePaths.PAYROLL, CachePaths.PAYSTUBS, CachePaths.DASHBOARD],
    ATTENDANCE: [CachePaths.ATTENDANCE, CachePaths.DASHBOARD],
    MEETINGS: [CachePaths.MEETINGS, CachePaths.DASHBOARD],
    PAYSTUBS: [CachePaths.PAYSTUBS, CachePaths.DASHBOARD],
    MY_DOCUMENTS: [CachePaths.MY_DOCUMENTS, CachePaths.DOCUMENTS, CachePaths.DASHBOARD],
    MY_TIMESHEETS: [CachePaths.MY_TIMESHEETS, CachePaths.TIMESHEETS, CachePaths.DASHBOARD],
    COMPANY: [CachePaths.COMPANY, CachePaths.DASHBOARD],
    DASHBOARD: [CachePaths.DASHBOARD],
    REPORTS: [CachePaths.REPORTS],
    TAX_RULES: [CachePaths.TAX_RULES, CachePaths.PAYROLL, CachePaths.DASHBOARD],
  }

  return entityToPaths[entity] || [CachePaths.DASHBOARD]
}

/**
 * Standard revalidation for entity mutations (create/update/delete)
 *
 * @param entity - The entity type that was mutated
 * @param options - Additional options
 */
export function revalidateEntityMutation(
  entity: keyof typeof CacheTags,
  options: {
    includeStats?: boolean
    includeDependencies?: boolean
    additionalTags?: string[]
    additionalPaths?: string[]
  } = {}
) {
  const {
    includeStats = true,
    includeDependencies = true,
    additionalTags = [],
    additionalPaths = [],
  } = options

  const tags: string[] = [CacheTags[entity]]

  // Add stats tag if needed
  if (includeStats) {
    const statsKey = `${entity}_STATS` as keyof typeof CacheTags
    if (CacheTags[statsKey]) {
      tags.push(CacheTags[statsKey])
    }
  }

  // Add additional tags
  tags.push(...additionalTags)

  // Get paths for this entity
  const paths = [...getPathsForEntity(entity), ...additionalPaths]

  // Revalidate all tags with dependencies
  revalidateMultipleTags(tags, { includeDependencies, paths })
}
