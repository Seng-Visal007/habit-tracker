/**
 * Avatar File Validation Utilities
 * Hand-written client-side validation logic to guard against hostile or invalid inputs.
 */

export interface AvatarValidationResult {
  isValid: boolean;
  error?: string;
}

// 1 MB limit in bytes (1024 * 1024)
export const MAX_AVATAR_SIZE_BYTES = 1 * 1024 * 1024;

// Permitted MIME types for avatar images
export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

const MIME_TYPE_BY_EXTENSION: Record<string, (typeof ALLOWED_AVATAR_MIME_TYPES)[number]> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
};

/** Returns the MIME type accepted by the Storage bucket for this file, if any. */
export function getAvatarMimeType(file: File): (typeof ALLOWED_AVATAR_MIME_TYPES)[number] | null {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const mimeTypeFromExtension = MIME_TYPE_BY_EXTENSION[extension];
  const mimeType = file.type.toLowerCase();

  // Some browsers omit File.type. In that case, use the known extension so the
  // upload still sends a MIME type accepted by Supabase Storage.
  if (!mimeType) return mimeTypeFromExtension ?? null;

  return ALLOWED_AVATAR_MIME_TYPES.includes(
    mimeType as (typeof ALLOWED_AVATAR_MIME_TYPES)[number],
  ) && mimeTypeFromExtension
    ? mimeTypeFromExtension
    : null;
}

/**
 * Validates a user-provided avatar file against type and size constraints.
 * 
 * Rules:
 * 1. Must be a valid File object.
 * 2. File type must be an image (JPEG, PNG, WebP, GIF).
 * 3. File size must be <= 1 MB (1,048,576 bytes).
 * 
 * @param file The File selected by the user.
 * @returns AvatarValidationResult with isValid flag and polite, user-friendly error message.
 */
export function validateAvatarFile(file: File | null | undefined): AvatarValidationResult {
  if (!file) {
    return {
      isValid: false,
      error: 'Please choose an image file to upload.',
    };
  }

  // 1. Validate File Type (Images only)
  if (!getAvatarMimeType(file)) {
    const rawExtension = file.name.split('.').pop()?.toUpperCase() || 'unknown';
    return {
      isValid: false,
      error: `Unsupported file type (${rawExtension}). Please select a standard image (JPEG, PNG, WebP, or GIF).`,
    };
  }

  // 2. Validate File Size (<= 1 MB)
  if (file.size > MAX_AVATAR_SIZE_BYTES) {
    const actualSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File is too large (${actualSizeMb} MB). Avatars must be 1.00 MB or smaller.`,
    };
  }

  // Passed all checks
  return { isValid: true };
}
