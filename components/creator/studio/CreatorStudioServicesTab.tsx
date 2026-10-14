'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEllipsisVertical, faGripVertical } from '@fortawesome/free-solid-svg-icons';
import {
  createEmptyProfileService,
  parseProfileServices,
  serializeProfileServices,
  type ProfileServiceForm,
} from '@/components/creator/studio/profile-form-schema';
import { ServiceFormDrawer } from '@/components/creator/studio/ServiceFormDrawer';
import { ServiceHourlyRate } from '@/components/creator/studio/ServiceHourlyRate';
import { CreatorServicesEmptyGuide } from '@/components/creator/studio/CreatorServicesEmptyGuide';
import { ProfileReadinessWarning } from '@/components/creator/studio/ProfileReadinessWarning';
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
import { BOX_TITLE, SpecialtyRow, specialtyIcon } from '@/components/marketplace/ProviderDiscoverRail';
import { ALL_ICON, RailGlyph } from '@/components/home/NewsDiscoverRail';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { STUDIO_FLOAT_IN_STYLE } from '@/components/portfolio/PortfolioStudioKit';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { CreatorStudioServicesTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { BackToTopButton, useBackToTop } from '@/components/ui/ScrollUpStickyBar';
import { getApiErrorMessage } from '@/lib/api-error';
import api from '@/lib/api';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { getMissingProfileReadinessFields, type ProfileReadinessField } from '@/lib/creator-profile-readiness';
import { uploadContentMedia } from '@/lib/marketplace-api';
import type { CreatorProfileDto } from '@/types/profile';
import {
  formatServiceDelivery,
  formatServicePrice,
  getServicePriceParts,
  MAX_PROFILE_SERVICES,
  normalizeServiceCurrency,
  normalizeServiceStatus,
  servicePriceCentsForPricing,
  servicePricingNeedsAmount,
  serviceStatusLabel,
  solidCoverHueFromTitle,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { parseSpecialtyList, specialtyKey } from '@/lib/specialties';
import { MediaImage } from '@/components/ui/MediaImage';
import { ListSectionHeading } from '@/components/ui/ListSectionHeading';
import { useT } from '@/lib/i18n/I18nProvider';
import { msg } from '@/lib/i18n/config';

/** Row media: 112 px wide on phones, 176 px from sm, 208 px from md. */
const SERVICE_COVER_WIDTHS = [256, 384, 640] as const;
const SERVICE_COVER_SIZES = '(min-width: 768px) 208px, (min-width: 640px) 176px, 112px';

type StatusFilter = 'ALL' | ServiceStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: msg('All') },
  { value: 'ACTIVE', label: msg('Active') },
  { value: 'PAUSED', label: msg('Paused') },
  { value: 'ARCHIVED', label: msg('Archived') },
];

/** "+ New service" — the page's one primary: an ink pill (every action on the page is a pill). */
const newServiceButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-full bg-[#0F1419] px-4 py-2 text-[15px] font-bold text-white transition-colors hover:bg-[#272C30] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F1419]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-[#0F1419] dark:bg-[#EFF3F4] dark:text-[#0F1419] dark:hover:bg-[#D7DBDC] dark:focus-visible:ring-[#E7E9EA]/40 dark:focus-visible:ring-offset-black dark:disabled:hover:bg-[#EFF3F4]';

/**
 * Display-only fix for the recurring "Scientis" misspelling in a specialty tag — the stored
 * value is the creator's own and is not rewritten here.
 */
function polishSpecialtyLabel(value: string): string {
  return value.replace(/\bscientis\b/gi, (match) => (match[0] === 'S' ? 'Scientist' : 'scientist'));
}

function duplicateTitle(title: string): string {
  const base = title.trim() || 'Service';
  if (/\(copy\)$/i.test(base) || /\(copie\)$/i.test(base)) return base;
  const next = `${base} (copy)`;
  return next.length > 100 ? `${base.slice(0, 93)} (copy)` : next;
}

/** Status dot in a row's meta line: green live, amber paused, grey archived. */
function statusDotClass(status: ServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-[#00BA7C]';
    case 'PAUSED':
      return 'bg-[#FFAD1F]';
    default:
      return 'bg-[#8B98A5] dark:bg-[#536471]';
  }
}

function ExternalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

/** The rail's primary — News's "Publish a post" pill (the `gn-primary` ink fill, 48px, full width). */
const railPrimaryButtonClass =
  'gn-primary inline-flex h-12 w-full items-center justify-center !rounded-full bg-[color:var(--gn-primary)] text-[15px] font-semibold leading-5 text-[color:var(--gn-primary-ink)] transition-colors hover:bg-[color:var(--gn-primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] disabled:cursor-not-allowed disabled:opacity-40';

/** A storefront: the public profile's services tab, as clients see it. */
const STOREFRONT_ICON = (
  <>
    <path d="M4 9.5 5.5 4h13L20 9.5" />
    <path d="M4 9.5a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0" />
    <path d="M5.5 12v8h13v-8" />
    <path d="M10 20v-4.5h4V20" />
  </>
);

const AUTO_SCROLL_EDGE_PX = 96;
const AUTO_SCROLL_MAX_SPEED = 18;

function findScrollParent(node: HTMLElement | null): HTMLElement | null {
  let el = node?.parentElement ?? null;
  while (el && el !== document.body) {
    const { overflowY } = window.getComputedStyle(el);
    if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
      return el;
    }
    el = el.parentElement;
  }
  return null;
}

