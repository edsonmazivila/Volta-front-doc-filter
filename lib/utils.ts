import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Date/Time utilities
// Normalizes various date inputs to ISO 8601 (UTC) to satisfy backend expectations
export function toIsoUtc(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return ''
  try {
    // If already an ISO string with 'T', return as-is
    if (typeof dateInput === 'string') {
      const s = dateInput.trim()
      if (!s) return ''
      // Handle plain date (YYYY-MM-DD) by constructing UTC
      if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
        const [y, m, d] = s.split('-').map(Number)
        const iso = new Date(Date.UTC(y, (m - 1), d, 0, 0, 0, 0)).toISOString()
        return iso
      }
      // Fallback to Date parsing for other strings
      const parsed = new Date(s)
      if (!isNaN(parsed.getTime())) return parsed.toISOString()
      return ''
    }
    // Date instance
    if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
      return dateInput.toISOString()
    }
    return ''
  } catch {
    return ''
  }
}

// Converts optional date string (possibly empty) to ISO, or undefined if not provided
export function optionalIsoUtc(dateInput: string | null | undefined): string | undefined {
  const iso = toIsoUtc(dateInput || '')
  return iso || undefined
}

// Deterministic number formatting for SSR/CSR parity
const NUMBER_FORMATTER = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
  useGrouping: true,
})

export function formatNumberFixed(value?: number): string {
  return NUMBER_FORMATTER.format(value ?? 0)
}

// Date formatting utilities
export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Not provided"
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return "Invalid date"
  }
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Not provided"
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput
    if (isNaN(date.getTime())) return "Invalid date"
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return "Invalid date"
  }
}

export function formatPayPeriod(start?: string, end?: string): string {
  if (!start || !end) return "Not provided"
  try {
    const startDate = new Date(start)
    const endDate = new Date(end)
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "Invalid period"
    
    const sameMonth = startDate.getFullYear() === endDate.getFullYear() && startDate.getMonth() === endDate.getMonth()
    if (sameMonth) {
      return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
    }
    return `${startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  } catch {
    return "Invalid period"
  }
}

// Hours formatting
export function formatHours(hours?: number): string {
  if (hours === undefined || hours === null) return "0"
  return formatNumberFixed(hours)
}

// Status formatting
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'submitted': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30'
    case 'draft':
    default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  }
}

// Leave status formatting
export function getLeaveStatusColor(status: string): string {
  switch (status.toUpperCase()) {
    case 'SUBMITTED': return 'bg-blue-500/20 text-blue-400'
    case 'APPROVED_L1': return 'bg-yellow-500/20 text-yellow-400'
    case 'APPROVED_FINAL': return 'bg-green-500/20 text-green-400'
    case 'REJECTED': return 'bg-red-500/20 text-red-400'
    case 'CANCELLED': return 'bg-gray-500/20 text-gray-400'
    case 'DRAFT':
    default: return 'bg-gray-500/20 text-gray-400'
  }
}

// Date range formatting for leave requests
export function formatDateRange(startDate?: string, endDate?: string): string {
  if (!startDate || !endDate) return "Not provided"
  try {
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "Invalid dates"
    
    const sameMonth = start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()
    if (sameMonth) {
      return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { day: "numeric", year: "numeric" })}`
    }
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  } catch {
    return "Invalid dates"
  }
}
