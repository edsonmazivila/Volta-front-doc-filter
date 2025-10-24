'use server'
import { cache } from 'react'
import { getAuthCookieHeader } from '@/lib/auth/server-utils'
import { API_BASE_URL } from '@/lib/config'
import { fetchWithGracefulFallback } from '@/lib/cache-utils'

export interface NotificationItem {
	id: string
	title?: string
	message?: string
	date?: string
	status?: 'unread' | 'read' | 'deleted'
	priority?: 'low' | 'medium' | 'high' | 'urgent'
	type?: string
	action_url?: string
}


export const getNotifications = cache(async (limit = 10): Promise<NotificationItem[]> => {
	const cookieHeader = await getAuthCookieHeader()
	const url = new URL(`${API_BASE_URL}/api/notifications`)
	url.searchParams.set('limit', String(limit))
	
	return fetchWithGracefulFallback(
		async () => {
			const res = await fetch(url.toString(), {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
			})
			
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			
			const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
			const list = (data.notifications || data.items || data.data || []) as unknown[]
			return Array.isArray(list)
				? list.map((n: unknown) => {
					const item = n as Record<string, unknown>
					return {
						id: String(item.id || ''),
						title: item.title ? String(item.title) : undefined,
						message: item.message ? String(item.message) : undefined,
						date: item.date ? String(item.date) : item.created_at ? String(item.created_at) : item.time ? String(item.time) : undefined,
						status: (item.status as 'unread' | 'read' | 'deleted') || 'unread',
						priority: (item.priority as 'low' | 'medium' | 'high' | 'urgent') || 'medium',
						type: item.type ? String(item.type) : undefined,
						action_url: item.action_url ? String(item.action_url) : item.url ? String(item.url) : undefined,
					}
				})
				: []
		},
		[] // fallback to empty array
	)
})

export const getUnreadCount = cache(async (): Promise<number> => {
	const cookieHeader = await getAuthCookieHeader()
	
	return fetchWithGracefulFallback(
		async () => {
			const res = await fetch(`${API_BASE_URL}/api/notifications/count`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					...(cookieHeader && { Cookie: cookieHeader }),
				},
			})
			
			if (!res.ok) throw new Error(`HTTP ${res.status}`)
			
			const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
			return Number(data.unread_count ?? data.unread ?? 0) || 0
		},
		0 // fallback to 0
	)
})

// Server Actions for mutations
export async function markAsReadAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/notifications/${encodeURIComponent(id)}/read`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({}),
	})
	if (!res.ok) throw new Error(`Failed to mark as read: ${res.status}`)
}

export async function markAllReadAction(): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/notifications/mark-all-read`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
		body: JSON.stringify({}),
	})
	if (!res.ok) throw new Error(`Failed to mark all read: ${res.status}`)
}

export async function deleteNotificationAction(id: string): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/notifications/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})
	if (!res.ok) throw new Error(`Failed to delete notification: ${res.status}`)
}

export async function clearAllNotificationsAction(): Promise<void> {
	const cookieHeader = await getAuthCookieHeader()
	const res = await fetch(`${API_BASE_URL}/api/notifications/clear`, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			...(cookieHeader && { Cookie: cookieHeader }),
		},
	})
	if (!res.ok) throw new Error(`Failed to clear notifications: ${res.status}`)
}



