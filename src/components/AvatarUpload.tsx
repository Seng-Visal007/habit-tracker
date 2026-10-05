import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { getAvatarMimeType, validateAvatarFile } from '@/lib/avatarValidation';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Upload,
  X,
  Check,
  AlertTriangle,
  Loader2,
  User,
  ImageIcon,
} from 'lucide-react';

interface AvatarUploadProps {
  session: Session;
  currentAvatarUrl?: string | null;
  onAvatarUpdated?: (newUrl: string) => void;
}

export function AvatarUpload({
  session,
  currentAvatarUrl,
  onAvatarUpdated,
}: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(currentAvatarUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const onAvatarUpdatedRef = useRef(onAvatarUpdated);
  useEffect(() => {
    onAvatarUpdatedRef.current = onAvatarUpdated;
  }, [onAvatarUpdated]);

  // 1. Fetch avatar from profiles table on mount
  useEffect(() => {
    let isMounted = true;

    async function loadAvatarOnMount() {
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .maybeSingle();

        if (!isMounted) return;

        if (error) {
          console.warn('Note: Unable to load profile avatar (profiles table might not be initialized yet):', error.message);
        } else if (data?.avatar_url) {
          setAvatarUrl(data.avatar_url);
          onAvatarUpdatedRef.current?.(data.avatar_url);
        }
      } catch (err) {
        console.error('Error fetching profile avatar on mount:', err);
      } finally {
        if (isMounted) setIsLoadingProfile(false);
      }
    }

    loadAvatarOnMount();

    return () => {
      isMounted = false;
    };
  }, [session.user.id]);

  // Clean up object URL on unmount or when previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  // 2. Handle file selection with client-side validation
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset file input value so selecting the same file again triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (!file) return;

    // Reset status and validation errors
    setStatusMessage(null);

    // Validate type and size (<= 1MB)
    const validation = validateAvatarFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid file.');
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      return;
    }

    // Success: create client-side image preview
    setValidationError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);
    setSelectedFile(file);
  };

  // 3. Cancel preview and reset
  const handleCancelPreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
    setValidationError(null);
  };

  // 4. Upload to Supabase Storage with upsert: true and save to profiles.avatar_url
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setStatusMessage(null);

    try {
      const fileExt = selectedFile.name.split('.').pop()?.toLowerCase() || 'png';
      const contentType = getAvatarMimeType(selectedFile);
      if (!contentType) {
        throw new Error('Please select a PNG, JPG, WebP, or GIF image.');
      }
      // Predictable user-isolated path: {user_id}/avatar.{ext}
      // Re-uploading overwrites the file via upsert: true, preventing duplicate accumulation
      const filePath = `${session.user.id}/avatar.${fileExt}`;

      // Step A: Upload to Supabase Storage 'avatars' bucket
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, selectedFile, {
          upsert: true,
          contentType,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Step B: Obtain Public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Step C: Save to profiles.avatar_url
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: session.user.id,
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        });

      if (profileError) {
        throw new Error(`Uploaded to storage, but failed to save profile: ${profileError.message}`);
      }

      // Step D: Update state with cache-busting timestamp to immediately show new image
      const refreshedUrl = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(refreshedUrl);
      onAvatarUpdated?.(refreshedUrl);

      // Clean up preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setSelectedFile(null);
      setStatusMessage({
        type: 'success',
        text: 'Avatar updated and saved to your profile!',
      });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An error occurred during upload.';
      setStatusMessage({
        type: 'error',
        text: errorMessage.includes('row-level security')
          ? 'Upload was blocked by Supabase permissions. Run supabase/avatars_and_profiles.sql in the Supabase SQL Editor, then try again.'
          : errorMessage.includes('Bucket not found')
            ? 'The avatars Storage bucket does not exist yet. Run supabase/avatars_and_profiles.sql in the Supabase SQL Editor, then try again.'
            : errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const displayImage = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="avatar-file-input"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileChange}
        className="sr-only"
        disabled={isUploading}
      />

      {/* Avatar Display Container */}
      <div className="relative group">
        <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-primary/20 shadow-md bg-muted flex items-center justify-center transition-all duration-200 group-hover:border-primary/50">
          {isLoadingProfile ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : displayImage ? (
            <img
              src={displayImage}
              alt="User avatar"
              className="h-full w-full object-cover"
              onError={() => {
                // If image fails to load (e.g. invalid URL), fallback gracefully
                setAvatarUrl(null);
              }}
            />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}

          {/* Quick upload trigger overlay */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            aria-label="Upload avatar image"
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity duration-150 cursor-pointer disabled:cursor-not-allowed"
          >
            <Camera className="h-5 w-5 mb-0.5" />
            <span className="text-[10px] font-medium">Change</span>
          </button>
        </div>

        {/* Small badge indicating unsaved preview */}
        {previewUrl && (
          <span
            title="Preview of chosen image - click Upload to save"
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] font-bold shadow animate-pulse"
          >
            !
          </span>
        )}
      </div>

      {/* Interactive Controls & Feedback */}
      <div className="flex flex-col items-center gap-2 w-full max-w-sm">
        {/* Buttons */}
        {!previewUrl ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2 text-xs"
          >
            <Upload className="h-3.5 w-3.5" />
            Select New Avatar
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-2 w-full animate-in fade-in-50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5 text-primary" />
              <span className="font-medium truncate max-w-45">
                {selectedFile?.name}
              </span>
              <span>
                ({selectedFile ? (selectedFile.size / 1024).toFixed(0) : 0} KB)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
                className="gap-1.5 text-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Save Avatar
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        <p className="text-[11px] text-muted-foreground text-center">
          Images only (PNG, JPG, WebP, GIF) &bull; Maximum size: 1 MB
        </p>

        {/* Clear Inline Validation Error */}
        {validationError && (
          <div
            role="alert"
            className="w-full rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive flex items-start gap-2 animate-in fade-in-50"
          >
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{validationError}</div>
          </div>
        )}

        {/* Status Message (Success / Error) */}
        {statusMessage && (
          <div
            role="status"
            className={`w-full rounded-md p-2.5 text-xs flex items-start gap-2 animate-in fade-in-50 ${
              statusMessage.type === 'success'
                ? 'border border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-400'
                : 'border border-destructive/40 bg-destructive/10 text-destructive'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="h-4 w-4 shrink-0 mt-0.5 text-green-600 dark:text-green-400" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">{statusMessage.text}</div>
          </div>
        )}
      </div>
    </div>
  );
}
