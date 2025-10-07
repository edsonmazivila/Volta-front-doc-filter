'use server'
import { cache } from 'react'
import { revalidateEntityMutation } from '@/lib/cache-utils'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { z } from 'zod'

// ============================================================================
// Types
// ============================================================================

export type DocumentStatus = 'uploaded' | 'approved' | 'rejected' | 'expired' | 'pending'

export interface Document {
  id: string
  employee_id: string
  employee_name: string
  title: string
  document_type: string
  document_status: DocumentStatus
  original_filename?: string
  file_path?: string
  file_size?: number
  is_confidential?: boolean
  description?: string
  expiry_date?: string
  created_at?: string
  updated_at?: string
}

export interface DocumentListItem {
  id: string
  employeeName: string
  title: string
  type: string
  status: DocumentStatus
  createdAt?: string
  sizeBytes?: number
}

export interface DocumentTypeItem {
  type: string
  display_name: string
}

export type ActionResult =
  | { success: true; data?: unknown }
  | { errors: { [K in string]: string[] } }

// ============================================================================
// Validation Schemas
// ============================================================================

const updateDocumentSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  expiry_date: z.string().optional(),
  is_confidential: z.boolean().optional(),
})

const rejectDocumentSchema = z.object({
  reason: z.string().min(1, 'Rejection reason is required'),
})

// ============================================================================
// READ Operations (Cached)
// ============================================================================

/**
 * Get my documents (employee self-service)
 */
export const getMyDocuments = cache(async (): Promise<DocumentListItem[]> => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents/my`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: ['documents'], revalidate: 60 },
  })

  if (!res.ok) {
    // If endpoint doesn't exist, fallback to regular documents
    return getDocuments()
  }

  const json = await res.json()
  const raw = json.documents || json.data || []

  interface RawDocument {
    id?: string | number;
    doc_id?: string | number;
    uuid?: string;
    employee?: { user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string };
    user?: { user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string };
    employee_name?: string;
    title?: string;
    original_filename?: string;
    document_type?: string;
    type?: string;
    document_status?: string;
    status?: string;
    expiry_date?: string;
    is_confidential?: boolean;
    file_size?: number;
    created_at?: string;
    updated_at?: string;
  }
  return raw.map((d: RawDocument) => {
    const emp = d.employee || d.user || undefined
    const empUser = emp?.user || emp
    const first = empUser?.first_name ?? ''
    const last = empUser?.last_name ?? ''
    const email = empUser?.email ?? ''
    const name = [first, last].filter(Boolean).join(' ') || email || '—'

    return {
      id: String(d.id ?? d.doc_id ?? d.uuid ?? ''),
      employeeName: String(d.employee_name ?? name),
      title: String(d.title ?? d.original_filename ?? 'Untitled'),
      type: String(d.document_type ?? d.type ?? 'unknown'),
      status: (d.document_status ?? d.status ?? 'uploaded') as DocumentStatus,
      createdAt: d.created_at ? String(d.created_at) : undefined,
      sizeBytes: typeof d.file_size === 'number' ? d.file_size : undefined,
    }
  })
})

/**
 * Get all documents with tagged caching
 */
export const getDocuments = cache(async (): Promise<DocumentListItem[]> => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: ['documents'], revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch documents: ${res.status}`)
  }

  const json = await res.json()
  const raw = json.documents || json.data || []

  interface RawDocument {
    id?: string | number;
    doc_id?: string | number;
    uuid?: string;
    employee?: { user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string };
    user?: { user?: { first_name?: string; last_name?: string; email?: string }; first_name?: string; last_name?: string; email?: string };
    employee_name?: string;
    title?: string;
    original_filename?: string;
    document_type?: string;
    type?: string;
    document_status?: string;
    status?: string;
    expiry_date?: string;
    is_confidential?: boolean;
    file_size?: number;
    created_at?: string;
    updated_at?: string;
  }
  return raw.map((d: RawDocument) => {
    const emp = d.employee || d.user || undefined
    const empUser = emp?.user || emp
    const first = empUser?.first_name ?? ''
    const last = empUser?.last_name ?? ''
    const email = empUser?.email ?? ''
    const name = [first, last].filter(Boolean).join(' ') || email || '—'

    return {
      id: String(d.id ?? d.doc_id ?? d.uuid ?? ''),
      employeeName: String(d.employee_name ?? name),
      title: String(d.title ?? d.original_filename ?? 'Untitled'),
      type: String(d.document_type ?? d.type ?? 'unknown'),
      status: (d.document_status ?? d.status ?? 'uploaded') as DocumentStatus,
      createdAt: d.created_at ? String(d.created_at) : undefined,
      sizeBytes: typeof d.file_size === 'number' ? d.file_size : undefined,
    }
  })
})

