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

export interface NotificationsResponse {
	notifications: NotificationItem[]
}

export async function getNotifications(limit = 10): Promise<NotificationItem[]> {
	const url = new URL(`/api/notifications`, typeof window === 'undefined' ? 'http://localhost' : window.location.origin)
	url.searchParams.set('limit', String(limit))
	const res = await fetch(url.toString(), {
		method: 'GET',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	})
	if (!res.ok) return []
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
}

export async function getUnreadCount(): Promise<number> {
	try {
		const res = await fetch(`/api/notifications/count`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json' },
			credentials: 'include',
		})
		if (!res.ok) return 0
		const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
		return Number(data.unread_count ?? data.unread ?? 0) || 0
	} catch {
		return 0
	}
}

export async function markAsRead(id: string): Promise<void> {
	const res = await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({}),
	})
	if (!res.ok) throw new Error(`Failed to mark as read: ${res.status}`)
}

export async function markAllRead(): Promise<void> {
	const res = await fetch(`/api/notifications/mark-all-read`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({}),
	})
	if (!res.ok) throw new Error(`Failed to mark all read: ${res.status}`)
}

export async function deleteNotification(id: string): Promise<void> {
	const res = await fetch(`/api/notifications/${encodeURIComponent(id)}`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	})
	if (!res.ok) throw new Error(`Failed to delete notification: ${res.status}`)
}

export async function clearAllNotifications(): Promise<void> {
	const res = await fetch(`/api/notifications/clear`, {
		method: 'DELETE',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
	})
	if (!res.ok) throw new Error(`Failed to clear notifications: ${res.status}`)
}


