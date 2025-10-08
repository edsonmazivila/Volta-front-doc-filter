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
