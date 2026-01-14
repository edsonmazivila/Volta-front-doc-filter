'use client'

/**
 * Document Preview Component
 * 
 * Displays document preview with auto-refresh for presigned URLs
 * Following backend storage guide specifications
 * 
 * ⚠️ Important: Presigned URLs expire! This component auto-refreshes before expiry
 */

import { useEffect, useState, useRef, useCallback } from 'react'
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui'
import { fetchPresignedUrl, getPresignedUrlRefreshInterval } from '@/lib/utils/document-helpers'

interface DocumentPreviewProps {
  documentId: string
  documentType?: string
  className?: string
  height?: string | number
}

export function DocumentPreview({
  documentId,
  documentType = 'payslip',
  className = '',
  height = '800px',
}: DocumentPreviewProps) {
  const [url, setUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const isMountedRef = useRef(true)
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Define loadPresignedUrl outside useEffect so it can be called from retry button
  const loadPresignedUrl = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { url: presignedUrl } = await fetchPresignedUrl(documentId)

      if (isMountedRef.current) {
        setUrl(presignedUrl)
        setLastRefresh(new Date())
        setError(null)

        // Schedule auto-refresh before URL expires
        // Refresh at 80% of expiry time (e.g., 8 min for 10 min expiry)
        const refreshInterval = getPresignedUrlRefreshInterval(documentType)

        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
        }

        refreshTimerRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            console.log('[DocumentPreview] Auto-refreshing presigned URL')
            loadPresignedUrl()
          }
        }, refreshInterval)
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load document'
        setError(errorMessage)
        console.error('[DocumentPreview] Load error:', err)
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [documentId, documentType])

  useEffect(() => {
    isMountedRef.current = true

    loadPresignedUrl()

    return () => {
      isMountedRef.current = false
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [loadPresignedUrl])

  if (isLoading && !url) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading document preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Document</h3>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button
            onClick={loadPresignedUrl}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Auto-refresh indicator */}
      {lastRefresh && (
        <div className="absolute top-2 right-2 z-10 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </div>
      )}

      {/* Document iframe */}
      <iframe
        src={url || ''}
        className="w-full border border-border rounded-lg"
        style={{ height }}
        title="Document Preview"
        sandbox="allow-same-origin allow-popups"
      />
    </div>
  )
}
