'use server'
import { cache } from 'react'
import { revalidateEntityMutation } from '@/lib/cache-utils'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'

// ============================================================================
// Types
// ============================================================================

export interface PayrollRunItem {
  id: string
  periodStart: string
  periodEnd: string
  payDate?: string
  status?: string
  totalHours?: number
  grossAmount?: number
  netAmount?: number
  employeesCount?: number
}

export interface PayrollStats {
  totalEmployees: number
  gross: number
  net: number
  taxes: number
}

export type ActionResult =
  | { success: true; data?: unknown }
  | { errors: { [K in string]: string[] } }

// ============================================================================
// Validation Schemas
// ============================================================================

const processPayrollSchema = z.object({
  pay_period_start: z.string().min(1, 'Start date is required'),
  pay_period_end: z.string().min(1, 'End date is required'),
  pay_date: z.string().min(1, 'Pay date is required'),
  pay_frequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']).default('biweekly'),
  pay_schedule_id: z.string().optional(),
})

// ============================================================================
// READ Operations (Cached)
// ============================================================================

/**
 * Get all payroll runs with tagged caching
 */
export const getPayrollRuns = cache(async (): Promise<PayrollRunItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/payroll/history`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['payroll-runs'], revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[getPayrollRuns] Failed to fetch payroll runs: ${res.status}`)
      return []
    }

    const json = await res.json()
    let raw = json.history || json.data?.recent_runs || json.recent_runs || json.runs || json.payroll || json.items || []
    
    // Ensure raw is an array
    if (!Array.isArray(raw)) {
      raw = []
    }

  // Normalize various possible backend field names to the UI shape
  interface RawPayrollRun {
    id?: string | number;
    run_id?: string | number;
    uuid?: string;
    date?: string;
    pay_period_start?: string;
    periodStart?: string;
    period_start?: string;
    start?: string;
    pay_period_end?: string;
    periodEnd?: string;
    period_end?: string;
    end?: string;
    pay_date?: string;
    status?: string;
    total_hours?: number;
    totalHours?: number;
    employees?: number;
    gross_amount?: number;
    grossAmount?: number;
    gross?: number;
    gross_pay?: number;
    net_amount?: number;
    netAmount?: number;
    net?: number;
    net_pay?: number;
    employees_count?: number;
    employeesCount?: number;
  }
  return (raw as RawPayrollRun[]).map((r) => ({
    id: String(r.id ?? r.run_id ?? r.uuid ?? ''),
    periodStart: String(r.pay_period_start ?? r.periodStart ?? r.period_start ?? r.start ?? ''),
    periodEnd: String(r.pay_period_end ?? r.periodEnd ?? r.period_end ?? r.end ?? ''),
    payDate: r.date ? String(r.date) : (r.pay_date ? String(r.pay_date) : undefined),
    status: r.status ? String(r.status) : undefined,
    totalHours: Number(r.total_hours ?? r.totalHours ?? 0) || 0,
    grossAmount: Number(r.gross_pay ?? r.gross_amount ?? r.grossAmount ?? r.gross ?? 0) || 0,
    netAmount: (r.net_pay !== undefined || r.net_amount !== undefined || r.netAmount !== undefined || r.net !== undefined)
      ? Number(r.net_pay ?? r.net_amount ?? r.netAmount ?? r.net ?? 0) || 0
      : undefined,
    employeesCount: (r.employees !== undefined || r.employees_count !== undefined || r.employeesCount !== undefined)
      ? Number(r.employees ?? r.employees_count ?? r.employeesCount ?? 0) || 0
      : undefined,
  }))
  } catch (error) {
    console.error('[getPayrollRuns] Error fetching payroll runs:', error instanceof Error ? error.message : 'Unknown error')
    return []
  }
})

/**
 * Get payroll statistics
 * Backend returns: { data: { current_month, monthly_total, total_runs }, success }
 */
