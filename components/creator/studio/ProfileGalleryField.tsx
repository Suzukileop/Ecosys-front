'use client';

import { useRef, useState } from 'react';
import type {
  Control,
  FieldArrayWithId,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import {
  ContentMediaPreview,
} from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadContentMedia } from '@/lib/marketplace-api';
import {
  createEmptyGalleryItem,
  inferProfileMediaType,
  type ProfileFormValues,
} from '@/components/creator/studio/profile-form-schema';
import { profileFormLabelClass, profileSectionEmptyClass } from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';

export const MAX_GALLERY = 8;

const GALLERY_MEDIA_ACCEPT =
  'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov';

type ProfileGalleryFieldProps = {
  control: Control<ProfileFormValues>;
  fields: FieldArrayWithId<ProfileFormValues, 'galleryItems', 'id'>[];
  append: (value: ReturnType<typeof createEmptyGalleryItem> | ReturnType<typeof createEmptyGalleryItem>[]) => void;
  remove: (index: number) => void;
  move: (from: number, to: number) => void;
  register: UseFormRegister<ProfileFormValues>;
  setValue: UseFormSetValue<ProfileFormValues>;
  watch: UseFormWatch<ProfileFormValues>;
  readOnly?: boolean;
  values?: ProfileFormValues['galleryItems'];
};

export function ProfileGalleryField({
  fields,
  append,
  remove,
  move,
  setValue,
  watch,
  readOnly = false,
  values = [],
}: ProfileGalleryFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const remainingSlots = MAX_GALLERY - fields.length;

  const onMultiFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);
    setUploading(true);
    try {
      const files = Array.from(fileList).slice(0, Math.max(0, remainingSlots));
      const created: ReturnType<typeof createEmptyGalleryItem>[] = [];
      for (const file of files) {
        const url = await uploadContentMedia(file);
        const item = createEmptyGalleryItem(fields.length + created.length);
        item.mediaUrl = url;
        item.mediaType = inferProfileMediaType(url);
        created.push(item);
      }
      if (created.length === 1) {
        append(created[0]);
      } else if (created.length > 1) {
        append(created);
      }
    } catch (e) {
      setUploadError(getApiErrorMessage(e, 'Upload failed.'));
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  if (readOnly) {
    const filled = values.filter((item) => item.mediaUrl.trim());
    if (filled.length === 0) {
      return <p className={profileSectionEmptyClass}>No media in the gallery.</p>;
    }
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {filled.map((item) => (
          <div
            key={item.id}
            className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
          >
            <ContentMediaPreview
              locale="fr"
              mediaUrl={item.mediaUrl}
              mediaType="FILE"
              large
              fluid
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ProfileSectionItemCount count={fields.length} limit={MAX_GALLERY} unit="gallery items" />

      {fields.length === 0 ? (
        <p className={profileSectionEmptyClass}>No media in the gallery.</p>
      ) : (
        fields.map((field, index) => {
          const mediaUrl = watch(`galleryItems.${index}.mediaUrl`) ?? '';
          return (
            <div
              key={field.id}
              className="space-y-4 rounded-xl border border-neutral-200 p-5 dark:border-neutral-800"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
                  Media {index + 1}
                </p>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-700"
                    aria-label="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                    className="rounded-lg border border-neutral-200 px-2.5 py-1.5 text-sm disabled:opacity-40 dark:border-neutral-700"
                    aria-label="Move down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="rounded-lg border border-red-200 px-2.5 py-1.5 text-sm text-red-700 dark:border-red-500/30 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div>
                <p className={profileFormLabelClass}>Media</p>
                {mediaUrl ? (
                  <div className="mt-2 space-y-2">
                    <ContentMediaPreview
                      locale="fr"
                      mediaUrl={mediaUrl}
                      mediaType="FILE"
                      large
                      fluid
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setValue(`galleryItems.${index}.mediaUrl`, '', { shouldDirty: true });
                        setValue(`galleryItems.${index}.mediaType`, null, { shouldDirty: true });
                      }}
                      className="text-[15px] font-medium text-neutral-700 hover:text-neutral-950 dark:text-neutral-300 dark:hover:text-white"
                    >
                      Remove media
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-amber-700 dark:text-amber-300">
                    No file — use “Add media” below, or remove this item.
                  </p>
                )}
              </div>
            </div>
          );
        })
      )}

      {remainingSlots > 0 ? (
        <div>
          <input
            ref={inputRef}
            type="file"
            accept={GALLERY_MEDIA_ACCEPT}
            multiple
            className="hidden"
            onChange={(event) => void onMultiFileChange(event)}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-neutral-300 px-5 py-2.5 text-[15px] font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            {uploading ? <LoadingSpinner size="sm" /> : null}
            Add media
          </button>
          {uploadError ? <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
