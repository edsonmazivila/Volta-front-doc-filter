"use client";

/**
 * User Avatar Component
 * 
 * Reusable avatar component that displays user profile photo
 * with automatic fallback to initials or default avatar.
 */

import React from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { isS3PresignedUrl } from "@/lib/utils/image-helpers";

interface UserAvatarProps {
  photoUrl?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-24 h-24 text-xl",
};

const SIZE_PX = {
  sm: 32,
  md: 40,
  lg: 64,
  xl: 96,
};

/**
 * Get user initials from full name
 */
function getInitials(name?: string | null): string {
  if (!name) return "";
  
  const parts = name.trim().split(" ").filter(p => p.length > 0);
  if (parts.length === 0) return "";
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Generate a consistent background color based on name
 */
function getBackgroundColor(name?: string | null): string {
  if (!name) return "bg-gray-400";
  
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export function UserAvatar({ 
  photoUrl, 
  name, 
  size = "md",
  className = "" 
}: UserAvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const sizeClass = SIZE_MAP[size];
  const sizePx = SIZE_PX[size];
  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);

  // Reset error state when photoUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [photoUrl]);

  // Check if URL is a presigned S3 URL to avoid Next.js Image Optimization caching
  const isPresignedUrl = isS3PresignedUrl(photoUrl);

  return (
    <div 
      className={`relative ${sizeClass} rounded-full overflow-hidden flex-shrink-0 ${className}`}
    >
      {photoUrl && !imageError ? (
        isPresignedUrl ? (
          // Use regular img tag for presigned URLs to avoid Next.js Image Optimization caching
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={name || "User"}
            className="object-cover w-full h-full"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <Image
            src={photoUrl}
            alt={name || "User"}
            width={sizePx}
            height={sizePx}
            className="object-cover w-full h-full"
            onError={() => {
              setImageError(true);
            }}
          />
        )
      ) : initials ? (
        <div 
          className={`w-full h-full ${bgColor} flex items-center justify-center text-white font-semibold`}
        >
          {initials}
        </div>
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <User className="w-1/2 h-1/2 text-gray-400" />
        </div>
      )}
    </div>
  );
}
