"use client";

/**
 * Profile Photo Upload Component
 * 
 * Handles profile photo upload and display following backend storage guide:
 * 
 * Upload Flow:
 * 1. User selects photo
 * 2. Upload to backend via /api/auth/profile/photo
 * 3. Backend uploads to S3 and returns CloudFront URL
 * 4. CloudFront URL can be used immediately (no expiration)
 * 
 * Display:
 * - CloudFront URLs: Use Next.js <Image> (optimized, cached)
 * - Presigned URLs (legacy): Use <img> (avoid caching)
 */

import { useState, useRef, useEffect } from "react";
import { enhancedApiClient, isApiError } from "@/lib/http/enhanced-api-client";
import { useApiError } from "@/lib/hooks/useApiError";
import { toast } from "sonner";
import Image from "next/image";
import { Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { isS3PresignedUrl } from "@/lib/utils/image-helpers";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onUploadSuccess?: (photoUrl: string) => void;
  locale?: "en" | "pt-PT";
  className?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/png", "image/jpeg"];

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onUploadSuccess,
  locale = "pt-PT",
  className = "",
}: ProfilePhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(currentPhotoUrl || null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state with prop changes
  useEffect(() => {
    setPhotoUrl(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const { handleError } = useApiError({
    locale,
    onError: (message) => {
      console.error('[ProfilePhotoUpload] Error:', message);
      toast.error(message);
    },
  });

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: locale === "pt-PT" 
          ? "O ficheiro é demasiado grande. Máximo: 5MB"
          : "File is too large. Maximum: 5MB",
      };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: locale === "pt-PT"
          ? "Tipo de ficheiro não permitido. Use PNG ou JPG"
          : "File type not allowed. Use PNG or JPG",
      };
    }

    return { valid: true };
  };

  const uploadPhoto = async (file: File) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("photo", file);

      const response = await enhancedApiClient.post<{ photo_url: string }>(
        "/api/auth/profile/photo",
        formData
      );

      setPhotoUrl(response.photo_url);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.photo_url);
      }

      const successMessage = locale === "pt-PT" 
        ? "Foto carregada com sucesso"
        : "Photo uploaded successfully";
      toast.success(successMessage);
    } catch (error) {
      console.error('[ProfilePhotoUpload] Upload failed:', error);
      if (isApiError(error)) {
        handleError(error.response);
      } else {
        const errorMessage = locale === "pt-PT"
          ? "Erro ao carregar foto"
          : "Error uploading photo";
        toast.error(errorMessage);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadPhoto(file);
    }
  };

  const handleButtonClick = () => {
    inputRef.current?.click();
  };

  // Check if URL is a presigned S3 URL to avoid Next.js Image Optimization caching
  const isPresignedUrl = isS3PresignedUrl(photoUrl);

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* Photo Preview */}
      <div
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 ${
          dragActive ? "border-blue-500" : "border-gray-200 dark:border-gray-700"
        } transition-colors`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {photoUrl ? (
          isPresignedUrl ? (
            // Use regular img tag for presigned URLs to avoid Next.js Image Optimization caching
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt="Profile photo"
              className="object-cover w-full h-full"
            />
          ) : (
            <Image
              src={photoUrl}
              alt="Profile photo"
              fill
              className="object-cover"
              priority
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
        )}
        
        {/* Loading Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="flex flex-col items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleChange}
          className="hidden"
          disabled={uploading}
        />
        
        <Button
          type="button"
          onClick={handleButtonClick}
          disabled={uploading}
          variant="outline"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {locale === "pt-PT" ? "A carregar..." : "Uploading..."}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {locale === "pt-PT" ? "Carregar Foto" : "Upload Photo"}
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          {locale === "pt-PT"
            ? "PNG ou JPG, máximo 5MB"
            : "PNG or JPG, maximum 5MB"}
        </p>
      </div>
    </div>
  );
}
