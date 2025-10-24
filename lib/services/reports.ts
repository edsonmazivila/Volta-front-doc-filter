import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'

// ============================================================================
// REPORTS SERVICE - READ-ONLY ANALYTICS
// ============================================================================
// This service is intentionally read-only (no mutations/Server Actions).
// It provides analytics and reporting data with longer cache times (180-300s)
// compared to standard CRUD services (60s) since analytics data changes less frequently.
// ============================================================================

// ============================================================================
// Types
// ============================================================================

export interface ReportsListItem {
  id: string
  name: string
  date: string
  type: string
}

export interface PayrollChartData {
  labels: string[]
  totalPayroll: number[]
  netPay: number[]
  taxes?: number[]
}

export interface EmployeeMetricsData {
  employmentTypes: { labels: string[]; data: number[]; colors?: string[] }
  summary?: {
    totalEmployees?: number
    activeEmployees?: number
    newHiresThisMonth?: number
    avgTenure?: number
    turnoverRate?: number
  }
  departmentDistribution?: { labels: string[]; data: number[]; colors?: string[] }
}

export interface TaxTrendData {
  labels: string[]
  federalTax?: number[]
  stateTax?: number[]
  socialSecurity?: number[]
  medicare?: number[]
  futa?: number[]
  suta?: number[]
}

export interface EmployeePaystubsReport {
  paystubs: Array<{
    id: string
    pay_period_start: string
    pay_period_end: string
    pay_date: string
    gross_pay: number
    net_pay: number
    total_deductions: number
    status: string
  }>
  count: number
  employee_id: string
}

// ============================================================================
// READ Operations (Cached)
// ============================================================================

/**
 * Get list of available reports
 */
export const getReportsList = cache(async (): Promise<ReportsListItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/reports/list`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['reports-list'], revalidate: 300 }, // 5 min cache for reports list
    })

    if (!res.ok) return []

    const json = await res.json().catch(() => ({}))
    const raw = json?.data || json?.reports || []

    interface RawReport {
      id?: string | number;
      report_id?: string | number;
      name?: string;
      title?: string;
      date?: string;
      created_at?: string;
      type?: string;
      format?: string;
    }
    return (raw as RawReport[]).map((r) => ({
      id: String(r.id ?? r.report_id ?? r.name ?? ''),
      name: String(r.name ?? r.title ?? 'Report'),
      date: String(r.date ?? r.created_at ?? ''),
      type: String(r.type ?? r.format ?? 'PDF'),
    }))
  } catch {
    return []
  }
})

/**
 * Get payroll chart data for specified period
 */
export const getPayrollChart = cache(async (period: string = 'monthly'): Promise<PayrollChartData> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/reports/payroll-stats?period=${encodeURIComponent(period)}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [`payroll-chart-${period}`], revalidate: 180 }, // 3 min cache
    })

    if (!res.ok) {
      return { labels: [], totalPayroll: [], netPay: [] }
    }

    const json = await res.json().catch(() => ({}))
    if (json?.data) return json.data

    // Fallback defaults
    return { labels: [], totalPayroll: [], netPay: [] }
  } catch {
    return { labels: [], totalPayroll: [], netPay: [] }
  }
})

/**
 * Get employee metrics data
 */
export const getEmployeeMetrics = cache(async (): Promise<EmployeeMetricsData> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/reports/employee-metrics`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['employee-metrics'], revalidate: 180 }, // 3 min cache
    })

    if (!res.ok) {
      return { employmentTypes: { labels: [], data: [] } }
    }

    const json = await res.json().catch(() => ({}))
    if (json?.data) return json.data

    return { employmentTypes: { labels: [], data: [] } }
  } catch {
    return { employmentTypes: { labels: [], data: [] } }
  }
})

/**
 * Get tax trend data for specified period
 */
export const getTaxTrend = cache(async (period: string = 'monthly'): Promise<TaxTrendData> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/reports/tax-liability-trend?period=${encodeURIComponent(period)}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [`tax-trend-${period}`], revalidate: 180 }, // 3 min cache
    })

    if (!res.ok) {
      return { labels: [] }
    }

    const json = await res.json().catch(() => ({}))
    if (json?.data) return json.data

    return { labels: [] }
  } catch {
    return { labels: [] }
  }
})

// ============================================================================
// Export Functions
// ============================================================================

/**
 * Export chart data as CSV (Server Action)
 */
