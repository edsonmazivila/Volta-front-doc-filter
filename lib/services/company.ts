'use server'
import { cache } from 'react'
import { revalidateEntityMutation } from '@/lib/cache-utils'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'

// Types
export interface CompanyProfile {
  id: string
  name: string
  legal_name?: string
  tax_id?: string
  email?: string
  phone?: string
  website?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  logo?: string
}

export interface PaySchedule {
  id: string
  name: string
  frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly'
  start_date: string
  is_active: boolean
}

export interface LeavePolicy {
  id: string
  name: string
  leave_type: string
  annual_allocation_days: number
}

export interface CompanyDocument {
  id: string
  company_id: string
  name: string
  document_type: string
  original_filename: string
  stored_filename: string
  file_path: string
  file_size: number
  mime_type: string
  storage_provider: string
  expiry_date?: string
  description?: string
  created_at: string
  updated_at: string
  created_by: string
  updated_by: string
}

export interface CompanyDocumentsResponse {
  documents: CompanyDocument[]
  limit: number
  page: number
  total: number
}

export interface ActionResult {
  success?: boolean
  data?: unknown
  errors?: {
    _form?: string[]
    [key: string]: string[] | undefined
  }
}

// Validation schemas
const updateCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  address_line1: z.string().optional(),
  address_line2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postal_code: z.string().optional(),
  country: z.string().optional(),
})

const payScheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  frequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
  start_date: z.string().min(1, 'Start date is required'),
  is_active: z.boolean().default(true),
})

const leavePolicySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  leave_type: z.string().min(1, 'Leave type is required'),
  annual_allocation_days: z.number().min(0, 'Allocation days must be positive'),
})

const updateCompanyDocumentSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  expiry_date: z.string().optional(),
  document_type: z.string().optional(),
})

// READ operations (cached)
export const getCompany = cache(async (): Promise<CompanyProfile | null> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/company`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['company'], revalidate: 60 },
    })

    if (!res.ok) return null

    const json = await res.json().catch(() => ({}))
    const data = json.data ?? json
    if (!data || (!data.id && !data.name)) return null

    const company = data
    return {
      id: String(company.id || ''),
      name: String(company.name || ''),
      legal_name: company.legal_name || '',
      tax_id: company.tax_id || company.tax_number || company.vat_number || '',
      email: company.email || company.email_address || '',
      phone: company.phone || company.phone_number || company.telephone || '',
      website: company.website || company.web_url || '',
      address_line1: company.address_line1 || company.address1 || company.address || '',
      address_line2: company.address_line2 || company.address2 || '',
      city: company.city || '',
      state: company.state || company.province || company.region || '',
      postal_code: company.postal_code || company.zip || company.zip_code || '',
      country: company.country || '',
      logo: company.logo || company.logo_url || '',
    }
  } catch {
    return null
  }
})

export const getPaySchedules = cache(async (): Promise<PaySchedule[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/pay-schedules`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['pay-schedules'], revalidate: 60 },
    })

    if (!res.ok) return []

    const json = await res.json().catch(() => ({}))
    interface RawPaySchedule {
      id?: string | number;
      name?: string;
      frequency?: string;
      start_date?: string;
      start?: string;
      is_active?: boolean;
    }
    const list: RawPaySchedule[] = Array.isArray(json) ? json : json.data || json.pay_schedules || []

    return list.map((s) => ({
      id: String(s.id || ''),
      name: String(s.name || ''),
      frequency: (s.frequency || 'monthly') as PaySchedule['frequency'],
      start_date: String(s.start_date || s.start || ''),
      is_active: Boolean(s.is_active),
    }))
  } catch {
    return []
  }
})

export const getLeavePolicies = cache(async (): Promise<LeavePolicy[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/leave-policies`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['leave-policies'], revalidate: 60 },
    })

    if (!res.ok) return []

    const json = await res.json().catch(() => ({}))
    interface RawLeavePolicy {
      id?: string | number;
      name?: string;
      leave_type?: string;
      type?: string;
      annual_allocation_days?: number;
      allocation_days?: number;
    }
    const list: RawLeavePolicy[] = Array.isArray(json) ? json : json.data || json.policies || []

    return list.map((p) => ({
      id: String(p.id || ''),
      name: String(p.name || ''),
      leave_type: String(p.leave_type || p.type || ''),
      annual_allocation_days: Number(p.annual_allocation_days ?? p.allocation_days ?? 0) || 0,
    }))
  } catch {
    return []
  }
})

export const getCompanyDocuments = cache(async (params?: { page?: number; limit?: number; document_type?: string }): Promise<CompanyDocumentsResponse> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.set('page', String(params.page))
    if (params?.limit) queryParams.set('limit', String(params.limit))
    if (params?.document_type) queryParams.set('document_type', params.document_type)

    const url = `${API_BASE_URL}/api/company-documents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
    
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['company-documents'], revalidate: 60 },
    })

    if (!res.ok) {
      return { documents: [], limit: 20, page: 1, total: 0 }
    }

    const json = await res.json()
    
    return {
      documents: json.documents || [],
      limit: json.limit || 20,
      page: json.page || 1,
      total: json.total || 0,
    }
  } catch {
    return { documents: [], limit: 20, page: 1, total: 0 }
  }
})