export const getPayrollStats = cache(async (): Promise<PayrollStats> => {
  try {
    const cookieHeader = await getAuthCookieHeader()

    // Get employee count from users stats endpoint
    let totalEmployees = 0
    try {
      const empRes = await fetch(`${API_BASE_URL}/api/users/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: ['users-stats'], revalidate: 60 },
      })
      if (empRes.ok) {
        const empData = await empRes.json()
        totalEmployees = Number(empData?.employeeUsers ?? empData?.data?.employeeUsers ?? 0) || 0
      }
    } catch (error) {
      console.warn('[getPayrollStats] Failed to fetch employee count:', error instanceof Error ? error.message : 'Unknown error')
    }

    // Get payroll financial stats
    const res = await fetch(`${API_BASE_URL}/api/payroll/stats`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['payroll-stats'], revalidate: 60 },
    })

    if (!res.ok) {
      console.warn(`[getPayrollStats] Payroll stats endpoint returned ${res.status}`)
      return { totalEmployees, gross: 0, net: 0, taxes: 0 }
    }

    const json = await res.json()
    const data = json.data ?? json

    return {
      totalEmployees,
      gross: Number(data.monthly_gross ?? 0) || 0,
      net: Number(data.monthly_net ?? 0) || 0,
      taxes: Number(data.monthly_taxes ?? 0) || 0,
    }
  } catch (error) {
    console.error('[getPayrollStats] Error fetching payroll stats:', error instanceof Error ? error.message : 'Unknown error')
    return { totalEmployees: 0, gross: 0, net: 0, taxes: 0 }
  }
})

// ============================================================================
// Server Actions (Mutations)
// ============================================================================

/**
 * Process/calculate payroll for a period
 */
export async function processPayrollAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = processPayrollSchema.safeParse({
    pay_period_start: formData.get('pay_period_start'),
    pay_period_end: formData.get('pay_period_end'),
    pay_date: formData.get('pay_date'),
    pay_frequency: formData.get('pay_frequency') || 'biweekly',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/payroll/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      // Extract detailed error message from various backend response formats
      const errorMessage = 
        error.message || 
        error.error || 
        error.detail || 
        error.errors?.[0]?.message ||
        'Failed to process payroll. Please check your input and try again.'
      return { errors: { _form: [errorMessage] } }
    }

    const data = await res.json()

    // Revalidate caches
    // Revalidate payroll and all dependent caches
    revalidateEntityMutation('PAYROLL_RUNS')

    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to process payroll'
    return { errors: { _form: [errorMessage] } }
  }
}

/**
 * Run/execute a calculated payroll
 */
export async function runPayrollAction(runId: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/payroll/run/${runId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    // Extract detailed error message from various backend response formats
    const errorMessage = 
      error.message || 
      error.error || 
      error.detail || 
      error.errors?.[0]?.message ||
      'Failed to run payroll. Please try again or contact support.'
    throw new Error(errorMessage)
  }

  // Revalidate caches
  // Revalidate payroll and all dependent caches
  revalidateEntityMutation('PAYROLL_RUNS')
}

/**
 * Delete a payroll run
 */
export async function deletePayrollRunAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/payroll/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to delete payroll run')
  }

  // Revalidate caches
  // Revalidate payroll and all dependent caches
  revalidateEntityMutation('PAYROLL_RUNS')
}

// ============================================================================
// Export Functions (File Downloads)
// ============================================================================
// Note: These return URLs for client-side download since they generate files
// ============================================================================

/**
 * Get Excel export URL for a payroll run
 * Uses Next.js API route proxy to handle authentication
 */
export async function getExcelExportUrl(runId: string): Promise<string> {
  return `/api/payroll/excel/${runId}`
}

/**
 * Get BCI export URL for a payroll run
 * Uses Next.js API route proxy to handle authentication
 */
export async function getBCIExportUrl(runId: string): Promise<string> {
  return `/api/payroll/excel/bci/${runId}`
}

/**
 * Get Tabela Salarial export URL for a payroll run
 * Uses Next.js API route proxy to handle authentication
 */
export async function getTabelaExportUrl(runId: string, mes?: string): Promise<string> {
  const url = `/api/payroll/excel/tabela/${runId}`
  return mes ? `${url}?mes=${encodeURIComponent(mes)}` : url
}
