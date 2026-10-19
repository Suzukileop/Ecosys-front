'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getApiErrorMessage } from '@/lib/api-error';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { updateUserProfile } from '@/lib/user-profile-api';
import { requestDetectedLocation } from '@/lib/geolocation';
import { collapseRepeatedBio, isRepeatedBioContent } from '@/lib/profile-bio';
import { parseSpecialtyList } from '@/lib/specialties';
import { SpecialtyMultiSelect } from '@/components/creator/studio/SpecialtyMultiSelect';
import { profileSchema } from '@/components/creator/studio/profile-form-schema';
import {
  PRIMARY_BUTTON_CLASS,
  SECONDARY_BUTTON_CLASS,
  Spinner,
  TextField,
} from '@/components/settings/settingsUi';
import type { CreatorProfileDto, CreatorProfileUpdateBody } from '@/types/profile';
import { useT } from '@/lib/i18n/I18nProvider';

/*
 * Limits come from the profile form's zod schema (the same one the Profile tab validates with), so the
 * intro and the full form can never disagree on how long a bio or a status line may be. Zod 4 keeps
 * `.superRefine` on the object itself, so the field schemas are reachable through `.shape`.
 */
const NAME_MAX = profileSchema.shape.fullName.maxLength ?? 150;
const BIO_MAX = profileSchema.shape.bio.unwrap().maxLength ?? 8000;
const STATUS_MAX = profileSchema.shape.availabilityLabel.unwrap().maxLength ?? 80;

const subscribeNoop = () => () => {};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const FOCUS_RING = 'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]';

type Coords = { lat: number; lng: number; timezoneId: string };

/** What the intro edits — exactly the fields the profile header shows. */
type IntroDraft = {
  fullName: string;
  specialties: string[];
  bio: string;
  locationCity: string;
  locationCountry: string;
  isAvailable: boolean;
  availabilityLabel: string;
};

function draftFromProfile(profile: CreatorProfileDto, fallbackName: string): IntroDraft {
  return {
    fullName: profile.fullName?.trim() || fallbackName,
    specialties: parseSpecialtyList(profile.specialties, profile.specialite),
    bio: collapseRepeatedBio(profile.bio ?? ''),
    locationCity: profile.locationCity?.trim() ?? '',
    locationCountry: profile.locationCountry?.trim() ?? '',
    isAvailable: profile.isAvailable ?? true,
    availabilityLabel: profile.availabilityLabel?.trim() ?? '',
  };
}

function coordsFromProfile(profile: CreatorProfileDto): Coords | null {
  const { locationLat: lat, locationLng: lng, timezoneId } = profile;
  if (lat == null || lng == null || !timezoneId?.trim()) return null;
  return { lat, lng, timezoneId: timezoneId.trim() };
}

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((item, i) => item === b[i]);

/** Field-by-field diff against what was loaded: only the changed fields are sent. */
function diffDraft(base: IntroDraft, next: IntroDraft) {
  return {
    fullName: next.fullName.trim() !== base.fullName.trim(),
    specialties: !sameList(next.specialties, base.specialties),
    bio: next.bio.trim() !== base.bio.trim(),
    location:
      next.locationCity.trim() !== base.locationCity.trim() ||
      next.locationCountry.trim() !== base.locationCountry.trim(),
    isAvailable: next.isAvailable !== base.isAvailable,
    availabilityLabel: next.availabilityLabel.trim() !== base.availabilityLabel.trim(),
  };
}

type EditIntroModalProps = {
  open: boolean;
  onClose: () => void;
  /** Called after a successful save, before the dialog closes — refetch the header here. */
  onSaved?: () => void | Promise<void>;
  /** The control that opened the dialog (the pencil, or the phone "Edit profile" button). */
  returnFocusRef?: RefObject<HTMLElement | null>;
};

/**
 * "Edit intro" — LinkedIn's in-place editor for the profile header: name, specialties, bio, location
 * and availability, the things a visitor reads first. Account identity (username, which is the profile
 * URL, and email) stays in Settings › Account; a quiet link at the bottom points there.
 *
 * The dialog body is mounted fresh on every open so the draft always starts from the saved profile.
 */
export function EditIntroModal({ open, onClose, onSaved, returnFocusRef }: EditIntroModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, () => true, () => false);
  if (!open || !mounted) return null;
  return createPortal(
    <EditIntroDialog onClose={onClose} onSaved={onSaved} returnFocusRef={returnFocusRef} />,
    document.body
  );
}

