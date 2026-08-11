'use client';

import { useRef, useState } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';
import { uploadContentMedia } from '@/lib/marketplace-api';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

const MEDIA_ACCEPT = 'image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime,application/pdf,.jpg,.jpeg,.png,.webp,.mp4,.webm,.mov,.pdf';

type CreatorContentMediaFieldsProps = {
  locale?: 'fr' | 'en';
  mediaUrl: string;
  mediaError?: string;
  onMediaUrlChange: (url: string) => void;
};

function mediaKind(url: string, fileName?: string | null): 'image' | 'video' | 'pdf' | null {
  const probe = (fileName ?? url).toLowerCase();
  if (/\.(jpe?g|png|webp)(\?|$)/i.test(probe) || probe.includes('image/')) return 'image';
  if (/\.(mp4|webm|mov)(\?|$)/i.test(probe) || probe.includes('video/')) return 'video';
  if (/\.pdf(\?|$)/i.test(probe) || probe.includes('application/pdf')) return 'pdf';
  if (/^https?:\/\//i.test(url)) return 'image';
  return null;
}

export function CreatorContentMediaFields({
  locale = 'fr',
  mediaUrl,
  mediaError,
  onMediaUrlChange,
}: CreatorContentMediaFieldsProps) {
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [mediaFileName, setMediaFileName] = useState<string | null>(null);

  const copy =
    locale === 'fr'
      ? {
          mainLabel: 'Fichier média',
          mainHint: 'Image, vidéo (MP4, WebM, MOV) ou PDF — max 30 Mo (image), 500 Mo (vidéo), 50 Mo (PDF).',
          chooseFile: 'Choisir un fichier',
          replaceFile: 'Remplacer',
          preview: 'Aperçu',
          uploaded: 'Fichier téléversé',
          pdfFile: 'Document PDF',
        }
      : {
          mainLabel: 'Media file',
          mainHint: 'Image, video (MP4, WebM, MOV), or PDF — max 30 MB (image), 500 MB (video), 50 MB (PDF).',
          chooseFile: 'Choose file',
          replaceFile: 'Replace',
          preview: 'Preview',
          uploaded: 'File uploaded',
          pdfFile: 'PDF document',
        };

  const onMediaFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploadingMedia(true);
    try {
      const url = await uploadContentMedia(file);
      onMediaUrlChange(url);
      setMediaFileName(file.name);
    } catch (e) {
      setUploadError(getApiErrorMessage(e, locale === 'fr' ? 'Échec du téléversement.' : 'Upload failed.'));
      onMediaUrlChange('');
      setMediaFileName(null);
    } finally {
      setUploadingMedia(false);
      event.target.value = '';
    }
  };

  const kind = mediaKind(mediaUrl, mediaFileName);

  return (
    <div className="space-y-4">
      {uploadError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{uploadError}</p>
      )}

      <div>
        <p className="text-sm font-medium text-gray-700">{copy.mainLabel}</p>
        <p className="mt-1 text-xs text-gray-500">{copy.mainHint}</p>
        <input
          ref={mediaInputRef}
          type="file"
          accept={MEDIA_ACCEPT}
          className="sr-only"
          onChange={(e) => void onMediaFileChange(e)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => mediaInputRef.current?.click()}
            disabled={uploadingMedia}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            {uploadingMedia ? <LoadingSpinner size="sm" /> : null}
            {mediaUrl ? copy.replaceFile : copy.chooseFile}
          </button>
          {mediaUrl && (
            <span className="text-sm text-gray-600">
              {mediaFileName ?? copy.uploaded}
            </span>
          )}
        </div>
        {mediaError && <p className="mt-1 text-xs text-red-600">{mediaError}</p>}
      </div>

      {mediaUrl && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
          <p className="border-b border-gray-100 px-3 py-2 text-xs text-gray-500">{copy.preview}</p>
          <div className="aspect-video w-full max-w-lg p-3">
            {kind === 'video' ? (
              <video src={mediaUrl} controls className="h-full w-full rounded-lg bg-neutral-100 object-contain dark:bg-neutral-950" />
            ) : kind === 'pdf' ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-gray-200 bg-white text-center">
                <span className="text-3xl" aria-hidden>
                  📄
                </span>
                <p className="text-sm font-medium text-gray-700">{copy.pdfFile}</p>
                <a
                  href={mediaUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  {locale === 'fr' ? 'Ouvrir le PDF' : 'Open PDF'}
                </a>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={mediaUrl} alt="" className="h-full w-full rounded-lg object-cover" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
