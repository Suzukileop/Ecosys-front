'use client';

import { useRef, useState } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

type ProfileImageUploadFieldProps = {
  variant: 'avatar' | 'cover';
  imageUrl?: string | null;
  name?: string;
  label: string;
  hint?: string;
  uploading?: boolean;
  onFileSelect: (file: File) => void | Promise<void>;
};

const ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

export function ProfileImageUploadField({
  variant,
  imageUrl,
  name = '',
  label,
  hint,
  uploading = false,
  onFileSelect,
}: ProfileImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const displayUrl = previewUrl ?? imageUrl ?? null;

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous);
      return objectUrl;
    });
    void onFileSelect(file);
  };

  if (variant === 'avatar') {
    return (
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative shrink-0">
          {displayUrl ? (
            <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={displayUrl} alt="" className="h-full w-full object-cover" />
            </div>
          ) : (
            <Avatar name={name} avatarUrl={null} size="lg" />
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
            {hint && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center justify-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-800 transition hover:bg-orange-100 disabled:opacity-60 dark:border-orange-500/40 dark:bg-orange-500/10 dark:text-orange-200"
            >
              {displayUrl ? 'Change photo' : 'Upload photo'}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => {
                handleFile(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-neutral-700 dark:bg-neutral-800">
        <div className="relative aspect-[3/1] w-full">
          {displayUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={displayUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
              No cover image yet
            </div>
          )}
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <LoadingSpinner size="md" />
            </div>
          )}
        </div>
      </div>
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-300 hover:bg-gray-50 disabled:opacity-60 dark:border-neutral-600 dark:bg-neutral-800 dark:text-gray-100"
      >
        {displayUrl ? 'Change cover' : 'Upload cover'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
}