function ServiceCover({
  title,
  coverImageUrl,
  className,
  priority = false,
}: {
  title: string;
  coverImageUrl?: string | null;
  className?: string;
  priority?: boolean;
}) {
  const hue = solidCoverHueFromTitle(title || 'Service');
  const initial = (title.trim()[0] || 'S').toUpperCase();
  const solidCover = (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
      aria-hidden
    >
      <span className="relative text-4xl font-bold tracking-tight text-white/90 sm:text-5xl">{initial}</span>
    </div>
  );
  return (
    <MediaImage
      src={coverImageUrl}
      widths={SERVICE_COVER_WIDTHS}
      sizes={SERVICE_COVER_SIZES}
      priority={priority}
      fallback={solidCover}
      className={`object-cover ${className ?? ''}`}
    />
  );
}

type Draft = ProfileServiceForm;

const menuItemClass =
  'block w-full px-4 py-2.5 text-left text-[15px] font-medium text-[#0F1419] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:hover:bg-[rgba(231,233,234,0.1)]';

const menuDangerItemClass =
  'block w-full px-4 py-2.5 text-left text-[15px] font-medium text-[#F4212E] transition-colors hover:bg-[rgba(244,33,46,0.08)]';

function ServiceContextMenu({
  service,
  disabled,
  viewHref,
  onEdit,
  onDuplicate,
  onActivate,
  onDeactivate,
  onArchive,
  onRemove,
  onOpenChange,
}: {
  service: ProfileServiceForm;
  disabled?: boolean;
  /** The service on the public profile (active services only); null hides "View on profile". */
  viewHref?: string | null;
  onEdit: () => void;
  onDuplicate: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onRemove: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const status = normalizeServiceStatus(service.status);

  const setMenuOpen = (next: boolean) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    if (!open) {
      setConfirmRemove(false);
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${open ? 'z-50' : 'z-10'}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setMenuOpen(!open)}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] disabled:opacity-40 dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA] ${
          open ? 'bg-black/[0.05] text-[#111111] dark:bg-white/[0.08] dark:text-white' : ''
        }`}
        aria-label={t('More actions')}
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1.5 shadow-[0_0_0_1px_#E1E8ED,0_8px_20px_-14px_rgba(15,20,25,0.18)] dark:bg-black dark:shadow-[0_0_0_1px_#2F3336]"
          style={STUDIO_FLOAT_IN_STYLE}
        >
          {confirmRemove ? (
            <>
              <p className="px-3 py-2 text-[15px] leading-snug text-neutral-500 dark:text-neutral-400">
                {t('Delete this service permanently?')}
              </p>
              <button
                type="button"
                className={`${menuDangerItemClass} font-medium`}
                onClick={() => {
                  setMenuOpen(false);
                  setConfirmRemove(false);
                  onRemove();
                }}
              >
                {t('Delete forever')}
              </button>
              <button type="button" className={menuItemClass} onClick={() => setConfirmRemove(false)}>
                {t('Cancel')}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  setMenuOpen(false);
                  onEdit();
                }}
              >
                {t('Edit')}
              </button>
              {viewHref ? (
                <Link
                  href={viewHref}
                  target="_blank"
                  rel="noreferrer"
                  className={menuItemClass}
                  onClick={() => setMenuOpen(false)}
                >
                  {t('View on profile')}
                </Link>
              ) : null}
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                {t('Duplicate')}
              </button>
              {status === 'ACTIVE' ? (
                <button
                  type="button"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    onDeactivate();
                  }}
                >
                  {t('Deactivate')}
                </button>
              ) : (
                <button
                  type="button"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    onActivate();
                  }}
                >
                  {t('Activate')}
                </button>
              )}
              {status !== 'ARCHIVED' ? (
                <button
                  type="button"
                  className={menuItemClass}
                  onClick={() => {
                    setMenuOpen(false);
                    onArchive();
                  }}
                >
                  {t('Archive')}
                </button>
              ) : null}
              <div className="my-1 h-px bg-[#EFF3F4] dark:bg-[#2F3336]" aria-hidden />
              <button type="button" className={menuDangerItemClass} onClick={() => setConfirmRemove(true)}>
                {t('Remove')}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CreatorStudioServicesTab({
  showPageHeader = false,
  createRequest = 0,
  onCreateDisabledChange,
}: {
  showPageHeader?: boolean;
  /** Incremented by the parent to open the "New service" drawer (studio rail action). */
  createRequest?: number;
  onCreateDisabledChange?: (disabled: boolean) => void;
}) {
  const t = useT();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ProfileServiceForm[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [specialtyFilter, setSpecialtyFilter] = useState('ALL');
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const overIdRef = useRef<string | null>(null);
  const pointerYRef = useRef(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [dropHint, setDropHint] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [missingProfileFields, setMissingProfileFields] = useState<ProfileReadinessField[]>([]);
  const [hourlyRate, setHourlyRate] = useState<{ cents: number | null; currency: string | null }>({
    cents: null,
    currency: null,
  });

  useEffect(() => {
    if (!dropHint) return;
    const timer = window.setTimeout(() => setDropHint(false), 3200);
    return () => window.clearTimeout(timer);
  }, [dropHint]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<CreatorProfileDto>('/api/creator/profile');
      const profile = res.data;
      const nextSpecialties = parseSpecialtyList(profile.specialties, profile.specialite);
      setSpecialties(nextSpecialties);
      setServices(parseProfileServices(profile.profileServices));
      setHourlyRate({ cents: profile.hourlyRateCents ?? null, currency: profile.hourlyRateCurrency ?? null });
      setMissingProfileFields(getMissingProfileReadinessFields(profile, { requireSpecialties: true }));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const persist = async (next: ProfileServiceForm[]) => {
    setSaving(true);
    setError(null);
    try {
      const fallback = specialties[0] ?? '';
      await updateCreatorProfile({
        profileServices: serializeProfileServices(next, fallback, specialties),
      });
      setServices(next);
      setEditingId(null);
      setDraft(null);
    } catch (err) {
      setError(getApiErrorMessage(err));
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const openCreate = () => {
    if (missingProfileFields.length > 0) return;
    if (specialties.length === 0) return;
    if (services.length >= MAX_PROFILE_SERVICES) return;
    const empty = createEmptyProfileService(services.length, specialties[0] ?? '');
    setEditingId(empty.id);
    setDraft(empty);
  };

  const openEdit = (service: ProfileServiceForm) => {
    setEditingId(service.id);
    setDraft({
      ...service,
      specialty: service.specialty || specialties[0] || '',
      pricingType: service.pricingType ?? (service.basePriceCents != null ? 'FIXED' : 'QUOTE'),
      status: service.status ?? 'ACTIVE',
      tags: service.tags ?? [],
      coverImageUrl: service.coverImageUrl ?? '',
      currency: normalizeServiceCurrency(service.currency),
      deliveryValue: service.deliveryValue ?? null,
      deliveryUnit: service.deliveryUnit ?? 'DAYS',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft(null);
  };

  /** `statusOverride`: the drawer's Publish (ACTIVE) / Save as draft (PAUSED); none keeps the status. */
  const saveDraft = async (statusOverride?: ServiceStatus) => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError(t('Title is required.'));
      return;
    }
    if (!draft.specialty?.trim()) {
      setError(t('Choose a specialty for this service.'));
      return;
    }
    const pricingType = (draft.pricingType ?? 'FIXED') as ServicePricingType;
    const needsAmount = servicePricingNeedsAmount(pricingType);
    if (needsAmount && draft.basePriceCents == null) {
      setError(t('Price is required unless pricing is Quote on request or Free.'));
      return;
    }
    const currencyRaw = (draft.currency ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (needsAmount && !currencyRaw) {
      setError(t('Currency is required.'));
      return;
    }
    const billingPeriod = needsAmount ? draft.billingPeriod ?? null : null;
    const cleaned: ProfileServiceForm = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() ?? '',
      specialty: draft.specialty.trim(),
      pricingType,
      basePriceCents: servicePriceCentsForPricing(pricingType, draft.basePriceCents),
      deadline: draft.deadline?.trim() ?? '',
      coverImageUrl: draft.coverImageUrl?.trim() ?? '',
      status: statusOverride ?? draft.status ?? 'ACTIVE',
      tags: draft.tags ?? [],
      currency: currencyRaw || 'EUR',
      deliveryValue: draft.deliveryValue != null && draft.deliveryValue > 0 ? draft.deliveryValue : null,
      deliveryUnit:
        draft.deliveryValue != null && draft.deliveryValue > 0
          ? draft.deliveryUnit === 'WEEKS'
            ? 'WEEKS'
            : 'DAYS'
          : null,
      billingPeriod,
    };
    const exists = services.some((item) => item.id === cleaned.id);
    const next = exists ? services.map((item) => (item.id === cleaned.id ? cleaned : item)) : [...services, cleaned];
    await persist(next.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const archiveOrDelete = async (serviceId: string, hardDelete: boolean) => {
    if (hardDelete) {
      await persist(
        services
          .filter((item) => item.id !== serviceId)
          .map((item, index) => ({
            ...item,
            sortOrder: index,
          })),
      );
      return;
    }
    const next = services.map((item) => (item.id === serviceId ? { ...item, status: 'ARCHIVED' as const } : item));
    await persist(next);
  };

  const onCoverPick = async (file: File | null) => {
    if (!file || !draft) return;
    setUploadingCover(true);
    setError(null);
    try {
      const url = await uploadContentMedia(file);
      setDraft({ ...draft, coverImageUrl: url });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const statusSummary = useMemo(() => {
    let active = 0;
    let paused = 0;
    let archived = 0;
    for (const service of services) {
      const status = normalizeServiceStatus(service.status);
      if (status === 'ACTIVE') active += 1;
      else if (status === 'PAUSED') paused += 1;
      else archived += 1;
    }
    return { active, paused, archived, total: services.length };
  }, [services]);

  const usedSpecialties = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const service of services) {
      const label = service.specialty?.trim();
      if (!label) continue;
      const key = specialtyKey(label);
      if (seen.has(key)) continue;
      seen.add(key);
      list.push(label);
    }
    return list;
  }, [services]);

  const reorderBlockedByFilters = statusFilter !== 'ALL' || specialtyFilter !== 'ALL';
  const canReorder = !reorderBlockedByFilters && !draft;
  const hasAnyServices = services.length > 0;
  const showGreeting = showPageHeader && !hasAnyServices && !draft;
  const greetingName = user?.fullName?.trim().split(/\s+/)[0] || 'there';
  const profileWarning =
    missingProfileFields.length > 0 ? (
      <ProfileReadinessWarning
        missingFields={missingProfileFields}
        title={t('Complete your profile first')}
        description={t('Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, location, and specialties before publishing a service. Don\'t worry — it\'s a mark of trust for your clients.')}
      />
    ) : null;

  useEffect(() => {
    if (!reorderBlockedByFilters) setDropHint(false);
  }, [reorderBlockedByFilters]);

  const visibleServices = useMemo(() => {
    let list = [...services];
    if (statusFilter !== 'ALL') {
      list = list.filter((item) => normalizeServiceStatus(item.status) === statusFilter);
    }
    if (specialtyFilter !== 'ALL') {
      list = list.filter((item) => specialtyKey(item.specialty ?? '') === specialtyKey(specialtyFilter));
    }
    return list.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [services, statusFilter, specialtyFilter]);

  const duplicateService = async (service: ProfileServiceForm) => {
    if (services.length >= MAX_PROFILE_SERVICES) {
      setError(`You can create at most ${MAX_PROFILE_SERVICES} services.`);
      return;
    }
    const copy: ProfileServiceForm = {
      ...service,
      id: crypto.randomUUID(),
      title: duplicateTitle(service.title),
      status: 'PAUSED',
      sortOrder: services.length,
    };
    const next = [...services, copy].map((item, index) => ({ ...item, sortOrder: index }));
    try {
      await persist(next);
    } catch {
      /* error already set in persist */
    }
  };

  const setServiceStatus = async (serviceId: string, status: ServiceStatus) => {
    const next = services.map((item) => (item.id === serviceId ? { ...item, status } : item));
    try {
      await persist(next);
    } catch {
      /* error already set in persist */
    }
  };

  const reorderServices = async (fromId: string, toId: string) => {
    if (!canReorder || fromId === toId) return;
    const ordered = [...services].sort((a, b) => a.sortOrder - b.sortOrder);
    const fromIndex = ordered.findIndex((item) => item.id === fromId);
    const toIndex = ordered.findIndex((item) => item.id === toId);
    if (fromIndex < 0 || toIndex < 0) return;
    const next = [...ordered];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    try {
      await persist(next.map((item, index) => ({ ...item, sortOrder: index })));
    } catch {
      /* error already set in persist */
    }
  };

  const reorderRef = useRef(reorderServices);
  reorderRef.current = reorderServices;

  useEffect(() => {
    if (!dragId) return;
    const fromId = dragId;
    const list = listRef.current;
    const scroller = findScrollParent(list);
    let frame = 0;
    let done = false;

    const updateTarget = () => {
      if (!list) return;
      const y = pointerYRef.current;
      const cards = Array.from(list.querySelectorAll<HTMLElement>('[data-service-id]'));
      let target: string | null = null;
      for (const card of cards) {
        target = card.dataset.serviceId ?? null;
        if (y < card.getBoundingClientRect().bottom) break;
      }
      if (target && target !== overIdRef.current) {
        overIdRef.current = target;
        setOverId(target);
      }
    };

    const tick = () => {
      const y = pointerYRef.current;
      const top = scroller ? scroller.getBoundingClientRect().top : 0;
      const bottom = scroller ? scroller.getBoundingClientRect().bottom : window.innerHeight;
      let delta = 0;
      if (y < top + AUTO_SCROLL_EDGE_PX) {
        delta = -Math.ceil(((top + AUTO_SCROLL_EDGE_PX - y) / AUTO_SCROLL_EDGE_PX) * AUTO_SCROLL_MAX_SPEED);
      } else if (y > bottom - AUTO_SCROLL_EDGE_PX) {
        delta = Math.ceil(((y - (bottom - AUTO_SCROLL_EDGE_PX)) / AUTO_SCROLL_EDGE_PX) * AUTO_SCROLL_MAX_SPEED);
      }
      if (delta) {
        if (scroller) scroller.scrollBy(0, delta);
        else window.scrollBy(0, delta);
        updateTarget();
      }
      frame = requestAnimationFrame(tick);
    };

    const finish = (commit: boolean) => {
      if (done) return;
      done = true;
      const toId = overIdRef.current;
      overIdRef.current = null;
      setOverId(null);
      setDragId(null);
      if (commit && toId && toId !== fromId) void reorderRef.current(fromId, toId);
    };

    const onMove = (event: PointerEvent) => {
      pointerYRef.current = event.clientY;
      updateTarget();
    };
    const onUp = () => finish(true);
    const onCancel = () => finish(false);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish(false);
    };

    const body = document.body;
    const prevUserSelect = body.style.userSelect;
    const prevCursor = body.style.cursor;
    body.style.userSelect = 'none';
    body.style.cursor = 'grabbing';

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    window.addEventListener('keydown', onKey);
    window.addEventListener('scroll', updateTarget, true);
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', updateTarget, true);
      body.style.userSelect = prevUserSelect;
      body.style.cursor = prevCursor;
    };
  }, [dragId]);

  const createDisabled =
    loading ||
    saving ||
    Boolean(draft) ||
    specialties.length === 0 ||
    services.length >= MAX_PROFILE_SERVICES ||
    missingProfileFields.length > 0;

  useEffect(() => {
    onCreateDisabledChange?.(createDisabled);
  }, [createDisabled, onCreateDisabledChange]);

  const toolbarRef = useRef<HTMLDivElement>(null);
  const backToTop = useBackToTop(toolbarRef, !loading && hasAnyServices);

  const handledCreateRequestRef = useRef(createRequest);
  useEffect(() => {
    if (loading || createRequest === handledCreateRequestRef.current) return;
    handledCreateRequestRef.current = createRequest;
    openCreate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createRequest, loading]);

  const pageInset = showPageHeader ? 'px-5 sm:px-0' : '';
  const pageInsetMargin = showPageHeader ? 'mx-5 sm:mx-0' : '';

  /* The skeleton draws the page's own frame (list + rail, paddings, insets). */
  if (loading) return <CreatorStudioServicesTabSkeleton withHeader={showPageHeader} />;

  const publishDisabled = saving || services.length >= MAX_PROFILE_SERVICES || missingProfileFields.length > 0;
  const showPublish = specialties.length > 0 && hasAnyServices;
  const specialtyOptions = [
    { value: 'ALL', label: t('All specialties') },
    ...usedSpecialties.map((item) => ({ value: item, label: t(polishSpecialtyLabel(item)) })),
  ];
  /* The hourly rate is a profile setting, not a listing: one line under the page title (or, without
     that header, one line above the list). */
  const hourlyRateInHeader = showPageHeader && !showGreeting;
  const hourlyRateLine = (
    <ServiceHourlyRate
      className={hourlyRateInHeader ? 'order-2 sm:order-none sm:col-span-2' : pageInset}
      hourlyRateCents={hourlyRate.cents}
      hourlyRateCurrency={hourlyRate.currency}
      onSaved={(cents, currency) => setHourlyRate({ cents, currency })}
    />
  );

  const mainColumn = (
    <div
      // My services: the page (app/(app)/my-services) owns the full-width scroll panel. Flex `gap`,
      // not `space-y`: the header hidden from lg (and the sr-only h1) must not leave a top margin, so
      // the list's first line sits level with the rail's first box.
      className={`relative flex w-full min-w-0 flex-col gap-6 pb-24 sm:gap-10 ${showPageHeader ? 'pt-4 sm:pt-10 lg:pt-6' : ''}`}
    >
      {showGreeting ? (
        <div className="flex items-center justify-between gap-6">
          <h1 className="min-w-0 truncate text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-[#0F1419] dark:text-[#E7E9EA] sm:text-[34px]">
            {t('Hi, {greetingName}', { greetingName })}
          </h1>
          {profileWarning}
        </div>
      ) : (
        <>
          {showPageHeader ? (
            /* A grid. Phones: one column — title, hourly rate, then "New service" as a full-width
               button. From sm: [title + subtitle · New service] on top, the hourly rate under the title. */
            <header
              // From lg the rail carries the title, the hourly rate and "New service".
              className={`grid grid-cols-1 gap-y-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-6 lg:hidden ${pageInset}`}
            >
              <div className="min-w-0">
                <h1 className="truncate text-[22px] font-extrabold leading-7 tracking-[-0.015em] text-[#0F1419] dark:text-[#E7E9EA] sm:text-[20px] sm:leading-6">
                  {t('My services')}
                </h1>
                <p className="mt-1 hidden text-[15px] leading-5 text-[#536471] dark:text-[#71767B] sm:block">
                  {t('The offers clients can book or request a quote for.')}
                </p>
              </div>
              {showPublish ? (
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={publishDisabled}
                  className={`${newServiceButtonClass} order-3 mt-1 h-11 w-full !px-4 !py-0 sm:order-none sm:mt-0 sm:h-9 sm:w-auto sm:shrink-0`}
                >
                  {t('New service')}
                </button>
              ) : null}
              {hourlyRateLine}
            </header>
          ) : null}
          {showPageHeader ? <h1 className="sr-only hidden lg:block">{t('My services')}</h1> : null}
          {profileWarning ? <div className={pageInset}>{profileWarning}</div> : null}
        </>
      )}

      {hourlyRateInHeader ? null : showPageHeader ? <div className="lg:hidden">{hourlyRateLine}</div> : hourlyRateLine}

      {error ? (
        <div className={pageInset}>
          <ErrorAlert message={error} onDismiss={() => setError(null)} />
        </div>
      ) : null}

      <ServiceFormDrawer
        open={Boolean(draft && editingId)}
        draft={draft ?? createEmptyProfileService(0)}
        isEdit={Boolean(draft && services.some((item) => item.id === draft.id))}
        specialties={specialties}
        saving={saving}
        uploadingCover={uploadingCover}
        onChange={(next) => setDraft(next)}
        onClose={cancelEdit}
        onSave={(status) => void saveDraft(status)}
        onCoverFile={(file) => void onCoverPick(file)}
      />

      {!hasAnyServices && !draft ? (
        <div className={pageInset}>
        <CreatorServicesEmptyGuide
          onCreate={openCreate}
          createDisabled={
            missingProfileFields.length > 0 ||
            specialties.length === 0 ||
            saving ||
            services.length >= MAX_PROFILE_SERVICES
          }
        />
        </div>
      ) : (
        <section className="space-y-6" aria-labelledby={showPageHeader ? 'my-services-heading' : undefined} aria-label={showPageHeader ? undefined : t('Your services')}>
          <div className="flex flex-col gap-2">
          {showPageHeader ? (
            /* Heading line above the list, like News's "Latest" and Providers' heading: the list's
               name in 17px bold with its count and filters, the slots used at the right (13px). */
            <div className="flex min-h-8 items-center justify-between gap-4 px-5 sm:px-1 lg:min-h-0">
              <ListSectionHeading
                id="my-services-heading"
                title={t('Services')}
                count={visibleServices.length}
                details={[
                  statusFilter !== 'ALL' && serviceStatusLabel(statusFilter),
                  specialtyFilter !== 'ALL' && t(polishSpecialtyLabel(specialtyFilter)),
                ]}
              />
              <span className="shrink-0 text-[13px] leading-[18px] tabular-nums text-[color:var(--gn-ink2)]">
                {t('{servicesLength} / {MAXPROFILESERVICES} slots', { servicesLength: services.length, MAXPROFILESERVICES: MAX_PROFILE_SERVICES })}
              </span>
            </div>
          ) : null}
          <div
            ref={toolbarRef}
            // Underline tabs (the public profile's tab style): one hairline under the bar, a 2px ink rule
            // under the active status — no pills. Phones: the status tabs get the full width and
            // Specialty drops to its own line on the right; from sm both share one bar. The hairline is an
            // inset shadow (the tabs row's on phones, the bar's from sm) so the active rule paints over it.
            className={`flex scroll-mt-6 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-x-6 sm:shadow-[inset_0_-1px_0_#EFF3F4] sm:dark:shadow-[inset_0_-1px_0_#2F3336] ${pageInsetMargin}`}
          >
            <div
              className="flex min-w-0 gap-5 overflow-x-auto shadow-[inset_0_-1px_0_#EFF3F4] [scrollbar-width:none] dark:shadow-[inset_0_-1px_0_#2F3336] sm:gap-8 sm:shadow-none sm:dark:shadow-none [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label={t('Filter by status')}
            >
              {STATUS_FILTER_OPTIONS.map((option) => {
                const selected = statusFilter === option.value;
                const count =
                  option.value === 'ALL'
                    ? statusSummary.total
                    : option.value === 'ACTIVE'
                      ? statusSummary.active
                      : option.value === 'PAUSED'
                        ? statusSummary.paused
                        : statusSummary.archived;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setStatusFilter(option.value)}
                    aria-pressed={selected}
                    data-pf-no-color-transition
                    className={`relative inline-flex h-12 shrink-0 items-center gap-1.5 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0F1419]/30 dark:focus-visible:ring-white/30 ${
                      selected
                        ? 'font-bold text-[#0F1419] dark:text-[#E7E9EA]'
                        : 'font-medium text-[#536471] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:text-[#E7E9EA]'
                    }`}
                  >
                    {t(option.label)}
                    {count > 0 ? (
                      <span className="text-[13px] font-normal tabular-nums text-[#536471] dark:text-[#71767B]">{count}</span>
                    ) : null}
                    {selected ? (
                      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] bg-[#0F1419] dark:bg-[#E7E9EA]" />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex shrink-0 items-center justify-end gap-3 empty:hidden">
              {/* Phones: no Specialty filter (a handful of services needs none); the status tabs suffice. */}
              {usedSpecialties.length > 0 ? (
                <div className={`hidden sm:block ${showPageHeader ? 'lg:hidden' : ''}`}>
                  <MarketplaceFilterDropdown
                    id="my-services-specialty"
                    label={t('Specialty')}
                    value={specialtyFilter}
                    onChange={setSpecialtyFilter}
                    options={specialtyOptions}
                    defaultValue="ALL"
                    size="sm"
                    align="right"
                    appearance="plain"
                  />
                </div>
              ) : null}
              {!showPageHeader && showPublish ? (
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={publishDisabled}
                  className={`${newServiceButtonClass} mt-3 h-11 w-full !px-4 !py-0 sm:mt-0 sm:h-9 sm:w-auto sm:shrink-0`}
                >
                  {t('New service')}
                </button>
              ) : null}
            </div>
          </div>
          </div>

          {visibleServices.length === 0 && !draft ? (
            <div className={`bg-[#F7F9F9] px-6 py-12 text-center dark:bg-[#16181C] ${pageInsetMargin}`}>
              <p className="text-[17px] font-bold leading-[22px] text-[#0F1419] dark:text-[#E7E9EA]">
                {t('No services match these filters')}
              </p>
              <p className="mt-1.5 text-[14px] leading-5 text-[#536471] dark:text-[#71767B]">
                {t('Change the status or specialty filter to see other offers.')}
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSpecialtyFilter('ALL');
                }}
                className="mt-5 inline-flex h-10 items-center rounded-full px-4 text-[14px] font-bold text-[#0F1419] shadow-[inset_0_0_0_1px_#CFD9DE] transition-colors hover:bg-[rgba(15,20,25,0.06)] dark:text-[#E7E9EA] dark:shadow-[inset_0_0_0_1px_#536471] dark:hover:bg-[rgba(231,233,234,0.1)]"
              >
                {t('Reset filters')}
              </button>
            </div>
          ) : (
            /* A management list (Shopify / Etsy / Fiverr "Manage gigs"): one row per service — media,
               specialty, title, a two-line description, status · delivery, price, actions. Providers
               keep a handful of services, so rows stay roomy (a real media, the description) rather
               than table-dense. The whole row opens the editor (a stretched button on the title); the
               grip, "View on profile" and ⋮ sit above it. */
            <div ref={listRef} className="relative z-10 flex flex-col gap-3 overflow-visible">
              {visibleServices.map((service, index) => {
                const status = normalizeServiceStatus(service.status);
                const deliveryLabel = formatServiceDelivery(service);
                const priceLabel = formatServicePrice(service);
                /* Price column: a small eyebrow (mirrors the specialty one on the left) over the figure,
                   so "Starting at 3000 €" and "On request" stack to the same short width. */
                const priceParts = getServicePriceParts(service);
                const priceEyebrow = priceParts.kind === 'quote'
                  ? t('Price quote')
                  : priceParts.isFrom
                    ? t('Starting at')
                    : t('Price');
                const priceText = priceParts.isFrom && priceParts.kind !== 'quote'
                  ? [priceParts.kind === 'free' ? t('Free') : priceParts.text, priceParts.period].filter(Boolean).join(' ')
                  : priceLabel;
                const isDragging = dragId === service.id;
                const dragIndex = dragId ? visibleServices.findIndex((item) => item.id === dragId) : -1;
                const dropSide =
                  dragId && overId === service.id && dragId !== service.id
                    ? index > dragIndex
                      ? 'after'
                      : 'before'
                    : null;
                /* Only active services are public; the deep link opens this service on the profile. */
                const publicHref =
                  status === 'ACTIVE' && user?.id
                    ? `/providers/${encodeURIComponent(user.id)}?tab=services&service=${encodeURIComponent(service.id)}`
                    : null;
                return (
                  <article
                    key={service.id}
                    data-service-id={service.id}
                    // `!` on the fills: the theme's `.news-theme article` rule paints articles itself.
                    // Phones: a card — media on top (16:9, full width), then the text, then price · actions.
                    // From sm: one row — media left, text, price, actions.
                    className={`group relative flex flex-col gap-3 overflow-visible !bg-[#F7F9F9] p-3 transition-[background-color,opacity] duration-200 hover:!bg-[#EFF3F4] dark:!bg-[#16181C] dark:hover:!bg-[#1D1F23] sm:flex-row sm:items-center sm:gap-5 sm:p-4 ${
                      showPageHeader ? '' : 'max-sm:-mx-4'
                    } ${
                      isDragging
                        ? 'opacity-50 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.3)] ring-1 ring-black/15 dark:ring-white/20'
                        : ''
                    } ${openMenuId === service.id || isDragging ? 'z-30' : 'z-0'}`}
                  >
                    {dropSide ? (
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-x-0 h-[2px] rounded-full bg-[#111111] dark:bg-white ${
                          dropSide === 'before' ? '-top-[7px]' : '-bottom-[7px]'
                        }`}
                      />
                    ) : null}
                    {!draft && hasAnyServices ? (
                      <button
                        type="button"
                        aria-label={t('Reorder {title}. Drag, or use arrow keys.', { title: service.title })}
                        title={t('Drag to reorder')}
                        // Floats over the media (glass chip), so it takes no room: its top-left corner on
                        // phones, the middle of its left edge from sm.
                        className={`absolute left-5 top-5 z-10 flex touch-none select-none items-center justify-center rounded-md bg-black/55 px-1.5 py-2 text-white/80 backdrop-blur-md transition-opacity hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:left-6 sm:top-1/2 sm:-translate-y-1/2 ${
                          canReorder ? 'cursor-grab active:cursor-grabbing' : 'cursor-not-allowed'
                        } ${isDragging ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}
                        onPointerDown={(event) => {
                          if (event.button !== 0) return;
                          event.preventDefault();
                          if (!canReorder) {
                            setDropHint(true);
                            return;
                          }
                          setDropHint(false);
                          pointerYRef.current = event.clientY;
                          overIdRef.current = service.id;
                          setOverId(service.id);
                          setDragId(service.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
                          event.preventDefault();
                          if (!canReorder) {
                            setDropHint(true);
                            return;
                          }
                          const neighbour = visibleServices[event.key === 'ArrowUp' ? index - 1 : index + 1];
                          if (neighbour) void reorderServices(service.id, neighbour.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faGripVertical} className="h-3.5 w-3.5" />
                      </button>
                    ) : null}

                    <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-[#EFF3F4] dark:bg-[#202327] sm:aspect-auto sm:h-28 sm:w-44 sm:self-start md:h-[136px] md:w-52">
                      <ServiceCover
                        title={service.title}
                        coverImageUrl={service.coverImageUrl}
                        priority={index === 0}
                        className="h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                      />
                    </div>

                    <div className="min-w-0 flex-1 px-1 sm:px-0">
                      {service.specialty ? (
                        <p className="truncate text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
                          {t(polishSpecialtyLabel(service.specialty))}
                        </p>
                      ) : null}
                      <h3 className="mt-0.5 truncate text-[17px] font-bold leading-[22px] tracking-[-0.01em] text-[#0F1419] dark:text-[#E7E9EA]">
                        <button
                          type="button"
                          onClick={() => openEdit(service)}
                          disabled={saving || Boolean(draft)}
                          title={t('Edit service')}
                          className="text-left outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-inset focus-visible:after:ring-[#0F1419]/30 disabled:cursor-default dark:focus-visible:after:ring-white/30"
                        >
                          {service.title}
                        </button>
                      </h3>
                      {service.description?.trim() ? (
                        <p className="mt-1 line-clamp-2 text-[14px] leading-5 text-[#536471] dark:text-[#71767B]">
                          {service.description}
                        </p>
                      ) : null}
                      <p className="mt-2 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-0.5 text-[13px] leading-[18px] text-[#536471] dark:text-[#71767B]">
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} />
                          {serviceStatusLabel(status)}
                        </span>
                        {deliveryLabel ? (
                          <>
                            <span aria-hidden>·</span>
                            <span className="inline-flex items-center gap-1">
                              <FontAwesomeIcon icon={faClock} className="h-3 w-3" />
                              {deliveryLabel}
                            </span>
                          </>
                        ) : null}
                      </p>
                    </div>

                    {/* Phones: one footer row — price left, actions right. From sm (`contents`) the two
                        become the row's own price and actions columns. */}
                    <div className="flex items-center justify-between gap-3 border-t border-black/[0.06] px-1 pt-2 dark:border-white/[0.07] sm:contents">
                      {/* From sm a fixed-width column: every row's description wraps at the same edge and
                          the prices line up on one right rail. */}
                      <p className="flex items-baseline gap-1.5 sm:w-40 sm:shrink-0 sm:flex-col sm:items-end sm:gap-0.5">
                        <span className="text-[11px] font-semibold uppercase leading-4 tracking-[0.12em] text-[#536471] dark:text-[#71767B]">
                          {priceEyebrow}
                        </span>
                        <span title={priceLabel} className="text-[17px] font-extrabold leading-[22px] tabular-nums text-[#0F1419] dark:text-[#E7E9EA] sm:max-w-full sm:truncate sm:text-right">
                          {priceText}
                        </span>
                      </p>

                      <div className="relative z-10 -mr-1 flex shrink-0 items-center gap-0.5 sm:mr-0">
                        {publicHref ? (
                          <Link
                            href={publicHref}
                            target="_blank"
                            rel="noreferrer"
                            title={t('View on profile')}
                            aria-label={t('View {title} on your profile', { title: service.title })}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[#536471] transition-colors hover:bg-[rgba(15,20,25,0.06)] hover:text-[#0F1419] dark:text-[#71767B] dark:hover:bg-[rgba(231,233,234,0.1)] dark:hover:text-[#E7E9EA]"
                          >
                            <ExternalIcon className="h-4 w-4" />
                          </Link>
                        ) : null}
                        <ServiceContextMenu
                          service={service}
                          disabled={saving || Boolean(draft)}
                          viewHref={publicHref}
                          onEdit={() => openEdit(service)}
                          onDuplicate={() => void duplicateService(service)}
                          onActivate={() => void setServiceStatus(service.id, 'ACTIVE')}
                          onDeactivate={() => void setServiceStatus(service.id, 'PAUSED')}
                          onArchive={() => void archiveOrDelete(service.id, false)}
                          onRemove={() => void archiveOrDelete(service.id, true)}
                          onOpenChange={(open) => setOpenMenuId(open ? service.id : null)}
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {dropHint && reorderBlockedByFilters ? (
            <p
              role="status"
              className={`flex items-center justify-center gap-2 bg-[#F7F9F9] px-4 py-3 text-[15px] text-[#536471] dark:bg-[#16181C] dark:text-[#71767B] ${pageInsetMargin}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#0F1419] dark:bg-[#E7E9EA]" aria-hidden />
              {t('Reset filters to reorder your services')}
            </p>
          ) : null}
        </section>
      )}

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );

  if (!showPageHeader) return mainColumn;

  const specialtyCount = (label: string) =>
    services.filter((item) => specialtyKey(item.specialty ?? '') === specialtyKey(label)).length;
  const publicServicesHref = user?.id ? `/providers/${encodeURIComponent(user.id)}?tab=services` : null;

  /*
   * Layout — News / Providers' frame: below lg the list alone; from lg the list, then a sticky 340px
   * rail (400px from xl) whose right edge sits under the avatar. The list's rows are filled blocks;
   * the rail's tools are outlined `.gn-rail-box`es, in News's order — an info box, the filter box,
   * a link row, then the page's primary pill, which the sticky rail keeps in view.
   */
  return (
    <div className="grid w-full items-start lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-12">
      {mainColumn}
      <div className="hidden self-start pt-6 lg:block">
        <ProfileSectionStickyAside className="w-full" surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6">
          <section className="gn-rail-box flex flex-col px-px pb-5 pt-5" aria-labelledby="my-services-rail-title">
            <h2 id="my-services-rail-title" className={BOX_TITLE}>
              {t('My services')}
            </h2>
            <p className="px-6 text-[14px] leading-5 text-[color:var(--gn-ink2)]">
              {t('The offers clients can book or request a quote for.')}
            </p>
            <ServiceHourlyRate
              className="mx-6 mt-4 border-t border-[color:var(--gn-line)] pt-4"
              hourlyRateCents={hourlyRate.cents}
              hourlyRateCurrency={hourlyRate.currency}
              onSaved={(cents, currency) => setHourlyRate({ cents, currency })}
            />
          </section>

          {usedSpecialties.length > 0 ? (
            <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="my-services-specialty-title">
              <h2 id="my-services-specialty-title" className={BOX_TITLE}>
                {t('Specialty')}
              </h2>
              <nav aria-label={t('Filter by specialty')} className="flex w-full flex-col">
                <SpecialtyRow
                  label={t('All')}
                  icon={ALL_ICON}
                  active={specialtyFilter === 'ALL'}
                  count={services.length}
                  onClick={() => setSpecialtyFilter('ALL')}
                />
                {usedSpecialties.map((label) => {
                  const active = specialtyFilter !== 'ALL' && specialtyKey(specialtyFilter) === specialtyKey(label);
                  return (
                    <SpecialtyRow
                      key={label}
                      label={polishSpecialtyLabel(label)}
                      icon={specialtyIcon(label)}
                      active={active}
                      count={specialtyCount(label)}
                      onClick={() => setSpecialtyFilter(active ? 'ALL' : label)}
                    />
                  );
                })}
              </nav>
            </section>
          ) : null}

          {publicServicesHref && statusSummary.active > 0 ? (
            /* News's "Build your portfolio" row: an outlined circle glyph, title over one line, chevron. */
            <Link
              href={publicServicesHref}
              target="_blank"
              rel="noreferrer"
              className="gn-rail-box group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-[color:var(--gn-hover-strong,var(--gn-hover))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[color:var(--gn-ink)] shadow-[inset_0_0_0_1px_var(--gn-line)]">
                <RailGlyph>{STOREFRONT_ICON}</RailGlyph>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[17px] font-bold leading-[22px] text-[color:var(--gn-ink)]">
                  {t('View as a client')}
                </span>
                <span className="mt-0.5 block truncate text-[14px] leading-5 text-[color:var(--gn-ink2)]">
                  {t('Your services on your public profile')}
                </span>
              </span>
              <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[color:var(--gn-ink2)] transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          ) : null}

          {showPublish ? (
            <button type="button" onClick={openCreate} disabled={publishDisabled} className={railPrimaryButtonClass}>
              {t('New service')}
            </button>
          ) : null}
        </ProfileSectionStickyAside>
      </div>
    </div>
  );
}
