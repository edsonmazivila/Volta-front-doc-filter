/**
 * Image Helpers
 * 
 * Utilities for handling images, URLs, and S3 presigned URLs
 */

/**
 * Check if a URL is an AWS S3 presigned URL
 * 
 * Presigned URLs contain temporary authentication parameters that expire,
 * so they should not be cached by Next.js Image Optimization.
 * 
 * Detection checks for common AWS presigned URL signatures:
 * - X-Amz-Algorithm (v4 signature)
 * - X-Amz-Credential (v4 signature)
 * - X-Amz-Signature (v4 signature)
 * - AWSAccessKeyId (v2 signature)
 * - Signature (v2 signature)
 * 
 * @param url - The URL to check
 * @returns true if the URL appears to be a presigned S3 URL
 */
export function isS3PresignedUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Check for AWS Signature Version 4 parameters
  const hasV4Signature = url.includes('X-Amz-Algorithm=') || 
                         url.includes('X-Amz-Credential=') || 
                         url.includes('X-Amz-Signature=');
  
  // Check for AWS Signature Version 2 parameters (older format)
  const hasV2Signature = url.includes('AWSAccessKeyId=') || 
                         url.includes('Signature=');
  
  return hasV4Signature || hasV2Signature;
}

/**
 * Check if a URL points to an S3 bucket
 * 
 * @param url - The URL to check
 * @returns true if the URL is from an S3 bucket
 */
export function isS3Url(url: string | null | undefined): boolean {
  if (!url) return false;
  
  try {
    const urlObj = new URL(url);
    // Check for common S3 hostname patterns
    return urlObj.hostname.includes('.s3.') || 
           urlObj.hostname.includes('s3-') ||
           urlObj.hostname.includes('s3.amazonaws.com');
  } catch {
    return false;
  }
}
