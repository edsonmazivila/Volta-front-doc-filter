'use client'

/**
 * Document Download Button Component
 * 
 * Handles downloading documents via presigned URLs
 * Following backend storage guide specifications
 */

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { downloadDocument } from '@/lib/utils/document-helpers'
import { toast } from 'sonner'

interface DocumentDownloadButtonProps {
  documentId: string
  filename: string
  documentType?: string
  variant?: 'default' | 'outline' | 'ghost' | 'primaryGradient'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  children?: React.ReactNode
}

export function DocumentDownloadButton({
  documentId,
  filename,
  documentType = 'document',
  variant = 'outline',
  size = 'default',
  className,
  children,
}: DocumentDownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload() {
    setIsDownloading(true)

    await downloadDocument({
      documentId,
      onSuccess: () => {
        toast.success(`${filename} downloaded successfully`)
        
        // Optional: Track analytics
        if (typeof window !== 'undefined' && window.analytics) {
          window.analytics.track('document_downloaded', {
            document_id: documentId,
            document_type: documentType,
            filename,
          })
        }
      },
      onError: (error) => {
        console.error('[DocumentDownloadButton] Download failed:', error)
        toast.error(error.message || 'Failed to download document. Please try again.')
      },
    })

    setIsDownloading(false)
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={isDownloading}
      variant={variant}
      size={size}
      className={className}
    >
      {isDownloading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Downloading...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          {children || 'Download'}
        </>
      )}
    </Button>
  )
}
