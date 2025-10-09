'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import type { Paystub, PaystubDetail } from '@/lib/types/paystubs'

// READ operations (cached)
export const getMyPaystubs = cache(async (params?: { year?: string }): Promise<Paystub[]> => {
  try {
    const qs = new URLSearchParams()
    if (params?.year) qs.append('year', params.year)

    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/paystubs/my${qs.toString() ? `?${qs}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['paystubs'], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch paystubs: ${res.status}`)
    }

    const data = await res.json()
    // Normalize various possible response shapes into an array
    const candidates = [
      data?.paystubs,
      data?.data?.paystubs,
      data?.data,
      data?.items,
      data?.results,
      data,
    ]
    const firstArray = candidates.find((c) => Array.isArray(c))
    return Array.isArray(firstArray) ? (firstArray as Paystub[]) : []
  } catch (error) {
    console.error('Error fetching paystubs:', error)
    return []
  }
})

export const getPaystubById = cache(async (id: string): Promise<PaystubDetail | null> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/paystubs/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['paystubs'], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch paystub: ${res.status}`)
    }

    const data = await res.json()
    return data?.paystub || data || null
  } catch (error) {
    console.error('Error fetching paystub:', error)
    return null
  }
})

export const getEmployeePaystubs = cache(async (employeeId: string, params?: { year?: string }): Promise<Paystub[]> => {
  try {
    const qs = new URLSearchParams()
    if (params?.year) qs.append('year', params.year)

    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/paystubs/employee/${employeeId}${qs.toString() ? `?${qs}` : ''}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['paystubs', `employee-${employeeId}`], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch employee paystubs: ${res.status}`)
    }

    const data = await res.json()
    const candidates = [
      data?.paystubs,
      data?.data?.paystubs,
      data?.data,
      data?.items,
      data?.results,
      data,
    ]
    const firstArray = candidates.find((c) => Array.isArray(c))
    return Array.isArray(firstArray) ? (firstArray as Paystub[]) : []
  } catch (error) {
    console.error('Error fetching employee paystubs:', error)
    return []
  }
})

export const getPayrollRunPaystubs = cache(async (payrollRunId: string): Promise<Paystub[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/paystubs/payroll-run/${payrollRunId}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['paystubs', `payroll-run-${payrollRunId}`], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch payroll run paystubs: ${res.status}`)
    }

    const data = await res.json()
    const candidates = [
      data?.paystubs,
      data?.data?.paystubs,
      data?.data,
      data?.items,
      data?.results,
      data,
    ]
    const firstArray = candidates.find((c) => Array.isArray(c))
    return Array.isArray(firstArray) ? (firstArray as Paystub[]) : []
  } catch (error) {
    console.error('Error fetching payroll run paystubs:', error)
    return []
  }
})

// Download paystub as PDF
export async function downloadPaystubPDF(id: string): Promise<Blob | null> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/paystubs/${id}/pdf`, {
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
    })

    if (!res.ok) {
      throw new Error(`Failed to download paystub: ${res.status}`)
    }

    return await res.blob()
  } catch (error) {
    console.error('Error downloading paystub:', error)
    return null
  }
}
