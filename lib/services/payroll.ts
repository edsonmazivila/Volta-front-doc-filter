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
})

// ============================================================================
// READ Operations (Cached)
// ============================================================================

/**
 * Get all payroll runs with tagged caching
 */
export const getPayrollRuns = cache(async (): Promise<PayrollRunItem[]> => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/dashboard/payroll`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: ['payroll-runs'], revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch payroll runs: ${res.status}`)
  }

  const json = await res.json()
  let raw = json.data?.recent_runs || json.recent_runs || json.runs || json.history || json.payroll || json.items || []
  
  // Ensure raw is an array
  if (!Array.isArray(raw)) {
    raw = []
  }

  // Normalize various possible backend field names to the UI shape
  interface RawPayrollRun {
    id?: string | number;
    run_id?: string | number;
    uuid?: string;
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
    gross_amount?: number;
    grossAmount?: number;
    gross?: number;
    net_amount?: number;
    netAmount?: number;
    net?: number;
    employees_count?: number;
    employeesCount?: number;
  }
  return (raw as RawPayrollRun[]).map((r) => ({
    id: String(r.id ?? r.run_id ?? r.uuid ?? ''),
    periodStart: String(r.pay_period_start ?? r.periodStart ?? r.period_start ?? r.start ?? ''),
    periodEnd: String(r.pay_period_end ?? r.periodEnd ?? r.period_end ?? r.end ?? ''),
    payDate: r.pay_date ? String(r.pay_date) : undefined,
    status: r.status ? String(r.status) : undefined,
    totalHours: Number(r.total_hours ?? r.totalHours ?? 0) || 0,
    grossAmount: Number(r.gross_amount ?? r.grossAmount ?? r.gross ?? 0) || 0,
    netAmount: r.net_amount !== undefined || r.netAmount !== undefined || r.net !== undefined
      ? Number(r.net_amount ?? r.netAmount ?? r.net ?? 0) || 0
      : undefined,
    employeesCount: r.employees_count !== undefined || r.employeesCount !== undefined
      ? Number(r.employees_count ?? r.employeesCount ?? 0) || 0
      : undefined,
  }))
})

/**
 * Get payroll statistics
 * Backend returns: { data: { current_month, monthly_total, total_runs }, success }
 */
export const getPayrollStats = cache(async (): Promise<PayrollStats> => {
  try {
    const cookieHeader = await getAuthCookieHeader()

    // Get employee count from employees stats endpoint
    let totalEmployees = 0
    try {
      const empRes = await fetch(`${API_BASE_URL}/api/employees/stats`, {
        headers: {
          'Content-Type': 'application/json',
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        next: { tags: ['employees-stats'], revalidate: 60 },
      })
      if (empRes.ok) {
        const empData = await empRes.json()
        totalEmployees = Number(empData?.total ?? empData?.data?.total ?? 0) || 0
      }
    } catch {
      // Fallback if employees stats not available
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
  } catch {
    // Error handling - stats unavailable
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
      return { errors: { _form: [error.message || 'Failed to process payroll'] } }
    }

    const data = await res.json()

    // Revalidate caches
    // Revalidate payroll and all dependent caches
    revalidateEntityMutation('PAYROLL_RUNS')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to process payroll'] } }
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
    throw new Error(error.message || 'Failed to run payroll')
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
 * Call this from client component and open in new window
 */
export async function getExcelExportUrl(runId: string): Promise<string> {
  return `${API_BASE_URL}/api/payroll/excel/${runId}`
}

/**
 * Get BCI export URL for a payroll run
 * Call this from client component and open in new window
 */
export async function getBCIExportUrl(runId: string): Promise<string> {
  return `${API_BASE_URL}/api/payroll/excel/bci/${runId}`
}

/**
 * Get Tabela Salarial export URL for a payroll run
 * Call this from client component and open in new window
 */
export async function getTabelaExportUrl(runId: string, mes?: string): Promise<string> {
  const url = `${API_BASE_URL}/api/payroll/excel/tabela/${runId}`
  return mes ? `${url}?mes=${encodeURIComponent(mes)}` : url
}
