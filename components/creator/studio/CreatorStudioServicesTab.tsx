'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faEllipsisVertical, faGripVertical, faPlus } from '@fortawesome/free-solid-svg-icons';
import {
  createEmptyProfileService,
  parseProfileServices,
  serializeProfileServices,
  type ProfileServiceForm,
} from '@/components/creator/studio/profile-form-schema';
import { ServiceFormDrawer } from '@/components/creator/studio/ServiceFormDrawer';
import { CreatorServicesEmptyGuide } from '@/components/creator/studio/CreatorServicesEmptyGuide';
import { ProfileReadinessWarning } from '@/components/creator/studio/ProfileReadinessWarning';
import { MarketplaceFilterDropdown } from '@/components/marketplace/MarketplaceFilterDropdown';
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
import { parseSpecialtyList, parseSpecialtyTags, specialtyKey } from '@/lib/specialties';
import { MediaImage } from '@/components/ui/MediaImage';

/** Cover box: full width on mobile, 260 px (md) / 300 px (lg) beside the text. */
const SERVICE_COVER_WIDTHS = [256, 384, 640, 828] as const;
const SERVICE_COVER_SIZES = '(min-width: 1024px) 300px, (min-width: 768px) 260px, 100vw';

type StatusFilter = 'ALL' | ServiceStatus;

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'PAUSED', label: 'Paused' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-lg bg-[#111111] px-5 py-2.5 text-[15px] font-medium text-white transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-[#111111]';

const padCount = (count: number) => String(count).padStart(2, '0');

function duplicateTitle(title: string): string {
  const base = title.trim() || 'Service';
  if (/\(copy\)$/i.test(base) || /\(copie\)$/i.test(base)) return base;
  const next = `${base} (copy)`;
  return next.length > 100 ? `${base.slice(0, 93)} (copy)` : next;
}

function statusDotClass(status: ServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-500';
    case 'PAUSED':
      return 'bg-amber-500';
    default:
      return 'bg-neutral-400 dark:bg-neutral-500';
  }
}

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
  'block w-full rounded-md px-3 py-2 text-left text-[15px] text-neutral-700 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-300 dark:hover:bg-white/[0.07] dark:hover:text-white';

const menuDangerItemClass =
  'block w-full rounded-md px-3 py-2 text-left text-[15px] text-red-600 transition-colors hover:bg-red-500/[0.08] dark:text-red-400';

