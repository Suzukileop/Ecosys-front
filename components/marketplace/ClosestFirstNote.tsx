'use client';
import { useT } from '@/lib/i18n/I18nProvider';

/**
 * What "Closest first" is based on when the device could not say where the viewer is: their profile
 * location, or nothing (providers keep the default order). A quiet line, not an error.
 */
export function ClosestFirstNote({ profilePlace, onRetry }: { profilePlace: string | null; onRetry: () => void }) {
  const t = useT();
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]" role="status">
      <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
        <circle cx="12" cy="9.5" r="2.5" />
      </svg>
      <span>
        {profilePlace ? (
          <>
            {t('Sorted from')} <span className="font-medium text-[#0F1419] dark:text-[#E7E9EA]">{profilePlace}</span>{t(', the location on your profile — this device didn’t share its position.')}
          </>
        ) : (
          t('This device didn’t share its position, so providers keep the usual order.')
        )}
      </span>
      <button
        type="button"
        onClick={onRetry}
        className="font-semibold text-[#0F1419] underline decoration-[#CFD9DE] underline-offset-4 hover:decoration-current dark:text-[#E7E9EA] dark:decoration-[#536471]"
      >
        {t('Use my current location')}
      </button>
    </div>
  );
}
