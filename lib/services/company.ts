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
  description?: string
  policy_type: string
  leave_type: string
  company_id?: string
  annual_allocation_days: number
  accrual_rate: number
  accrual_frequency: string
  allow_carry_over: boolean
  max_carry_over_days: number
  carry_over_expiry_months: number
  min_request_days: number
  max_request_days: number
  max_consecutive_days: number
  min_advance_notice_days: number
  requires_manager_approval: boolean
  requires_hr_approval: boolean
  auto_approval_threshold: number
  allow_half_days: boolean
  allow_negative_balance: boolean
  effective_date: string
  is_active: boolean
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
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
  description: z.string().optional(),
  policy_type: z.string().min(1, 'Policy type is required'),
  leave_type: z.string().min(1, 'Leave type is required'),
  annual_allocation_days: z.number().min(0, 'Allocation days must be positive'),
  accrual_rate: z.number().min(0, 'Accrual rate must be positive'),
  accrual_frequency: z.string().min(1, 'Accrual frequency is required'),
  allow_carry_over: z.boolean().default(false),
  max_carry_over_days: z.number().min(0).default(0),
  carry_over_expiry_months: z.number().min(0).default(0),
  min_request_days: z.number().min(0).default(0),
  max_request_days: z.number().min(0).default(0),
  max_consecutive_days: z.number().min(0).default(0),
  min_advance_notice_days: z.number().min(0).default(0),
  requires_manager_approval: z.boolean().default(false),
  requires_hr_approval: z.boolean().default(false),
  auto_approval_threshold: z.number().min(0).default(0),
  allow_half_days: z.boolean().default(false),
  allow_negative_balance: z.boolean().default(false),
  effective_date: z.string().min(1, 'Effective date is required'),
  is_active: z.boolean().default(true),
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
    const url = `${API_BASE_URL}/api/pay-schedules`
    const res = await fetch(url, {
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
    const list: RawPaySchedule[] = Array.isArray(json) ? json : json.pay_schedules || json.data || []

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
      description?: string;
      policy_type?: string;
      leave_type?: string;
      type?: string;
      company_id?: string;
      annual_allocation_days?: number;
      allocation_days?: number;
      accrual_rate?: number;
      accrual_frequency?: string;
      allow_carry_over?: boolean;
      max_carry_over_days?: number;
      carry_over_expiry_months?: number;
      min_request_days?: number;
      max_request_days?: number;
      max_consecutive_days?: number;
      min_advance_notice_days?: number;
      requires_manager_approval?: boolean;
      requires_hr_approval?: boolean;
      auto_approval_threshold?: number;
      allow_half_days?: boolean;
      allow_negative_balance?: boolean;
      effective_date?: string;
      is_active?: boolean;
      created_at?: string;
      updated_at?: string;
      created_by?: string;
      updated_by?: string;
    }
    const list: RawLeavePolicy[] = Array.isArray(json) ? json : json.policies || json.data || []

    return list.map((p) => ({
      id: String(p.id || ''),
      name: String(p.name || ''),
      description: p.description || '',
      policy_type: String(p.policy_type || 'company'),
      leave_type: String(p.leave_type || p.type || ''),
      company_id: p.company_id || '',
      annual_allocation_days: Number(p.annual_allocation_days ?? p.allocation_days ?? 0) || 0,
      accrual_rate: Number(p.accrual_rate ?? 0) || 0,
      accrual_frequency: String(p.accrual_frequency || 'monthly'),
      allow_carry_over: Boolean(p.allow_carry_over),
      max_carry_over_days: Number(p.max_carry_over_days ?? 0) || 0,
      carry_over_expiry_months: Number(p.carry_over_expiry_months ?? 0) || 0,
      min_request_days: Number(p.min_request_days ?? 0) || 0,
      max_request_days: Number(p.max_request_days ?? 0) || 0,
      max_consecutive_days: Number(p.max_consecutive_days ?? 0) || 0,
      min_advance_notice_days: Number(p.min_advance_notice_days ?? 0) || 0,
      requires_manager_approval: Boolean(p.requires_manager_approval),
      requires_hr_approval: Boolean(p.requires_hr_approval),
      auto_approval_threshold: Number(p.auto_approval_threshold ?? 0) || 0,
      allow_half_days: Boolean(p.allow_half_days),
      allow_negative_balance: Boolean(p.allow_negative_balance),
      effective_date: String(p.effective_date || ''),
      is_active: Boolean(p.is_active ?? true),
      created_at: p.created_at || '',
      updated_at: p.updated_at || '',
      created_by: p.created_by || '',
      updated_by: p.updated_by || '',
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
  const startDateStr = (formData.get('start_date') as string) || ''
  const startDateFormatted = startDateStr.trim()
  const parsed = payScheduleSchema.safeParse({
    name: String(formData.get('name') || ''),
    frequency: String(formData.get('frequency') || ''),
    start_date: startDateFormatted,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/pay-schedules`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const responseText = await res.text()
      
      let error
      try { error = JSON.parse(responseText) } catch { error = { message: responseText } }
      return { errors: { _form: [error.message || 'Failed to create pay schedule'] } }
    }

    const data = await res.json()
    // Revalidate caches so lists update immediately
    revalidateEntityMutation('COMPANY', { additionalTags: ['pay-schedules'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to create pay schedule'] } }
  }
}

export async function updatePayScheduleAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const startDateStr = (formData.get('start_date') as string) || ''
  const startDateFormatted = startDateStr.trim()
  const parsed = payScheduleSchema.safeParse({
    name: String(formData.get('name') || ''),
    frequency: String(formData.get('frequency') || ''),
    start_date: startDateFormatted,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/pay-schedules/${id}`
  
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const responseText = await res.text()
      console.error('[updatePayScheduleAction] error', res.status, responseText)
      let error
      try { error = JSON.parse(responseText) } catch { error = { message: responseText } }
      return { errors: { _form: [error.message || 'Failed to update pay schedule'] } }
    }

    const data = await res.json()
    // Revalidate caches so lists update immediately
    revalidateEntityMutation('COMPANY', { additionalTags: ['pay-schedules'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update pay schedule'] } }
  }
}

export async function deletePayScheduleAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const url = `${API_BASE_URL}/api/pay-schedules/${id}`
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const responseText = await res.text()
    console.error('[deletePayScheduleAction] error', res.status, responseText)
    let error
    try { error = JSON.parse(responseText) } catch { error = { message: responseText } }
    throw new Error(error.message || 'Failed to delete pay schedule')
  }

  // Revalidate caches so lists update immediately
  revalidateEntityMutation('COMPANY', { additionalTags: ['pay-schedules'] })
}

export async function createLeavePolicyAction(prevState: unknown, formData: FormData): Promise<ActionResult> {

  
  const effectiveDateStr = formData.get('effective_date') as string
  const effectiveDate = effectiveDateStr ? new Date(effectiveDateStr).toISOString() : new Date().toISOString()
  
  const dataToValidate = {
    name: formData.get('name'),
    description: formData.get('description') || '',
    policy_type: formData.get('policy_type') || 'company',
    leave_type: formData.get('leave_type'),
    annual_allocation_days: Number(formData.get('annual_allocation_days')),
    accrual_rate: Number(formData.get('accrual_rate')),
    accrual_frequency: formData.get('accrual_frequency') || 'monthly',
    allow_carry_over: formData.get('allow_carry_over') === 'true' || formData.get('allow_carry_over') === 'on',
    max_carry_over_days: Number(formData.get('max_carry_over_days') || 0),
    carry_over_expiry_months: Number(formData.get('carry_over_expiry_months') || 0),
    min_request_days: Number(formData.get('min_request_days') || 0),
    max_request_days: Number(formData.get('max_request_days') || 0),
    max_consecutive_days: Number(formData.get('max_consecutive_days') || 0),
    min_advance_notice_days: Number(formData.get('min_advance_notice_days') || 0),
    requires_manager_approval: formData.get('requires_manager_approval') === 'true' || formData.get('requires_manager_approval') === 'on',
    requires_hr_approval: formData.get('requires_hr_approval') === 'true' || formData.get('requires_hr_approval') === 'on',
    auto_approval_threshold: Number(formData.get('auto_approval_threshold') || 0),
    allow_half_days: formData.get('allow_half_days') === 'true' || formData.get('allow_half_days') === 'on',
    allow_negative_balance: formData.get('allow_negative_balance') === 'true' || formData.get('allow_negative_balance') === 'on',
    effective_date: effectiveDate,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on' || !formData.get('is_active'),
  }
  


  const parsed = leavePolicySchema.safeParse(dataToValidate)

  if (!parsed.success) {
    console.error('Validation failed:', parsed.error.flatten())
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


    const responseText = await res.text()
   

    if (!res.ok) {
      let error
      try {
        error = JSON.parse(responseText)
      } catch {
        error = { message: `Server error (${res.status}): ${responseText}` }
      }
      console.error('Server error response:', error)
      return { errors: { _form: [error.message || error.error || `Failed to create leave policy (${res.status})`] } }
    }

    const data = JSON.parse(responseText)

    
    // Revalidate caches so lists update immediately
    revalidateEntityMutation('COMPANY', { additionalTags: ['leave-policies'] })
  
    return { success: true, data }
  } catch (error) {
    console.error('Exception in createLeavePolicyAction:', error)
    return { errors: { _form: ['Failed to create leave policy: ' + (error instanceof Error ? error.message : 'Unknown error')] } }
  }
}

export async function updateLeavePolicyAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const effectiveDateStr = formData.get('effective_date') as string
  const effectiveDate = effectiveDateStr ? new Date(effectiveDateStr).toISOString() : new Date().toISOString()
  
  const parsed = leavePolicySchema.safeParse({
    name: formData.get('name'),
    description: formData.get('description') || '',
    policy_type: formData.get('policy_type') || 'company',
    leave_type: formData.get('leave_type'),
    annual_allocation_days: Number(formData.get('annual_allocation_days')),
    accrual_rate: Number(formData.get('accrual_rate')),
    accrual_frequency: formData.get('accrual_frequency') || 'monthly',
    allow_carry_over: formData.get('allow_carry_over') === 'true' || formData.get('allow_carry_over') === 'on',
    max_carry_over_days: Number(formData.get('max_carry_over_days') || 0),
    carry_over_expiry_months: Number(formData.get('carry_over_expiry_months') || 0),
    min_request_days: Number(formData.get('min_request_days') || 0),
    max_request_days: Number(formData.get('max_request_days') || 0),
    max_consecutive_days: Number(formData.get('max_consecutive_days') || 0),
    min_advance_notice_days: Number(formData.get('min_advance_notice_days') || 0),
    requires_manager_approval: formData.get('requires_manager_approval') === 'true' || formData.get('requires_manager_approval') === 'on',
    requires_hr_approval: formData.get('requires_hr_approval') === 'true' || formData.get('requires_hr_approval') === 'on',
    auto_approval_threshold: Number(formData.get('auto_approval_threshold') || 0),
    allow_half_days: formData.get('allow_half_days') === 'true' || formData.get('allow_half_days') === 'on',
    allow_negative_balance: formData.get('allow_negative_balance') === 'true' || formData.get('allow_negative_balance') === 'on',
    effective_date: effectiveDate,
    is_active: formData.get('is_active') === 'true' || formData.get('is_active') === 'on' || !formData.get('is_active'),
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
    // Revalidate company and leave policies caches so lists update immediately
    revalidateEntityMutation('COMPANY', { additionalTags: ['leave-policies'] })

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
    const responseText = await res.text()
    let errorMessage = 'Failed to delete leave policy'
    
    try {
      const error = JSON.parse(responseText)
      errorMessage = error.message || error.error || errorMessage
    } catch {
      // If response is not JSON, use the raw text or status-based message
      if (res.status === 403) {
        errorMessage = 'You are not authorized to delete this leave policy'
      } else if (res.status === 409) {
        errorMessage = 'Cannot delete this leave policy because it is currently being used by employees or has existing leave requests. Please remove all dependencies first.'
      } else if (res.status === 404) {
        errorMessage = 'Leave policy not found'
      } else {
        errorMessage = `Server error (${res.status}): ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`
      }
    }
    
    throw new Error(errorMessage)
  }

  // Revalidate company and leave policies caches so lists update immediately
  revalidateEntityMutation('COMPANY', { additionalTags: ['leave-policies'] })
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
  const rawExpiry = (formData.get('expiry_date') as string) || undefined
  const isoExpiry = rawExpiry ? new Date(rawExpiry).toISOString() : undefined

  const parsed = updateCompanyDocumentSchema.safeParse({
    name: formData.get('name') || undefined,
    description: formData.get('description') || undefined,
    expiry_date: isoExpiry || undefined,
    document_type: formData.get('document_type') || undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const url = `${API_BASE_URL}/api/company-documents/${id}`
    const bodyToSend: Record<string, unknown> = { ...parsed.data }
    // Send a mirrored field in case API expects `type` instead of `document_type`
    if (bodyToSend.document_type && !('type' in bodyToSend)) {
      bodyToSend.type = bodyToSend.document_type
    }
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(bodyToSend),
    })

    if (!res.ok) {
      const responseText = await res.text().catch(() => '')
      let error: { message?: string; error?: string }
      try { error = JSON.parse(responseText) } catch { error = { message: responseText } }
      return { errors: { _form: [error.message || error.error || `Failed to update document (${res.status})`] } }
    }

    const text = await res.text()
    let data: unknown
    try { data = JSON.parse(text) } catch { data = { raw: text } }
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





