'use client'

import { apiClient } from '@/lib/http/api-client'

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
	const json = await apiClient.get<unknown>('/api/notifications', undefined, { searchParams: { limit } })
	const data = (json as Record<string, unknown>) || {}
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
		const json = await apiClient.get<unknown>('/api/notifications/count')
		const data = json as Record<string, unknown>
		return Number(data.unread_count ?? data.unread ?? 0) || 0
	} catch {
		return 0
	}
}

export async function markAsRead(id: string): Promise<void> {
	await apiClient.put(`/api/notifications/${id}/read`, {})
}

export async function deleteNotification(id: string): Promise<void> {
	await apiClient.delete(`/api/notifications/${id}`)
}

export async function clearAllNotifications(): Promise<void> {
	await apiClient.delete('/api/notifications/clear')
}


