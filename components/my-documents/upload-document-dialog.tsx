'use client'
import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui'
import { Input } from '@/components/ui/input'
import { uploadDocumentAction } from '@/lib/services/documents'
import { useToastHelpers } from '@/components/ui/toast'
import { useRouter } from 'next/navigation'
import { useLingui } from "@lingui/react"
import { msg } from "@lingui/core/macro"

interface UploadDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employeeId?: string
  documentTypes?: Array<{ type: string; display_name: string }>
}

export function UploadDocumentDialog({
  open,
  onOpenChange,
  employeeId,
  documentTypes = [],
}: UploadDocumentDialogProps) {
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedFile || !documentType) {
      toast.error(i18n._(msg`Please select a file and document type`))
      return
    }

    setIsSubmitting(true)
    try {
      const formData = new FormData()
      if (employeeId) formData.append('employee_id', employeeId)
      formData.append('file', selectedFile)
      formData.append('document_type', documentType)
      if (title) formData.append('title', title)
      if (description) formData.append('description', description)

      const result = await uploadDocumentAction(null, formData)

      if ('errors' in result) {
        toast.error(result.errors._form?.[0] || i18n._(msg`Failed to upload document`))
        return
      }

      toast.success(i18n._(msg`Document uploaded successfully`))
      onOpenChange(false)
      router.refresh()

      // Reset form
      setSelectedFile(null)
      setTitle('')
      setDocumentType('')
      setDescription('')
    } catch {
      toast.error(i18n._(msg`Failed to upload document`))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{i18n._(msg`Upload Document`)}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="file" className="block text-sm font-medium mb-2">
              {i18n._(msg`File`)} <span className="text-red-400">*</span>
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              required
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            />
            {selectedFile && (
              <p className="text-xs text-muted-foreground mt-1">
                {i18n._(msg`Selected`)}: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

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
              <option value="">{i18n._(msg`Select type...`)}</option>
              {types.map((type) => (
                <option key={type.type} value={type.type}>
                  {type.display_name}
                </option>
              ))}
            </select>
          </div>

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
              placeholder={i18n._(msg`Additional notes (optional)`)}
            />
          </div>

          <div className="flex gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? i18n._(msg`Uploading...`) : i18n._(msg`Upload`)}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
