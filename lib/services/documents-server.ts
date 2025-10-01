'use server'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { handleServiceError } from '@/lib/http/error-handler'

export type DocumentStatus = 'uploaded' | 'approved' | 'rejected' | 'expired' | 'pending'

export interface DocumentListItem {
	id: string
	employeeName: string
	title: string
	type: string
	status: DocumentStatus
	createdAt?: string
	sizeBytes?: number
}

interface DocumentsResponseShape {
	documents?: unknown[]
	data?: unknown[]
}

export async function fetchDocuments(): Promise<DocumentListItem[]> {
	try {
		const cookieHeader = await getAuthCookieHeader()
		const headers: Record<string, string> = { 'Content-Type': 'application/json' }
		if (cookieHeader) headers['Cookie'] = cookieHeader

		const res = await fetch(`${API_BASE_URL}/api/documents`, {
			method: 'GET',
			headers,
			cache: 'no-store',
		})
		if (!res.ok) throw new Error(`Failed to fetch documents: ${res.status}`)
		const json: DocumentsResponseShape = await res.json().catch(() => ({} as DocumentsResponseShape))
		const raw = (json.documents || json.data || []) as any[]
		return raw.map((d) => {
			const emp = d.employee || d.user || undefined
			const empUser = emp?.user || emp
			const first = empUser?.first_name ?? empUser?.firstName ?? ''
			const last = empUser?.last_name ?? empUser?.lastName ?? ''
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
	} catch (error) {
		return handleServiceError(error, 'fetchDocuments', 'Failed to load documents')
	}
}

export interface DocumentTypeItem {
  type: string
  display_name: string
}

export async function fetchDocumentTypes(): Promise<DocumentTypeItem[]> {
  try {
    const cookieHeader = await getAuthCookieHeader()
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (cookieHeader) headers['Cookie'] = cookieHeader

    const res = await fetch(`${API_BASE_URL}/api/documents/types`, {
      method: 'GET',
      headers,
      cache: 'no-store',
    })
    if (!res.ok) return []
    const json: { document_types?: Array<{ type: string, display_name: string }>, types?: string[] } = await res.json().catch(() => ({} as any))
    if (Array.isArray(json.document_types)) return json.document_types
    if (Array.isArray(json.types)) return json.types.map(t => ({ type: t, display_name: t }))
    return []
  } catch {
    return []
  }
}


