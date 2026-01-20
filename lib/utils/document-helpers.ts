/**
 * Document Helpers
 * 
 * Utilities for handling document downloads with presigned URLs
 * Following backend storage guide specifications
 */

export interface DownloadDocumentOptions {
  documentId: string;
  token?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Internal: Download document and throw errors (for retry logic)
 * 
 * @param documentId - Document ID
 * @param token - Optional auth token
 * @throws Error if download fails
 */
async function _downloadDocumentInternal(
  documentId: string,
  token?: string
): Promise<void> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 1. Request presigned URL from backend
  const response = await fetch(`/api/documents/${documentId}/download`, {
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Download failed: ${response.statusText}`);
  }

  const data = await response.json();

  if (!data.success || !data.url) {
    throw new Error(data.error || 'Failed to get download URL');
  }

  // 2. Use presigned URL for direct download
  const link = document.createElement('a');
  link.href = data.url;
  link.download = data.document?.filename || 'document';
  link.click();
}

/**
 * Download a document using presigned URL from backend
 * 
 * ⚠️ Important: Never cache presigned URLs - they expire!
 * Always request fresh URL from backend
 * 
 * @param options - Download options
 */
export async function downloadDocument({
  documentId,
  token,
  onSuccess,
  onError
}: DownloadDocumentOptions): Promise<void> {
  try {
    await _downloadDocumentInternal(documentId, token);
    onSuccess?.();
  } catch (error) {
    console.error('[DocumentHelpers] Download error:', error);
    onError?.(error instanceof Error ? error : new Error('Download failed'));
  }
}

/**
 * Download with retry logic for transient failures
 * 
 * @param documentId - Document ID
 * @param token - Optional auth token
 * @param maxRetries - Maximum number of retry attempts
 */
export async function downloadDocumentWithRetry(
  documentId: string,
  token?: string,
  maxRetries = 2
): Promise<void> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await _downloadDocumentInternal(documentId, token);
      return; // Success
    } catch (error) {
      if (attempt === maxRetries - 1) {
        // Last attempt failed
        throw error;
      }
      // Wait 1 second before retry
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

/**
 * Fetch presigned URL for document preview
 * 
 * ⚠️ Important: URL expires! Need to refresh periodically
 * 
 * @param documentId - Document ID
 * @param token - Optional auth token
 * @returns Presigned URL and document metadata
 */
export async function fetchPresignedUrl(
  documentId: string,
  token?: string
): Promise<{ url: string; document: { id: string; filename: string; type: string; size?: number } | null }> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

  try {
    const response = await fetch(`/api/documents/${documentId}/download`, {
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success || !data.url) {
      throw new Error(data.error || 'Failed to get presigned URL');
    }

    return {
      url: data.url,
      document: data.document,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection.');
    }
    
    throw error;
  }
}

/**
 * Get refresh interval for presigned URLs based on document type
 * 
 * Per backend specifications:
 * - Payslips, Contracts, Tax Docs: 10 minutes (refresh after 8min)
 * - Resumes, Certificates: 45 minutes (refresh after 40min)
 * - Reports: 3 hours (refresh after 2h30min)
 * 
 * @param documentType - Type of document
 * @returns Refresh interval in milliseconds
 */
export function getPresignedUrlRefreshInterval(documentType: string): number {
  const intervals: Record<string, number> = {
    payslip: 8 * 60 * 1000,        // 8 minutes
    contract: 8 * 60 * 1000,       // 8 minutes
    tax_document: 8 * 60 * 1000,   // 8 minutes
    resume: 40 * 60 * 1000,        // 40 minutes
    certificate: 40 * 60 * 1000,   // 40 minutes
    report: 150 * 60 * 1000,       // 2h30min
  };

  return intervals[documentType] || 8 * 60 * 1000; // Default 8 minutes
}