/**
 * Get a single document by ID
 */
export const getDocument = cache(async (id: string): Promise<Document | null> => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: [`document-${id}`], revalidate: 60 },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Failed to fetch document: ${res.status}`)
  }

  const json = await res.json()
  const d = json.document || json.data || json

  const emp = d.employee || d.user || undefined
  const empUser = emp?.user || emp
  const first = empUser?.first_name ?? empUser?.firstName ?? ''
  const last = empUser?.last_name ?? empUser?.lastName ?? ''
  const email = empUser?.email ?? ''
  const name = [first, last].filter(Boolean).join(' ') || email || '—'

  return {
    id: String(d.id ?? ''),
    employee_id: String(d.employee_id ?? ''),
    employee_name: String(d.employee_name ?? name),
    title: String(d.title ?? ''),
    document_type: String(d.document_type ?? ''),
    document_status: (d.document_status ?? 'uploaded') as DocumentStatus,
    original_filename: d.original_filename ? String(d.original_filename) : undefined,
    file_path: d.file_path ? String(d.file_path) : undefined,
    file_size: typeof d.file_size === 'number' ? d.file_size : undefined,
    is_confidential: Boolean(d.is_confidential),
    description: d.description ? String(d.description) : undefined,
    expiry_date: d.expiry_date ? String(d.expiry_date) : undefined,
    created_at: d.created_at ? String(d.created_at) : undefined,
    updated_at: d.updated_at ? String(d.updated_at) : undefined,
  }
})

/**
 * Get available document types
 * Note: Uses 300s (5 min) cache instead of standard 60s because document types
 * are configuration data that rarely changes
 */
export const getDocumentTypes = cache(async (): Promise<DocumentTypeItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/types`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['document-types'], revalidate: 300 }, // 5 min cache for semi-static config
    })

    if (!res.ok) return []

    const json = await res.json()
    if (Array.isArray(json.document_types)) return json.document_types
    if (Array.isArray(json.types)) return json.types.map((t: string) => ({ type: t, display_name: t }))
    return []
  } catch {
    return []
  }
})

// ============================================================================
// Server Actions (Mutations)
// ============================================================================

/**
 * Upload a new document (multipart/form-data)
 */
export async function uploadDocumentAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const employeeId = formData.get('employee_id')
  const documentType = formData.get('document_type')
  const file = formData.get('file')

  // Basic validation
  if (!employeeId || !documentType || !file) {
    return {
      errors: {
        _form: ['Employee, document type, and file are required']
      }
    }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()

    // For file uploads, we need to use FormData without JSON Content-Type
    const res = await fetch(`${API_BASE_URL}/api/documents/upload`, {
      method: 'POST',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to upload document'] } }
    }

    const data = await res.json()

    // Revalidate caches
    // Revalidate documents and all dependent caches
    revalidateEntityMutation('DOCUMENTS')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to upload document'] } }
  }
}

/**
 * Update document metadata
 */
export async function updateDocumentAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = updateDocumentSchema.safeParse({
    title: formData.get('title'),
    description: formData.get('description'),
    expiry_date: formData.get('expiry_date'),
    is_confidential: formData.get('is_confidential') === 'true',
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to update document'] } }
    }

    const data = await res.json()

    // Revalidate caches
    // Revalidate documents and all dependent caches
    revalidateEntityMutation('DOCUMENTS')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update document'] } }
  }
}

/**
 * Delete a document
 */
export async function deleteDocumentAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to delete document')
  }

  // Revalidate caches
  // Revalidate documents and all dependent caches
  revalidateEntityMutation('DOCUMENTS')
}

/**
 * Approve a document
 */
export async function approveDocumentAction(id: string): Promise<void> {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    body: JSON.stringify({}),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    throw new Error(error.message || 'Failed to approve document')
  }

  // Revalidate caches
  // Revalidate documents and all dependent caches
  revalidateEntityMutation('DOCUMENTS')
}

/**
 * Reject a document
 */
export async function rejectDocumentAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = rejectDocumentSchema.safeParse({
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: JSON.stringify(parsed.data),
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to reject document'] } }
    }

    const data = await res.json()

    // Revalidate caches
    // Revalidate documents and all dependent caches
    revalidateEntityMutation('DOCUMENTS')

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to reject document'] } }
  }
}
