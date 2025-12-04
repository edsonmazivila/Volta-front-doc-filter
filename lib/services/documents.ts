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

// Employee document (from /api/my-documents response)
export interface MyDocument {
  id: string
  employee_id: string
  document_type: string
  document_status: DocumentStatus
  original_filename: string
  can_download: boolean
  can_edit: boolean
  created_at: string
  file_size?: number
  expiry_date?: string
  description?: string
}

export interface MyDocumentsResponse {
  success: boolean
  count: number
  data: MyDocument[]
}

// Full document details (from /api/documents/:id)
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
  access_level?: string
  requires_approval?: boolean
  approved_by?: string
  approved_by_full_name?: string
  approved_at?: string
  version?: number
  is_current_version?: boolean
  storage_provider?: string
  mime_type?: string
  virus_scan_status?: string
  encrypted?: boolean
  download_count?: number
}

// List item for tables/grids
export interface DocumentListItem {
  id: string
  employeeName: string
  title: string
  type: string
  status: DocumentStatus
  createdAt?: string
  sizeBytes?: number
  canDownload?: boolean
  canEdit?: boolean
}

export interface DocumentTypeItem {
  type: string
  display_name: string
}

export interface DocumentCategory {
  id: string
  name: string
  description?: string
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
 * Endpoint: GET /api/my-documents
 */
export const getMyDocuments = cache(async (): Promise<DocumentListItem[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/my-documents`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['my-documents'], revalidate: 60 },
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch my documents: ${res.status}`)
    }

    const json: MyDocumentsResponse = await res.json()
    
    if (!json.success || !Array.isArray(json.data)) {
      return []
    }

    return json.data.map((d) => ({
      id: d.id,
      employeeName: '—', // Employee viewing their own docs
      title: d.original_filename || 'Untitled',
      type: d.document_type,
      status: d.document_status,
      createdAt: d.created_at,
      sizeBytes: d.file_size,
      canDownload: d.can_download,
      canEdit: d.can_edit,
    }))
  } catch (error) {
    console.error('Error fetching my documents:', error)
    return []
  }
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
    full_name?: string;
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
    return {
      id: String(d.id ?? d.doc_id ?? d.uuid ?? ''),
      employeeName: String(d.full_name || '—'),
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

  return {
    id: String(d.id ?? ''),
    employee_id: String(d.employee_id ?? ''),
    employee_name: String(d.full_name || '—'),
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
    access_level: d.access_level ? String(d.access_level) : undefined,
    requires_approval: typeof d.requires_approval === 'boolean' ? d.requires_approval : undefined,
    approved_by: d.approved_by ? String(d.approved_by) : undefined,
    approved_by_full_name: d.approved_by_full_name ? String(d.approved_by_full_name) : undefined,
    approved_at: d.approved_at ? String(d.approved_at) : undefined,
    version: typeof d.version === 'number' ? d.version : undefined,
    is_current_version: typeof d.is_current_version === 'boolean' ? d.is_current_version : undefined,
    storage_provider: d.storage_provider ? String(d.storage_provider) : undefined,
    mime_type: d.mime_type ? String(d.mime_type) : undefined,
    virus_scan_status: d.virus_scan_status ? String(d.virus_scan_status) : undefined,
    encrypted: typeof d.encrypted === 'boolean' ? d.encrypted : undefined,
    download_count: typeof d.download_count === 'number' ? d.download_count : undefined,
  }
})

/**
 * Get a document for edit screen
 * Endpoint: GET /api/documents/:id/edit
 */
export const getDocumentForEdit = cache(async (id: string): Promise<Document | null> => {
  const cookieHeader = await getAuthCookieHeader()
  const res = await fetch(`${API_BASE_URL}/api/documents/${id}/edit`, {
    headers: {
      'Content-Type': 'application/json',
      ...(cookieHeader && { Cookie: cookieHeader }),
    },
    next: { tags: [`document-${id}`], revalidate: 60 },
  })

  if (!res.ok) {
    if (res.status === 404) return null
    throw new Error(`Failed to fetch document for edit: ${res.status}`)
  }

  const json = await res.json()
  const d = json.document || json.data || json

  return {
    id: String(d.id ?? ''),
    employee_id: String(d.employee_id ?? ''),
    employee_name: String(d.full_name || '—'),
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
 * Endpoint: GET /api/documents/types
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
    
    // Handle different response formats
    let rawTypes: unknown[] = []
    if (Array.isArray(json.document_types)) {
      rawTypes = json.document_types
    } else if (Array.isArray(json.types)) {
      rawTypes = json.types
    } else if (Array.isArray(json)) {
      rawTypes = json
    }
    
    // Normalize to DocumentTypeItem format
    return rawTypes.map((item: unknown) => {
      // Handle string format
      if (typeof item === 'string') {
        return { type: item, display_name: item }
      }
      
      // Handle object format
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>
        
        // Check for {label, value} format
        if ('label' in obj && 'value' in obj) {
          return {
            type: String(obj.value || ''),
            display_name: String(obj.label || obj.value || '')
          }
        }
        
        // Check for {type, display_name} format
        if ('type' in obj) {
          return {
            type: String(obj.type || ''),
            display_name: String(obj.display_name || obj.type || '')
          }
        }
      }
      
      // Fallback
      return { type: String(item), display_name: String(item) }
    })
  } catch {
    return []
  }
})

