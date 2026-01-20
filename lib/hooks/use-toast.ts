/**
 * Toast Hook - Simplified toast system
 */

export function useToast() {
  const toast = ({ title, description, variant }: {
    title: string
    description?: string
    variant?: 'default' | 'destructive'
  }) => {
    // Simple implementation using native alert for now
    // Can be replaced with a proper toast library like sonner or shadcn toast
    if (typeof window !== 'undefined') {
      const message = description ? `${title}\n${description}` : title
      if (variant === 'destructive') {
        alert(`❌ ${message}`)
      } else {
        alert(`✅ ${message}`)
      }
    }
  }

  return { toast }
}