export async function exportChartAsCSV(chartType: 'payroll' | 'employees' | 'taxes', period: string = 'monthly'): Promise<Blob | null> {
  'use server'
  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/reports/export/csv?type=${encodeURIComponent(chartType)}&period=${encodeURIComponent(period)}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

/**
 * Export chart as Excel (Server Action)
 */
export async function exportChartAsExcel(chartType: 'payroll' | 'employees' | 'taxes', period: string = 'monthly'): Promise<Blob | null> {
  'use server'
  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/reports/export/excel?type=${encodeURIComponent(chartType)}&period=${encodeURIComponent(period)}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    if (!res.ok) return null
    return await res.blob()
  } catch {
    return null
  }
}

/**
 * Export chart as PNG image (client-side only)
 * Returns a data URL that can be downloaded
 */
export async function exportChartAsPNG(chartId: string, filename: string = 'chart.png'): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const canvas = document.querySelector(`#${chartId} canvas`) as HTMLCanvasElement
    if (!canvas) {
      console.error('Canvas not found for chart:', chartId)
      return
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      link.click()
      URL.revokeObjectURL(url)
    })
  } catch (error) {
    console.error('Error exporting chart as PNG:', error)
  }
}

/**
 * Export chart as PDF (client-side only)
 * Requires jsPDF library to be available
 */
export async function exportChartAsPDF(chartId: string, filename: string = 'chart.pdf'): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const canvas = document.querySelector(`#${chartId} canvas`) as HTMLCanvasElement
    if (!canvas) {
      console.error('Canvas not found for chart:', chartId)
      return
    }

    // Convert canvas to image data (not used currently; fallback exports PNG below)

    // Check if jsPDF is available (needs to be imported by the client)
    // This is just a helper function - actual PDF generation should be done client-side
    console.log('PDF export requested for chart:', chartId)
    console.log('Note: Implement jsPDF client-side for full PDF support')

    // For now, export as PNG as fallback
    exportChartAsPNG(chartId, filename.replace('.pdf', '.png'))
  } catch (error) {
    console.error('Error exporting chart as PDF:', error)
  }
}

/**
 * Print chart (client-side only)
 */
export async function printChart(chartId: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const canvas = document.querySelector(`#${chartId} canvas`) as HTMLCanvasElement
    if (!canvas) {
      console.error('Canvas not found for chart:', chartId)
      return
    }

    // Create a new window with the chart image
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      console.error('Failed to open print window')
      return
    }

    const imgData = canvas.toDataURL('image/png')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Chart</title>
          <style>
            body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
            img { max-width: 100%; height: auto; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <img src="${imgData}" alt="Chart" onload="window.print(); window.close();" />
        </body>
      </html>
    `)
    printWindow.document.close()
  } catch (error) {
    console.error('Error printing chart:', error)
  }
}

/**
 * Get employee paystubs report
 */
export const getEmployeePaystubsReport = cache(async (employeeId: string): Promise<EmployeePaystubsReport | null> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/reports/paystubs/${employeeId}`
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['reports', 'employee-paystubs'], revalidate: 180 },
    })

    if (!res.ok) {
      console.error(`[getEmployeePaystubsReport] HTTP ${res.status}`)
      return null
    }

    const data = await res.json()
    return {
      paystubs: data.paystubs || [],
      count: data.count || 0,
      employee_id: employeeId,
    }
  } catch (error) {
    console.error('[getEmployeePaystubsReport] error', error)
    return null
  }
})

/**
 * Generate report and get download URL (Server Action)
 */
export async function generateReport(reportType: string, params: Record<string, string> = {}): Promise<string | null> {
  'use server'
  try {
    const cookieHeader = await getAuthCookieHeader()
    const searchParams = new URLSearchParams(params)
    const url = `${API_BASE_URL}/api/reports/generate/${encodeURIComponent(reportType)}?${searchParams.toString()}`

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(params),
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.download_url || data.url || null
  } catch {
    return null
  }
}

// ============================================================================
// Notes:
// - Reports service provides both read-only analytics and export functionality
// - Uses shorter cache times (3-5 min) since analytics data changes frequently
// - Returns safe defaults on error to prevent UI crashes
// - Period-based caching ensures different views are cached separately
// - Export functions handle both server-side (CSV/Excel) and client-side (PNG/PDF) operations
// - Client-side export functions check for browser environment before executing
// ============================================================================