function ServiceContextMenu({
  service,
  disabled,
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
  onEdit: () => void;
  onDuplicate: () => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onArchive: () => void;
  onRemove: () => void;
  onOpenChange?: (open: boolean) => void;
}) {
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
        className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-black/[0.05] hover:text-[#111111] disabled:opacity-40 dark:text-neutral-400 dark:hover:bg-white/[0.08] dark:hover:text-white ${
          open ? 'bg-black/[0.05] text-[#111111] dark:bg-white/[0.08] dark:text-white' : ''
        }`}
        aria-label="More actions"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
      </button>
      {open ? (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-black/[0.06] bg-white/95 p-1.5 shadow-2xl backdrop-blur-xl dark:border-white/[0.08] dark:bg-[#141414]/95"
          style={STUDIO_FLOAT_IN_STYLE}
        >
          {confirmRemove ? (
            <>
              <p className="px-3 py-2 text-[15px] leading-snug text-neutral-500 dark:text-neutral-400">
                Delete this service permanently?
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
                Delete forever
              </button>
              <button type="button" className={menuItemClass} onClick={() => setConfirmRemove(false)}>
                Cancel
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
                Edit
              </button>
              <button
                type="button"
                className={menuItemClass}
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate();
                }}
              >
                Duplicate
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
                  Deactivate
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
                  Activate
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
                  Archive
                </button>
              ) : null}
              <div className="mx-2 my-1 h-px bg-black/[0.06] dark:bg-white/[0.06]" aria-hidden />
              <button type="button" className={menuDangerItemClass} onClick={() => setConfirmRemove(true)}>
                Remove
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
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<ProfileServiceForm[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [keywordTags, setKeywordTags] = useState<string[]>([]);
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
      setKeywordTags(parseSpecialtyTags(profile.specialtyTags));
      setServices(parseProfileServices(profile.profileServices));
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

  const saveDraft = async () => {
    if (!draft) return;
    if (!draft.title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!draft.specialty?.trim()) {
      setError('Choose a specialty for this service.');
      return;
    }
    const pricingType = (draft.pricingType ?? 'FIXED') as ServicePricingType;
    const needsAmount = servicePricingNeedsAmount(pricingType);
    if (needsAmount && draft.basePriceCents == null) {
      setError('Price is required unless pricing is Quote on request or Free.');
      return;
    }
    const currencyRaw = (draft.currency ?? '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    if (needsAmount && !currencyRaw) {
      setError('Currency is required.');
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
      status: draft.status ?? 'ACTIVE',
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
        title="Complete your profile first"
        description="Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, location, and specialties before publishing a service. Don't worry — it's a mark of trust for your clients."
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

  if (loading) {
    return (
      <div className={showPageHeader ? 'pt-4 sm:pt-10' : ''}>
        <div className={pageInset}>
          <CreatorStudioServicesTabSkeleton />
        </div>
      </div>
    );
  }

  const publishDisabled = saving || services.length >= MAX_PROFILE_SERVICES || missingProfileFields.length > 0;
  const showPublish = specialties.length > 0 && hasAnyServices;
  const specialtyOptions = [
    { value: 'ALL', label: 'All specialties' },
    ...usedSpecialties.map((item) => ({ value: item, label: item })),
  ];

  return (
    <div
      className={`relative flex w-full flex-col space-y-6 pb-24 sm:space-y-10 ${
        showPageHeader
          ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain pt-4 [scrollbar-width:none] [-ms-overflow-style:none] sm:pt-10 [&::-webkit-scrollbar]:hidden'
          : ''
      }`}
    >
      {showGreeting ? (
        <div className="flex items-center justify-between gap-6">
          <h1 className="min-w-0 truncate text-[40px] font-semibold leading-none tracking-[-0.035em] text-[#111111] dark:text-white sm:text-[56px]">
            Hi, {greetingName}
          </h1>
          {profileWarning}
        </div>
      ) : (
        <>
          {showPageHeader ? (
            <header className={`flex items-center justify-between gap-x-6 gap-y-4 sm:flex-wrap sm:items-end ${pageInset}`}>
              <div className="min-w-0">
                <h1 className="text-[1.5rem] font-bold leading-tight tracking-[-0.01em] text-[#111111] dark:text-white">
                  My services
                </h1>
                <p className="mt-2 hidden text-[16px] text-neutral-500 dark:text-neutral-400 sm:block">
                  The offers clients can book or request a quote for.
                </p>
              </div>
              {showPublish ? (
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={publishDisabled}
                  aria-label="New service"
                  className={`${primaryButtonClass} h-9 w-9 shrink-0 !rounded-full !px-0 !py-0 sm:h-auto sm:w-auto sm:!rounded-lg sm:!px-5 sm:!py-2.5`}
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New service</span>
                </button>
              ) : null}
            </header>
          ) : null}
          {profileWarning ? <div className={pageInset}>{profileWarning}</div> : null}
        </>
      )}

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
        keywordTags={keywordTags}
        saving={saving}
        uploadingCover={uploadingCover}
        onChange={(next) => setDraft(next)}
        onClose={cancelEdit}
        onSave={() => void saveDraft()}
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
        <section className="space-y-6" aria-label="Your services">
          <div
            ref={toolbarRef}
            className={`flex scroll-mt-6 items-center justify-between gap-x-4 gap-y-2 border-b border-black/[0.06] dark:border-white/[0.06] sm:flex-wrap sm:gap-x-6 ${pageInset}`}
          >
            <div
              className="-mb-px flex min-w-0 gap-6 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              role="group"
              aria-label="Filter by status"
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
                    className={`relative inline-flex shrink-0 items-center gap-2 py-3.5 text-[15px] transition-colors ${
                      selected
                        ? 'font-medium text-[#111111] dark:text-white'
                        : 'text-neutral-500 hover:text-[#111111] dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {option.label}
                    {count > 0 ? (
                      <span className="text-[14px] tabular-nums text-neutral-400 dark:text-neutral-500">
                        {padCount(count)}
                      </span>
                    ) : null}
                    {selected ? (
                      <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF5722]" aria-hidden />
                    ) : null}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3 py-2">
              {usedSpecialties.length > 0 ? (
                <MarketplaceFilterDropdown
                  id="my-services-specialty"
                  label="Specialty"
                  value={specialtyFilter}
                  onChange={setSpecialtyFilter}
                  options={specialtyOptions}
                  defaultValue="ALL"
                  size="sm"
                  align="right"
                />
              ) : null}
              {!showPageHeader && showPublish ? (
                <button
                  type="button"
                  onClick={openCreate}
                  disabled={publishDisabled}
                  aria-label="New service"
                  title="New service"
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-[#111111] bg-transparent text-[14px] font-medium text-[#111111] transition-colors duration-200 hover:bg-[#111111] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF5722]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#111111] dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-[#111111] dark:focus-visible:ring-offset-[#0A0A0A] dark:disabled:hover:bg-transparent dark:disabled:hover:text-white sm:w-auto sm:pl-3.5 sm:pr-4"
                >
                  <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">New service</span>
                </button>
              ) : null}
            </div>
          </div>

          {visibleServices.length === 0 && !draft ? (
            <div className={`rounded-lg border border-dashed border-black/[0.12] px-6 py-12 text-center dark:border-white/[0.12] sm:py-16 ${pageInsetMargin}`}>
              <p className="text-[18px] font-semibold text-[#111111] dark:text-white">
                No services match these filters
              </p>
              <p className="mt-2 text-[16px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                Change the status or specialty filter to see other offers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSpecialtyFilter('ALL');
                }}
                className="mt-6 inline-flex items-center rounded-lg border border-black/[0.12] px-5 py-2.5 text-[15px] font-medium text-[#111111] transition-colors hover:bg-black/[0.04] dark:border-white/[0.12] dark:text-white dark:hover:bg-white/[0.06]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div ref={listRef} className="relative z-10 flex flex-col gap-3 overflow-visible sm:gap-4">
              {visibleServices.map((service, index) => {
                const status = normalizeServiceStatus(service.status);
                const deliveryLabel = formatServiceDelivery(service);
                const priceLabel = formatServicePrice(service);
                const tags = (service.tags ?? []).filter((tag) => tag.trim());
                const isDragging = dragId === service.id;
                const dragIndex = dragId ? visibleServices.findIndex((item) => item.id === dragId) : -1;
                const dropSide =
                  dragId && overId === service.id && dragId !== service.id
                    ? index > dragIndex
                      ? 'after'
                      : 'before'
                    : null;
                return (
                  <article
                    key={service.id}
                    data-service-id={service.id}
                    className={`group relative overflow-visible rounded-xl bg-white p-3 transition-[background-color,opacity,box-shadow] duration-300 dark:bg-[#111111] sm:p-4 ${
                      showPageHeader ? 'max-sm:rounded-none max-sm:px-5' : ''
                    } ${
                      isDragging
                        ? 'opacity-50 shadow-[0_18px_40px_-16px_rgba(0,0,0,0.3)] ring-1 ring-black/15 dark:ring-white/20'
                        : 'dark:hover:bg-[#161616]'
                    } ${openMenuId === service.id || isDragging ? 'z-30' : 'z-0'}`}
                  >
                    {dropSide ? (
                      <span
                        aria-hidden
                        className={`pointer-events-none absolute inset-x-0 h-[2px] rounded-full bg-[#111111] dark:bg-white ${
                          dropSide === 'before' ? '-top-[9px]' : '-bottom-[9px]'
                        }`}
                      />
                    ) : null}
                    <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                      {!draft && hasAnyServices ? (
                        <button
                          type="button"
                          aria-label={`Reorder ${service.title}. Drag, or use arrow keys.`}
                          title="Drag to reorder"
                          className={`absolute left-6 top-1/2 z-10 flex -translate-y-1/2 touch-none select-none items-center justify-center rounded-md bg-black/55 px-1.5 py-2 text-white/80 backdrop-blur-md transition-opacity hover:text-white focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 sm:left-7 ${
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
                          <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
                        </button>
                      ) : null}
                      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900 md:aspect-[4/3] md:w-[260px] lg:w-[300px]">
                        <ServiceCover
                          title={service.title}
                          coverImageUrl={service.coverImageUrl}
                          priority={index === 0}
                          className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        />
                        <span className="pointer-events-none absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur-md">
                          <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`} aria-hidden />
                          {serviceStatusLabel(status)}
                        </span>
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col px-1 pb-1 md:py-1.5 md:pr-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            {service.specialty ? (
                              <p className="truncate text-[12px] font-medium uppercase tracking-[0.14em] text-neutral-500 dark:text-neutral-400">
                                {service.specialty}
                              </p>
                            ) : null}
                            <h3 className="mt-1.5 line-clamp-2 text-[20px] font-semibold leading-snug tracking-[-0.015em] text-[#111111] dark:text-white">
                              {service.title}
                            </h3>
                          </div>
                          <div className="-mr-1 -mt-1 shrink-0">
                            <ServiceContextMenu
                              service={service}
                              disabled={saving || Boolean(draft)}
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

                        {service.description ? (
                          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                            {service.description}
                          </p>
                        ) : null}

                        {tags.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded-full bg-black/[0.05] px-3 py-1 text-[13px] text-neutral-700 dark:bg-white/[0.07] dark:text-neutral-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-auto pt-5">
                          <div className="flex items-end justify-between gap-4 border-t border-black/[0.06] pt-4 dark:border-white/[0.07]">
                            {deliveryLabel ? (
                              <p className="inline-flex items-center gap-2 text-[14px] text-neutral-500 dark:text-neutral-400">
                                <FontAwesomeIcon icon={faClock} className="h-3.5 w-3.5" />
                                {deliveryLabel}
                              </p>
                            ) : (
                              <span />
                            )}
                            <p
                              className={`whitespace-nowrap tabular-nums ${
                                priceLabel === 'On request'
                                  ? 'text-[15px] font-medium text-neutral-500 dark:text-neutral-400'
                                  : 'text-[22px] font-semibold leading-none tracking-[-0.02em] text-[#111111] dark:text-white'
                              }`}
                            >
                              {priceLabel === 'On request' ? 'Price on request' : priceLabel}
                            </p>
                          </div>
                        </div>
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
              className={`flex items-center justify-center gap-2 rounded-xl bg-[#FFFFFF] px-4 py-3 text-[15px] text-neutral-600 dark:bg-[#111111] dark:text-neutral-300 ${pageInsetMargin}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              Reset filters to reorder your services
            </p>
          ) : null}
        </section>
      )}

      <BackToTopButton visible={backToTop.visible} onClick={backToTop.backToTop} />
    </div>
  );
}
