'use client'
import React, { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { getCompanyLogoUrl, validateCompanyLogo } from '@/lib/utils/logo-helpers'
import { toast } from 'sonner'
import { useLingui } from '@lingui/react'
import { msg } from '@lingui/core/macro'

interface CompanyLogoUploadProps {
  currentLogoPath?: string | null
  currentLogoUrl?: string | null
  companyName: string
  onLogoUpdated?: (data: { logo_path: string; logo_url?: string }) => void
  className?: string
  disabled?: boolean
}

export function CompanyLogoUpload({
  currentLogoPath,
  currentLogoUrl,
  companyName,
  onLogoUpdated,
  className,
  disabled = false,
}: CompanyLogoUploadProps) {
  const { i18n } = useLingui()
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null)
  const [logoPath, setLogoPath] = useState<string | null>(currentLogoPath || null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = getCompanyLogoUrl(logoPath || currentLogoPath, logoUrl || currentLogoUrl)

  const handleFileSelect = async (file: File) => {
    // Client-side validation
    const validationError = validateCompanyLogo(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      console.log('[CompanyLogoUpload] Uploading logo...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      })

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[CompanyLogoUpload] Upload failed:', errorData)
        throw new Error(errorData.error || errorData.message || 'Upload failed')
      }

      const data = await response.json()
      console.log('[CompanyLogoUpload] Upload successful, backend response:', data)

      // Update local state
      setLogoPath(data.logo_path)
      setLogoUrl(data.logo_url || null)

      toast.success(i18n._(msg`Company logo updated successfully`))

      // Notify parent component
      if (onLogoUpdated) {
        onLogoUpdated(data)
      }

      // Trigger page reload to update company data after a short delay
      setTimeout(() => {
        console.log('[CompanyLogoUpload] Reloading page...')
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error('[CompanyLogoUpload] Logo upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLogoPath(null)
    setLogoUrl(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Logo Preview & Upload Area */}
      <div
        className={cn(
          'relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 dark:border-gray-700',
          !disabled && 'cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800',
          disabled && 'opacity-50 cursor-not-allowed',
          uploading && 'pointer-events-none'
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!disabled ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleChange}
          disabled={disabled || uploading}
          className="hidden"
          aria-label="Upload company logo"
        />

        <div className="p-8 text-center">
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {i18n._(msg`Uploading logo...`)}
              </p>
            </div>
          ) : displayUrl !== '/logo/default-company-logo.png' ? (
            <div className="relative">
              <div className="relative h-32 w-32 mx-auto rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={displayUrl}
                  alt={companyName}
                  fill
                  className="object-contain"
                  unoptimized={displayUrl.startsWith('/api/')}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = '/logo/default-company-logo.png'
                  }}
                />
              </div>
              {!disabled && (
                <button
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  aria-label="Remove logo"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                <Upload className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {i18n._(msg`Click to upload or drag and drop`)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {i18n._(msg`PNG or JPG (max. 5MB)`)}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Change Logo Button (when logo exists) */}
      {displayUrl !== '/logo/default-company-logo.png' && !uploading && !disabled && (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {i18n._(msg`Change Logo`)}
        </Button>
      )}

      {/* Help Text */}
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {i18n._(msg`Recommended size: 400x400px or larger. Maximum file size: 5MB.`)}
      </p>
    </div>
  )
}

/**
 * Compact company logo upload component for use in forms
 */
interface CompanyLogoUploadCompactProps {
  currentLogoPath?: string | null
  currentLogoUrl?: string | null
  companyName: string
  onLogoUpdated?: (data: { logo_path: string; logo_url?: string }) => void
  disabled?: boolean
}

export function CompanyLogoUploadCompact({
  currentLogoPath,
  currentLogoUrl,
  companyName,
  onLogoUpdated,
  disabled = false,
}: CompanyLogoUploadCompactProps) {
  const { i18n } = useLingui()
  const [uploading, setUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(currentLogoUrl || null)
  const [logoPath, setLogoPath] = useState<string | null>(currentLogoPath || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const displayUrl = getCompanyLogoUrl(logoPath || currentLogoPath, logoUrl || currentLogoUrl)

  const handleFileSelect = async (file: File) => {
    const validationError = validateCompanyLogo(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/company/logo', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.message || 'Upload failed')
      }

      const data = await response.json()

      setLogoPath(data.logo_path)
      setLogoUrl(data.logo_url || null)

      toast.success(i18n._(msg`Company logo updated successfully`))

      if (onLogoUpdated) {
        onLogoUpdated(data)
      }
    } catch (err) {
      console.error('Logo upload error:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={handleChange}
        disabled={disabled || uploading}
        className="hidden"
      />

      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
        <Image
          src={displayUrl}
          alt={companyName}
          fill
          className="object-contain"
          unoptimized={displayUrl.startsWith('/api/')}
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/logo/default-company-logo.png'
          }}
        />
      </div>

      <div className="flex-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {i18n._(msg`Uploading...`)}
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              {i18n._(msg`Upload Logo`)}
            </>
          )}
        </Button>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {i18n._(msg`PNG or JPG (max. 5MB)`)}
        </p>
      </div>
    </div>
  )
}
