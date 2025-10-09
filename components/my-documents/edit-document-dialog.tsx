'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { updateDocumentAction } from '@/lib/services/documents'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { FileText, Edit } from 'lucide-react'
import type { DocumentListItem } from '@/lib/services/documents'

interface EditDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  document: DocumentListItem | null
  documentTypes?: Array<{ type: string; display_name: string }>
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  documentTypes = [],
}: EditDocumentDialogProps) {
  const router = useRouter()
  const toast = useToastHelpers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')

  const defaultTypes = [
    { type: 'identity_card', display_name: 'Identity Card' },
    { type: 'contract', display_name: 'Contract' },
    { type: 'resume', display_name: 'Resume' },
    { type: 'medical_certificate', display_name: 'Medical Certificate' },
    { type: 'training_certificate', display_name: 'Training Certificate' },
    { type: 'performance_review', display_name: 'Performance Review' },
    { type: 'other', display_name: 'Other' },
  ]

  const types = documentTypes.length > 0 ? documentTypes : defaultTypes

  // Initialize form when dialog opens or document changes
  useEffect(() => {
    if (open && document) {
      setTitle(document.title || '')
      setDocumentType(document.type || '')
      setDescription('') // Description not available in DocumentListItem
      setSelectedFile(null) // Reset file selection
    }
  }, [open, document])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!document) return

    if (!documentType) {
      toast.error('Document type is required')
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('document_type', documentType)
      if (title) formData.append('title', title)
      if (description) formData.append('description', description)
      if (selectedFile) formData.append('file', selectedFile)

      const result = await updateDocumentAction(document.id, null, formData)

      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || 'Failed to update document')
        return
      }

      toast.success('Document updated successfully')
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error('Failed to update document')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false)
    }
  }

  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Document
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current File Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Current file: {document.title || 'Unknown'}</span>
            </div>
          </div>

          {/* New File (Optional) */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium mb-2">
              Replace File (Optional)
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                New file: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label htmlFor="document_type" className="block text-sm font-medium mb-2">
              Document Type <span className="text-red-400">*</span>
            </label>
            <select
              id="document_type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select document type...</option>
              {types.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.display_name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document title (optional)"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Document description (optional)"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Updating...' : 'Update Document'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
