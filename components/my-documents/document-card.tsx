'use client'
import type { DocumentListItem } from '@/lib/services/documents'
import { Button } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Trash2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface DocumentCardProps {
  document: DocumentListItem
  onDownload: (id: string) => void
  onDelete?: (id: string) => void
}

export function DocumentCard({ document, onDownload, onDelete }: DocumentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'uploaded':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formattedDate = document.createdAt
    ? format(parseISO(document.createdAt), 'MMM d, yyyy')
    : 'Unknown date'

  const displayType = document.type
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <div className="border border-[var(--border)] rounded-lg p-4 bg-card hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-card-foreground truncate mb-1">
            {document.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{displayType}</p>

          <div className="flex items-center gap-2 mb-3">
            <Badge className={getStatusColor(document.status)}>
              {document.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formattedDate}
            </span>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            {formatFileSize(document.sizeBytes)}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDownload(document.id)}
              className="flex-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(document.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
