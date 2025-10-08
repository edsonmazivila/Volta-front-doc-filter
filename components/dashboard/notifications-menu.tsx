"use client"

import React from 'react'
import { Bell, Check, Trash2 } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

export function NotificationsMenu() {
  const [loading, setLoading] = React.useState(false)
  const [items, setItems] = React.useState<Array<{ id: string; title?: string; message?: string; date?: string; status?: string; action_url?: string }>>([])
  const [unreadCount, setUnreadCount] = React.useState(0)

  async function refreshNotifications() {
    try {
      setLoading(true)
      const [{ getNotifications }, { getUnreadCount }] = await Promise.all([
        import('@/lib/services/notifications'),
        import('@/lib/services/notifications')
      ])
      const [list, count] = await Promise.all([getNotifications(10), getUnreadCount()])
      setItems(list)
      setUnreadCount(count)
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkAsRead(id: string) {
    const { markAsRead } = await import('@/lib/services/notifications')
    await markAsRead(id)
    await refreshNotifications()
  }

  async function handleDelete(id: string) {
    const { deleteNotification } = await import('@/lib/services/notifications')
    await deleteNotification(id)
    await refreshNotifications()
  }

  async function handleClearAll() {
    const { clearAllNotifications } = await import('@/lib/services/notifications')
    await clearAllNotifications()
    await refreshNotifications()
  }

  return (
    <DropdownMenu onOpenChange={(open) => { if (open) void refreshNotifications() }}>
      <DropdownMenuTrigger asChild>
        <button aria-label='Notifications' className='relative rounded-full p-1 hover:bg-accent focus:outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]'>
          <Bell size={16} />
          {unreadCount > 0 && (
            <span className='absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-white text-[10px] leading-4 text-center'>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-80'>
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <div className='max-h-64 overflow-auto'>
          {loading ? (
            <div className='px-3 py-4 text-sm text-muted-foreground'>Loading…</div>
          ) : items.length === 0 ? (
            <div className='px-3 py-4 text-sm text-muted-foreground'>No notifications</div>
          ) : (
            <div className='divide-y divide-[var(--border)]'>
              {items.map(n => (
                <div key={n.id} className='px-3 py-2 flex items-start gap-2'>
                  <div className='flex-1 min-w-0'>
                    <div className='text-sm font-medium truncate'>{n.title || 'Notification'}</div>
                    {n.message && <div className='text-xs text-muted-foreground line-clamp-2'>{n.message}</div>}
                    <div className='mt-1 text-[10px] text-muted-foreground'>{n.date || ''}</div>
                  </div>
                  <div className='flex items-center gap-1'>
                    {n.status !== 'read' && (
                      <button className='p-1 rounded hover:bg-accent' aria-label='Mark as read' onClick={() => void handleMarkAsRead(n.id)}>
                        <Check size={14} />
                      </button>
                    )}
                    <button className='p-1 rounded hover:bg-accent' aria-label='Delete' onClick={() => void handleDelete(n.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className='px-2 py-1 flex items-center justify-between'>
          <button className='text-xs underline hover:no-underline opacity-80' onClick={() => void refreshNotifications()}>Refresh</button>
          <button className='text-xs underline hover:no-underline opacity-80' onClick={() => void handleClearAll()}>Clear all</button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


