'use client';

import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { PORTFOLIO_BACKGROUND_IMAGE_ACCEPT } from '@/components/portfolio/portfolio-background-image-upload';
import { useT } from '@/lib/i18n/I18nProvider';

/** General → Photo, shared by every section that lets the creator swap the profile photo for
 *  its own designs (Footer, Contact). Empty `photoUrl` = the account's profile photo. */
export function PortfolioSettingsPhotoField({
  photoUrl,
  profileAvatarUrl,
  onChange,
  label = 'Photo',
}: {
  photoUrl: string;
  profileAvatarUrl: string | null;
  onChange: (photoUrl: string) => void;
  label?: string;
}) {
  const t = useT();
  const customPhoto = photoUrl.trim();
  const shownPhoto = customPhoto || profileAvatarUrl?.trim() || '';
  // A failed upload reports '' — keep the current photo instead of silently clearing it.
  const { inputRef, uploading, uploadError, pickFile, onFileChange } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: (url) => {
      if (url.trim()) onChange(url.trim());
    },
  });

  return (
    <div>
      <p className="text-[13px] font-medium text-[color:var(--pf-palette-texte-muted)]">{label}</p>
      <div className="mt-4 flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[color:var(--pf-palette-bordure)] bg-[color:var(--pf-surface)]">
          {shownPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shownPhoto} alt="" className="h-full w-full object-cover" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-6 w-6 text-[color:var(--pf-palette-texte-muted)]">
              <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth={1.6} />
              <path d="M5.5 19.5c1.2-3.2 3.7-4.8 6.5-4.8s5.3 1.6 6.5 4.8" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
          )}
        </span>
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-medium text-[color:var(--pf-palette-texte-fort)]">{customPhoto ? t('Custom photo') : t('Profile photo')}</p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={PORTFOLIO_BACKGROUND_IMAGE_ACCEPT}
              className="sr-only"
              aria-label={`${label} file`}
              onChange={(event) => {
                void onFileChange(event);
              }}
            />
            <button
              type="button"
              onClick={pickFile}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full border border-[color:var(--pf-palette-bordure)] bg-transparent px-3.5 py-1.5 text-xs font-semibold text-[color:var(--pf-palette-texte-fort)] transition hover:bg-[color:var(--pf-surface)] disabled:opacity-60"
            >
              {uploading ? <LoadingSpinner size="sm" /> : null}
              {uploading ? t('Uploading…') : customPhoto ? t('Replace') : t('Replace photo')}
            </button>
            {customPhoto ? (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={uploading}
                className="rounded-full px-2 py-1.5 text-xs font-semibold text-[color:var(--pf-palette-texte-muted)] transition hover:text-[color:var(--pf-palette-texte-fort)] disabled:opacity-60"
              >
                {t('Use profile photo')}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      {uploadError ? <p className="mt-2 text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}
