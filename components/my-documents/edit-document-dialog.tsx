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
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

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
  const { i18n } = useLingui()
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

  // Ensure we have valid types and filter out duplicates
  const validTypes = (documentTypes.length > 0 ? documentTypes : defaultTypes).filter(
    (type): type is { type: string; display_name: string } => 
      typeof type === 'object' && 
      type !== null && 
      'type' in type && 
      'display_name' in type &&
      typeof type.type === 'string' &&
      typeof type.display_name === 'string'
  )
  
  // Remove duplicates by type
  const types = Array.from(
    new Map(validTypes.map(t => [t.type, t])).values()
  )

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
      toast.error(i18n._(msg`Document type is required`))
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
        toast.error(result.errors._form?.[0] || i18n._(msg`Failed to update document`))
        return
      }

      toast.success(i18n._(msg`Document updated successfully`))
      onOpenChange(false)
      router.refresh()
    } catch {
      toast.error(i18n._(msg`Failed to update document`))
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
            {i18n._(msg`Edit Document`)}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current File Info */}
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>{i18n._(msg`Current file`)}: {document.title || i18n._(msg`Unknown`)}</span>
            </div>
          </div>

          {/* New File (Optional) */}
          <div>
            <label htmlFor="file" className="block text-sm font-medium mb-2">
              {i18n._(msg`Replace File (Optional)`)}
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                {i18n._(msg`New file`)}: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {/* Document Type */}
          <div>
            <label htmlFor="document_type" className="block text-sm font-medium mb-2">
              {i18n._(msg`Document Type`)} <span className="text-red-400">*</span>
            </label>
            <select
              id="document_type"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">{i18n._(msg`Select document type...`)}</option>
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
              {i18n._(msg`Title`)}
            </label>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={i18n._(msg`Document title (optional)`)}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              {i18n._(msg`Description`)}
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-[var(--border)] bg-background text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={i18n._(msg`Document description (optional)`)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? i18n._(msg`Updating...`) : i18n._(msg`Update Document`)}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {i18n._(msg`Cancel`)}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