function EditIntroDialog({ onClose, onSaved, returnFocusRef }: Omit<EditIntroModalProps, 'open'>) {
  const t = useT();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const titleId = useId();
  const bioId = useId();
  const bioCounterId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const nameId = useId();
  const formId = useId();
  const keepEditingRef = useRef<HTMLButtonElement>(null);

  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [loadError, setLoadError] = useState<string | null>(null);
  const [base, setBase] = useState<IntroDraft | null>(null);
  const [draft, setDraft] = useState<IntroDraft | null>(null);
  const [savedCoords, setSavedCoords] = useState<Coords | null>(null);
  const [detectedCoords, setDetectedCoords] = useState<Coords | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ fullName?: string; bio?: string; location?: string }>({});
  /* Set when closing would throw away edits: the footer turns into "Discard changes?" and holds what to
     do once the owner confirms (close, or follow the Account settings link). */
  const [pendingDiscard, setPendingDiscard] = useState<null | (() => void)>(null);

  const changes = base && draft ? diffDraft(base, draft) : null;
  const dirty = Boolean(detectedCoords) || (changes ? Object.values(changes).some(Boolean) : false);

  const load = useCallback(async () => {
    setLoadState('loading');
    setLoadError(null);
    try {
      /* Read the profile fresh rather than from the header: the header only carries a formatted
         location label, and the save needs the stored coordinates and timezone. */
      const res = await api.get<CreatorProfileDto>('/api/creator/profile');
      const next = draftFromProfile(res.data, user?.fullName ?? '');
      setBase(next);
      setDraft(next);
      setSavedCoords(coordsFromProfile(res.data));
      setLoadState('ready');
    } catch (e) {
      setLoadError(getApiErrorMessage(e, t('Unable to load your profile.')));
      setLoadState('error');
    }
  }, [user?.fullName, t]);

  useEffect(() => {
    void load();
    // Load once per open; the dialog is remounted on every open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Page scroll is locked while the dialog is up; on close, focus goes back to the control that opened
     it (or whatever had focus before, as a fallback). */
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    // The opener is recorded before the dialog mounts, so it is read once here.
    const opener = returnFocusRef?.current ?? null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
      const target = opener ?? previous;
      if (target && document.contains(target)) target.focus();
    };
  }, [returnFocusRef]);

  /* First focus: the name field once the profile is in, the close button while it loads. */
  useEffect(() => {
    if (loadState === 'ready') document.getElementById(nameId)?.focus();
    else closeButtonRef.current?.focus();
  }, [loadState, nameId]);

  useEffect(() => {
    if (pendingDiscard) keepEditingRef.current?.focus();
  }, [pendingDiscard]);

  const requestClose = useCallback(
    (then: () => void = onClose) => {
      if (saving) return;
      if (dirty) {
        setPendingDiscard(() => then);
        return;
      }
      then();
    },
    [dirty, onClose, saving]
  );

  /* Keyboard: Escape closes (or backs out of the discard prompt), Tab cycles inside the panel. Listening
     in the capture phase lets an open specialty suggestion list (a combobox with aria-expanded) take its
     own Escape first. A focusin guard pulls focus back if it ever lands outside the panel. */
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const panel = panelRef.current;
      if (!panel) return;
      if (e.key === 'Escape') {
        const target = e.target as HTMLElement | null;
        if (target?.getAttribute('aria-expanded') === 'true') return;
        e.preventDefault();
        if (pendingDiscard) setPendingDiscard(null);
        else requestClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };
    const onFocusIn = (e: FocusEvent) => {
      const panel = panelRef.current;
      if (panel && e.target instanceof Node && !panel.contains(e.target)) panel.focus();
    };
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('focusin', onFocusIn);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
    };
  }, [pendingDiscard, requestClose]);

  const patch = (next: Partial<IntroDraft>) => {
    setDraft((prev) => (prev ? { ...prev, ...next } : prev));
    setSaveError(null);
  };

  const detectLocation = async () => {
    setDetecting(true);
    setFieldErrors((prev) => ({ ...prev, location: undefined }));
    try {
      const detected = await requestDetectedLocation();
      setDetectedCoords({ lat: detected.lat, lng: detected.lng, timezoneId: detected.timezoneId });
      patch({
        locationCity: detected.city || draft?.locationCity || '',
        locationCountry: detected.country || draft?.locationCountry || '',
      });
    } catch (e) {
      setFieldErrors((prev) => ({ ...prev, location: getApiErrorMessage(e, t('Unable to detect your location.')) }));
    } finally {
      setDetecting(false);
    }
  };

  const save = async () => {
    if (!base || !draft || !changes || !dirty || saving) return;
    setSaveError(null);

    const errors: typeof fieldErrors = {};
    const fullName = draft.fullName.trim();
    if (!fullName) errors.fullName = 'Name is required.';
    if (draft.bio.trim() && isRepeatedBioContent(draft.bio)) {
      errors.bio = 'Bio looks duplicated — remove the repeated paragraph before saving.';
    }
    const locationChanged = changes.location || Boolean(detectedCoords);
    const coords = detectedCoords ?? savedCoords;
    /* The API stores a place only together with coordinates and a timezone (device location). A city
       typed by hand reuses the saved coordinates, as the Profile tab's location editor does. */
    if (locationChanged && !coords) {
      errors.location = 'Use your current location first — it sets your coordinates and timezone.';
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    /*
     * PUT /api/creator/profile is a partial update: the backend writes only the fields that are present
     * (non-null) in the body and leaves everything else — FAQ, stack, links, contact, services — as it
     * is (CreatorProfileService.updateMyProfile). So the body carries only what changed here; nothing
     * else is re-sent, which also avoids overwriting a newer save from another tab with stale values.
     */
    const body: CreatorProfileUpdateBody = {};
    if (changes.bio) body.bio = collapseRepeatedBio(draft.bio);
    if (changes.specialties) {
      body.specialties = draft.specialties;
      body.specialite = draft.specialties[0] ?? '';
    }
    if (changes.isAvailable) body.isAvailable = draft.isAvailable;
    if (changes.availabilityLabel) body.availabilityLabel = draft.availabilityLabel.trim();
    if (locationChanged && coords) {
      body.locationCity = draft.locationCity.trim();
      body.locationCountry = draft.locationCountry.trim();
      body.locationLat = coords.lat;
      body.locationLng = coords.lng;
      body.timezoneId = coords.timezoneId;
    }

    setSaving(true);
    try {
      /* The display name belongs to the account (PUT /api/user/profile); AuthContext is updated so the
         navbar and menus show the new name straight away, as the Profile tab does. */
      if (changes.fullName) {
        const updated = await updateUserProfile({ fullName });
        updateUser({ fullName: updated.fullName, username: updated.username, avatarUrl: updated.avatarUrl });
        // If the profile half fails below, a retry must not resend the name.
        setBase((prev) => (prev ? { ...prev, fullName } : prev));
      }
      if (Object.keys(body).length > 0) {
        await updateCreatorProfile(body);
      }
      await onSaved?.();
      onClose();
    } catch (e) {
      setSaveError(getApiErrorMessage(e, t('Unable to save your intro.')));
    } finally {
      setSaving(false);
    }
  };

  const bioLength = draft?.bio.length ?? 0;

  return (
    /* Phones: a full-screen sheet (header, scrolling body, footer clear of the home indicator). From sm:
       a centred 560px dialog over the same veil as the post dialogs (black 40% / 60%). The root carries
       `.news-theme` so the --gn-* tokens resolve outside the page tree; the panel's ground is set in hex
       because the theme re-maps `bg-white`. */
    <div className="news-theme fixed inset-0 z-[210] flex items-stretch justify-center [font-family:'Inter',ui-sans-serif,system-ui,sans-serif] sm:items-center sm:p-6">
      <div
        aria-hidden
        className="fixed inset-0 hidden bg-black/40 dark:bg-black/60 sm:block"
        onClick={() => requestClose()}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-[100dvh] w-full flex-col bg-[#FFFFFF] text-[color:var(--gn-ink)] outline-hidden dark:bg-[#000000] sm:h-auto sm:max-h-[min(88dvh,820px)] sm:max-w-[560px] sm:rounded-2xl sm:shadow-[0_24px_80px_-24px_rgba(0,0,0,0.35)] sm:dark:shadow-[0_0_0_1px_#2F3336]"
      >
        <header className="flex shrink-0 items-center gap-3 border-b border-[color:var(--gn-line)] px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-4">
          <h2 id={titleId} className="min-w-0 flex-1 text-[20px] font-extrabold leading-6 tracking-[-0.01em]">
            {t('Edit intro')}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={() => requestClose()}
            disabled={saving}
            aria-label={t('Close')}
            className={`-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--gn-ink2)] transition-colors hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] disabled:opacity-40 ${FOCUS_RING}`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
              <path strokeLinecap="round" d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6">
          {loadState === 'loading' ? (
            <div className="flex min-h-[240px] items-center justify-center text-[color:var(--gn-ink2)]" role="status">
              <Spinner className="h-5 w-5" />
              <span className="sr-only">{t('Loading your profile')}</span>
            </div>
          ) : loadState === 'error' || !draft ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-center">
              <p role="alert" className="max-w-sm text-[15px] leading-5 text-[color:var(--gn-ink2)]">
                {loadError ?? t('Unable to load your profile.')}
              </p>
              <button type="button" onClick={() => void load()} className={SECONDARY_BUTTON_CLASS}>
                {t('Try again')}
              </button>
            </div>
          ) : (
            <form
              id={formId}
              className="flex flex-col gap-6"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
              noValidate
            >
              <TextField
                id={nameId}
                label={t('Full name')}
                value={draft.fullName}
                maxLength={NAME_MAX}
                autoComplete="name"
                required
                disabled={saving}
                error={fieldErrors.fullName}
                onChange={(e) => {
                  patch({ fullName: e.target.value });
                  if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
              />

              {/* Specialties: the same picker as the Profile tab (keyword tags stay under Skills & Tools,
                  so they are hidden here and never re-sent). The first chip leads the headline. */}
              <fieldset className="flex min-w-0 flex-col gap-2" disabled={saving}>
                <legend className="mb-2 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{t('Specialties')}</legend>
                <SpecialtyMultiSelect
                  specialties={draft.specialties}
                  tags={[]}
                  onSpecialtiesChange={(next) => patch({ specialties: next })}
                  onTagsChange={() => undefined}
                  showTags={false}
                  disabled={saving}
                />
              </fieldset>

              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <label htmlFor={bioId} className="text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">
                    {t('Bio')}
                  </label>
                  <span
                    id={bioCounterId}
                    className={`text-[13px] tabular-nums leading-[18px] ${
                      bioLength >= BIO_MAX ? 'text-[#F4212E]' : 'text-[color:var(--gn-ink2)]'
                    }`}
                  >
                    {bioLength}/{BIO_MAX}
                  </span>
                </div>
                <textarea
                  id={bioId}
                  value={draft.bio}
                  maxLength={BIO_MAX}
                  rows={5}
                  disabled={saving}
                  aria-describedby={bioCounterId}
                  aria-invalid={fieldErrors.bio ? true : undefined}
                  placeholder={t('What you do, who you work with, what you are known for.')}
                  onChange={(e) => {
                    patch({ bio: e.target.value });
                    if (fieldErrors.bio) setFieldErrors((prev) => ({ ...prev, bio: undefined }));
                  }}
                  className={`min-h-[120px] w-full resize-y rounded-md bg-[color:var(--gn-field)] px-3.5 py-3 text-[15px] leading-5 text-[color:var(--gn-ink)] outline-hidden transition-shadow duration-150 placeholder:text-[color:var(--gn-ink3)] focus:shadow-[inset_0_0_0_2px_var(--gn-ink)] disabled:opacity-70 ${
                    fieldErrors.bio ? 'shadow-[inset_0_0_0_1px_#F4212E]' : ''
                  }`}
                />
                {fieldErrors.bio ? <p className="text-[13px] leading-[18px] text-[#F4212E]">{fieldErrors.bio}</p> : null}
              </div>

              {/* Location: city and country as text, with device detection for the coordinates and
                  timezone the API needs alongside a place. */}
              <fieldset className="flex min-w-0 flex-col gap-3" disabled={saving}>
                <legend className="mb-2 text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">{t('Location')}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label={t('City')}
                    value={draft.locationCity}
                    maxLength={150}
                    autoComplete="address-level2"
                    onChange={(e) => patch({ locationCity: e.target.value })}
                  />
                  <TextField
                    label={t('Country')}
                    value={draft.locationCountry}
                    maxLength={100}
                    autoComplete="country-name"
                    onChange={(e) => patch({ locationCountry: e.target.value })}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <button
                    type="button"
                    onClick={() => void detectLocation()}
                    disabled={detecting || saving}
                    className={`-ml-1 inline-flex items-center gap-1.5 rounded-full px-1 py-0.5 text-[14px] font-semibold text-[color:var(--gn-ink)] underline-offset-2 hover:underline disabled:opacity-50 ${FOCUS_RING}`}
                  >
                    {detecting ? (
                      <Spinner className="h-4 w-4" />
                    ) : (
                      <svg aria-hidden className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
                        <circle cx="12" cy="12" r="7" />
                      </svg>
                    )}
                    {detecting ? t('Detecting…') : t('Use my current location')}
                  </button>
                  {detectedCoords && !fieldErrors.location ? (
                    <span className="text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                      {t('Location detected · {timezoneId}', { timezoneId: detectedCoords.timezoneId })}
                    </span>
                  ) : null}
                </div>
                {fieldErrors.location ? (
                  <p className="text-[13px] leading-[18px] text-[#F4212E]">{fieldErrors.location}</p>
                ) : null}
              </fieldset>

              {/* Availability: the header's green status line. Off reads "Unavailable"; on shows the
                  custom line, or "Available" when it is left empty. */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-6">
                  <div className="min-w-0">
                    <p id={`${titleId}-availability`} className="text-[14px] font-semibold leading-5 text-[color:var(--gn-ink)]">
                      {t('Open to work')}
                    </p>
                    <p className="mt-0.5 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                      {t('Shows a green status under your name.')}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={draft.isAvailable}
                    aria-labelledby={`${titleId}-availability`}
                    disabled={saving}
                    onClick={() => patch({ isAvailable: !draft.isAvailable })}
                    data-pf-no-color-transition
                    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40 ${FOCUS_RING} ${
                      draft.isAvailable ? 'bg-[color:var(--gn-primary)]' : 'bg-[#CFD9DE] dark:bg-[#3E4144]'
                    }`}
                  >
                    <span
                      aria-hidden
                      className={`inline-block h-5 w-5 rounded-full shadow-[0_1px_2px_rgba(15,20,25,0.25)] transition-transform duration-200 ${
                        draft.isAvailable
                          ? 'translate-x-[1.375rem] bg-[color:var(--gn-primary-ink)]'
                          : 'translate-x-0.5 bg-[#FFFFFF] dark:bg-[#E7E9EA]'
                      }`}
                    />
                  </button>
                </div>
                {draft.isAvailable ? (
                  <TextField
                    label={t('Status line')}
                    value={draft.availabilityLabel}
                    maxLength={STATUS_MAX}
                    placeholder={t('Available for hire')}
                    hint={t('Leave empty to show “Available”.')}
                    disabled={saving}
                    onChange={(e) => patch({ availabilityLabel: e.target.value })}
                  />
                ) : null}
              </div>

              {/* Account identity lives elsewhere: changing the username changes the profile URL. */}
              <p className="border-t border-[color:var(--gn-line)] pt-4 text-[13px] leading-[18px] text-[color:var(--gn-ink2)]">
                {t('Username & email →')}{' '}
                <Link
                  href="/settings"
                  className={`rounded font-semibold text-[color:var(--gn-ink)] underline-offset-2 hover:underline ${FOCUS_RING}`}
                  onClick={(e) => {
                    if (!dirty) return;
                    e.preventDefault();
                    requestClose(() => {
                      onClose();
                      router.push('/settings');
                    });
                  }}
                >
                  {t('Account settings')}
                </Link>
              </p>
            </form>
          )}
        </div>

        <footer className="shrink-0 border-t border-[color:var(--gn-line)] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 sm:pb-4">
          {saveError && !pendingDiscard ? (
            <p role="alert" className="mb-3 text-[14px] leading-5 text-[#F4212E]">
              {saveError}
            </p>
          ) : null}
          {pendingDiscard ? (
            /* Closing with unsaved edits asks first, inside the dialog (no browser confirm), and
               "Keep editing" takes focus so Enter / Escape both keep the draft. */
            <div className="flex flex-wrap items-center justify-end gap-3" role="group" aria-label={t('Discard changes?')}>
              <p className="mr-auto text-[15px] font-semibold leading-5">{t('Discard changes?')}</p>
              <button
                ref={keepEditingRef}
                type="button"
                onClick={() => setPendingDiscard(null)}
                className={SECONDARY_BUTTON_CLASS}
              >
                {t('Keep editing')}
              </button>
              <button
                type="button"
                onClick={() => {
                  const next = pendingDiscard;
                  setPendingDiscard(null);
                  next();
                }}
                className={PRIMARY_BUTTON_CLASS}
              >
                {t('Discard')}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => requestClose()} disabled={saving} className={SECONDARY_BUTTON_CLASS}>
                {t('Cancel')}
              </button>
              <button
                type="submit"
                form={formId}
                disabled={!dirty || saving || loadState !== 'ready'}
                className={PRIMARY_BUTTON_CLASS}
              >
                {saving ? <Spinner /> : null}
                {saving ? t('Saving…') : t('Save')}
              </button>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
}
