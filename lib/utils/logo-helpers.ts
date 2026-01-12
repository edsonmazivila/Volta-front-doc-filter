/**
 * Helper utilities for handling company logos
 * Supports both S3 (presigned URLs) and local storage
 */

/**
 * Get displayable logo URL from logo_path
 * Handles both S3 (presigned URLs) and local storage
 * 
 * @param logoPath - The logo_path from company data
 * @param logoUrl - Optional logo_url from upload response (S3 only)
 * @returns Display URL for the logo or default placeholder
 */
export function getCompanyLogoUrl(
  logoPath?: string | null,
  logoUrl?: string | null
): string {
  // No logo uploaded
  if (!logoPath) {
    return '/logo/default-company-logo.png'
  }

  // If logo_url is provided (from upload response or S3), use it
  if (logoUrl) {
    return logoUrl
  }

  // For local storage, construct download URL
  if (logoPath.startsWith('uploads/')) {
    const filename = logoPath.split('/').pop()
    if (!filename) {
      return '/logo/default-company-logo.png'
    }
    return `/api/company/logo/${encodeURIComponent(filename)}`
  }

  // Fallback
  return '/logo/default-company-logo.png'
}

/**
 * Extract filename from logo_path for download URL construction
 * 
 * @param logoPath - The logo_path from company data
 * @returns Filename or null
 */
export function extractLogoFilename(logoPath?: string | null): string | null {
  if (!logoPath) return null
  
  if (logoPath.startsWith('uploads/')) {
    return logoPath.split('/').pop() || null
  }
  
  return null
}

/**
 * Validate logo file before upload
 * 
 * @param file - The file to validate
 * @returns Error message or null if valid
 */
export function validateCompanyLogo(file: File): string | null {
  // Max size: 5MB
  const MAX_SIZE = 5 * 1024 * 1024
  if (file.size > MAX_SIZE) {
    return 'LOGO_TOO_LARGE'
  }
  
  // Allowed types: PNG, JPEG
  const ALLOWED_TYPES = ['image/png', 'image/jpeg']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'LOGO_INVALID_TYPE'
  }
  
  return null // Valid
}

/**
 * Format file size for display
 * 
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