export const getCompanyDocument = cache(async (id: string): Promise<CompanyDocument | null> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/company-documents/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: [`company-document-${id}`], revalidate: 60 },
    })

    if (!res.ok) return null

    const json = await res.json()
    const doc = json.document || json
    
    return doc
  } catch {
    return null
  }
})

// Server Actions for mutations

export async function updateCompanyAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = updateCompanySchema.safeParse({
    name: formData.get('name'),
    legal_name: formData.get('legal_name') || '',
    tax_id: formData.get('tax_id') || '',
    email: formData.get('email') || '',
    phone: formData.get('phone') || '',
    website: formData.get('website') || '',
    address_line1: formData.get('address_line1') || '',
    address_line2: formData.get('address_line2') || '',
    city: formData.get('city') || '',
    state: formData.get('state') || '',
    postal_code: formData.get('postal_code') || '',
    country: formData.get('country') || '',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    
    const res = await fetch(`${API_BASE_URL}/api/company`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    const responseText = await res.text()

    if (!res.ok) {
      let error
      try {
        error = JSON.parse(responseText)
      } catch {
        error = { 
          message: `Server error (${res.status}): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}` 
        }
      }
      return { errors: { _form: [error.message || error.error || 'Failed to update company'] } }
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      return { errors: { _form: ['Server returned invalid response'] } }
    }
    
    revalidateEntityMutation('COMPANY')
    return { success: true, data }
  } catch (error) {
    return { errors: { _form: ['Failed to update company: ' + (error instanceof Error ? error.message : 'Unknown error')] } }
  }
}

export async function createPayScheduleAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = payScheduleSchema.safeParse({
    name: formData.get('name'),
    frequency: formData.get('frequency'),
    start_date: formData.get('start_date'),
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/pay-schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to create pay schedule'] } }
    }

    const data = await res.json()
    // Revalidate company and all dependent caches
    revalidateEntityMutation('COMPANY')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to create pay schedule'] } }
  }
}

export async function updatePayScheduleAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = payScheduleSchema.safeParse({
    name: formData.get('name'),
    frequency: formData.get('frequency'),
    start_date: formData.get('start_date'),
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/pay-schedules/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to update pay schedule'] } }
    }

    const data = await res.json()
    // Revalidate company and all dependent caches
    revalidateEntityMutation('COMPANY')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update pay schedule'] } }
  }
}

export async function deletePayScheduleAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/pay-schedules/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to delete pay schedule')
  }

  // Revalidate company and all dependent caches
  revalidateEntityMutation('COMPANY')
}

export async function createLeavePolicyAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = leavePolicySchema.safeParse({
    name: formData.get('name'),
    leave_type: formData.get('leave_type'),
    annual_allocation_days: Number(formData.get('annual_allocation_days')),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/leave-policies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to create leave policy'] } }
    }

    const data = await res.json()
    // Revalidate company and all dependent caches
    revalidateEntityMutation('COMPANY')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to create leave policy'] } }
  }
}

export async function updateLeavePolicyAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = leavePolicySchema.safeParse({
    name: formData.get('name'),
    leave_type: formData.get('leave_type'),
    annual_allocation_days: Number(formData.get('annual_allocation_days')),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/leave-policies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to update leave policy'] } }
    }

    const data = await res.json()
    // Revalidate company and all dependent caches
    revalidateEntityMutation('COMPANY')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update leave policy'] } }
  }
}

export async function deleteLeavePolicyAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/leave-policies/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to delete leave policy')
  }

  // Revalidate company and all dependent caches
  revalidateEntityMutation('COMPANY')
}

/**
 * Upload a new company document
 * Endpoint: POST /api/company-documents/upload
 */
export async function uploadCompanyDocumentAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/company-documents/upload`, {
      method: 'POST',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || error.error || 'Failed to upload document'] } }
    }

    const data = await res.json()
    revalidateEntityMutation('COMPANY')
    
    return { success: true, data }
  } catch (error) {
    return { errors: { _form: ['Failed to upload document: ' + (error instanceof Error ? error.message : 'Unknown error')] } }
  }
}

/**
 * Update company document metadata
 * Endpoint: PUT /api/company-documents/:id
 */
export async function updateCompanyDocumentAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = updateCompanyDocumentSchema.safeParse({
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    expiry_date: formData.get('expiry_date') || undefined,
    document_type: formData.get('document_type') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/company-documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || error.error || 'Failed to update document'] } }
    }

    const data = await res.json()
    revalidateEntityMutation('COMPANY')
    
    return { success: true, data }
  } catch (error) {
    return { errors: { _form: ['Failed to update document: ' + (error instanceof Error ? error.message : 'Unknown error')] } }
  }
}

/**
 * Delete a company document
 * Endpoint: DELETE /api/company-documents/:id
 */
export async function deleteCompanyDocumentAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/company-documents/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || error.error || 'Failed to delete document')
  }

  revalidateEntityMutation('COMPANY')
}