/**
 * Get document categories
 * Endpoint: GET /api/documents/categories
 */
export const getDocumentCategories = cache(async (): Promise<DocumentCategory[]> => {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/categories`, {
      headers: {
        'Content-Type': 'application/json',
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      next: { tags: ['document-categories'], revalidate: 300 },
    })

    if (!res.ok) return []

    const json = await res.json()
    return json.categories || json.data || []
  } catch {
    return []
  }
})

// ============================================================================
// Server Actions (Mutations)
// ============================================================================

/**
 * Upload a new document (multipart/form-data)
 * For HR/Admin uploading documents for employees (Team Documents)
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

    // Revalidate caches for documents and my-documents views
    revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to upload document'] } }
  }
}

/**
 * Upload a document for the current user (My Documents)
 * Uses /api/my-documents/upload which automatically uses session user
 */
export async function uploadMyDocumentAction(prevState: unknown, formData: FormData): Promise<ActionResult> {
  const documentType = formData.get('document_type')
  const file = formData.get('file')

  // Basic validation - employee_id not needed (backend uses session)
  if (!documentType || !file) {
    return {
      errors: {
        _form: ['Document type and file are required']
      }
    }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()

    // Use /api/my-documents/upload endpoint which uses session user
    const res = await fetch(`${API_BASE_URL}/api/my-documents/upload`, {
      method: 'POST',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.error || error.message || 'Failed to upload document'] } }
    }

    const data = await res.json()

    // Revalidate caches for my-documents view
    revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to upload document'] } }
  }
}

/**
 * Update document metadata
 * Endpoint: PUT /api/documents/:id
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
    revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update document'] } }
  }
}

/**
 * Partially update document metadata
 * Endpoint: PATCH /api/documents/:id
 */
export async function patchDocumentAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const parsed = updateDocumentSchema.partial().safeParse({
    title: formData.get('title') ?? undefined,
    description: formData.get('description') ?? undefined,
    expiry_date: formData.get('expiry_date') ?? undefined,
    is_confidential: formData.get('is_confidential') === 'true' ? true : undefined,
  })

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
      method: 'PATCH',
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
    revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update document'] } }
  }
}

/**
 * Update document with file replacement
 * Endpoint: PUT /api/documents/:id/update-with-file
 */
export async function updateDocumentWithFileAction(id: string, prevState: unknown, formData: FormData): Promise<ActionResult> {
  const file = formData.get('file')

  if (!file) {
    return {
      errors: {
        _form: ['File is required']
      }
    }
  }

  try {
    const cookieHeader = await getAuthCookieHeader()
    const res = await fetch(`${API_BASE_URL}/api/documents/${id}/update-with-file`, {
      method: 'PUT',
      headers: {
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      body: formData,
    })

    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      return { errors: { _form: [error.message || 'Failed to update document with file'] } }
    }

    const data = await res.json()
    revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to update document with file'] } }
  }
}

/**
 * Delete a document
 * Endpoint: DELETE /api/documents/:id
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

  revalidateEntityMutation('DOCUMENTS', { additionalTags: ['my-documents'], additionalPaths: ['/dashboard/my-documents'] })
}

/**
 * Get document preview URL
 * Endpoint: GET /api/documents/:id/preview
 * Returns the preview URL for browser display
 */
export async function getDocumentPreviewUrl(id: string): Promise<string> {
  return `${API_BASE_URL}/api/documents/${id}/preview`
}

/**
 * Get document download URL
 * Endpoint: GET /api/documents/:id/download
 * Returns the download URL
 */
export async function getDocumentDownloadUrl(id: string): Promise<string> {
  return `${API_BASE_URL}/api/documents/${id}/download`
}

/**
 * Approve a document
 * Endpoint: POST /api/documents/:id/approve
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

  revalidateEntityMutation('DOCUMENTS', { 
    additionalTags: ['my-documents', 'documents'], 
    additionalPaths: ['/dashboard/my-documents', '/dashboard/documents'] 
  })
}

/**
 * Reject a document
 * Endpoint: POST /api/documents/:id/reject
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
    revalidateEntityMutation('DOCUMENTS', { 
      additionalTags: ['my-documents', 'documents'], 
      additionalPaths: ['/dashboard/my-documents', '/dashboard/documents'] 
    })

    return { success: true, data }
  } catch {
    return { errors: { _form: ['Failed to reject document'] } }
  }
}
