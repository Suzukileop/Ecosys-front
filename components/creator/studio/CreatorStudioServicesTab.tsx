'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faClock,
  faComment,
  faEllipsisVertical,
  faGripVertical,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
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
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getApiErrorMessage } from '@/lib/api-error';
import api from '@/lib/api';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import {
  getMissingProfileReadinessFields,
  type ProfileReadinessField,
} from '@/lib/creator-profile-readiness';
import { uploadContentMedia } from '@/lib/marketplace-api';
import type { CreatorProfileDto } from '@/types/ecosystem';
import {
  formatServiceDelivery,
  formatServicePrice,
  MAX_PROFILE_SERVICES,
  normalizeServiceCurrency,
  normalizeServiceStatus,
  serviceStatusLabel,
  solidCoverHueFromTitle,
  type ServicePricingType,
  type ServiceStatus,
} from '@/lib/profile-services';
import { parseSpecialtyList, parseSpecialtyTags, specialtyKey } from '@/lib/specialties';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';

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

function ServiceCover({
  title,
  coverImageUrl,
  className,
}: {
  title: string;
  coverImageUrl?: string | null;
  className?: string;
}) {
  const resolved = resolveStorageMediaUrl(coverImageUrl) || coverImageUrl;
  if (resolved) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={resolved} alt="" className={`object-cover ${className ?? ''}`} />
    );
  }
  const hue = solidCoverHueFromTitle(title || 'Service');
  const initial = (title.trim()[0] || 'S').toUpperCase();
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className ?? ''}`}
      style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
      aria-hidden
    >
      <span className="relative text-4xl font-bold tracking-tight text-white/90 sm:text-5xl">
        {initial}
      </span>
    </div>
  );
}

type Draft = ProfileServiceForm;

const menuItemClass =
  'block w-full rounded-md px-3 py-2 text-left text-[14px] text-neutral-700 transition-colors hover:bg-black/[0.05] hover:text-[#111111] dark:text-neutral-300 dark:hover:bg-white/[0.07] dark:hover:text-white';

const menuDangerItemClass =
  'block w-full rounded-md px-3 py-2 text-left text-[14px] text-red-600 transition-colors hover:bg-red-500/[0.08] dark:text-red-400';

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
              <p className="px-3 py-2 text-[14px] text-neutral-500 dark:text-neutral-400">
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
              <button
                type="button"
                className={menuItemClass}
                onClick={() => setConfirmRemove(false)}
              >
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
              <button
                type="button"
                className={menuDangerItemClass}
                onClick={() => setConfirmRemove(true)}
              >
                Remove
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function CreatorStudioServicesTab({ showPageHeader = false }: { showPageHeader?: boolean }) {
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
      setMissingProfileFields(
        getMissingProfileReadinessFields(profile, { requireSpecialties: true })
      );
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
    if (pricingType !== 'QUOTE' && draft.basePriceCents == null) {
      setError('Price is required unless pricing is Quote on request.');
      return;
    }
    const currencyRaw = (draft.currency ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (pricingType !== 'QUOTE' && !currencyRaw) {
      setError('Currency is required.');
      return;
    }
    const cleaned: ProfileServiceForm = {
      ...draft,
      title: draft.title.trim(),
      description: draft.description?.trim() ?? '',
      specialty: draft.specialty.trim(),
      pricingType,
      basePriceCents: pricingType === 'QUOTE' ? null : draft.basePriceCents,
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
    };
    const exists = services.some((item) => item.id === cleaned.id);
    const next = exists
      ? services.map((item) => (item.id === cleaned.id ? cleaned : item))
      : [...services, cleaned];
    await persist(next.map((item, index) => ({ ...item, sortOrder: index })));
  };

  const archiveOrDelete = async (serviceId: string, hardDelete: boolean) => {
    if (hardDelete) {
      await persist(services.filter((item) => item.id !== serviceId).map((item, index) => ({
        ...item,
        sortOrder: index,
      })));
      return;
    }
    const next = services.map((item) =>
      item.id === serviceId ? { ...item, status: 'ARCHIVED' as const } : item
    );
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

  useEffect(() => {
    if (!reorderBlockedByFilters) setDropHint(false);
  }, [reorderBlockedByFilters]);

  const visibleServices = useMemo(() => {
    let list = [...services];
    if (statusFilter !== 'ALL') {
      list = list.filter((item) => normalizeServiceStatus(item.status) === statusFilter);
    }
    if (specialtyFilter !== 'ALL') {
      list = list.filter(
        (item) => specialtyKey(item.specialty ?? '') === specialtyKey(specialtyFilter)
      );
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

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const publishDisabled =
    saving || services.length >= MAX_PROFILE_SERVICES || missingProfileFields.length > 0;
  const showPublish = specialties.length > 0 && hasAnyServices;
  const publishButton = (
    <button type="button" onClick={openCreate} disabled={publishDisabled} className={primaryButtonClass}>
      <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
      New service
    </button>
  );
  const specialtyOptions = [
    { value: 'ALL', label: 'All specialties' },
    ...usedSpecialties.map((item) => ({ value: item, label: item })),
  ];

  return (
    <div
      className={`relative flex min-h-0 w-full flex-1 flex-col space-y-10 overflow-y-auto overscroll-contain pb-24 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${
        showPageHeader ? 'pt-8 sm:pt-10' : ''
      }`}
    >
      {showPageHeader ? (
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <h1 className="text-3xl font-bold tracking-tight text-[#111111] dark:text-white sm:text-4xl">
              My services
            </h1>
            <p className="mt-2 text-base text-neutral-500 dark:text-neutral-400">
              The offers clients can book or request a quote for.
            </p>
          </div>
          {showPublish ? publishButton : null}
        </header>
      ) : null}

      {missingProfileFields.length > 0 ? (
        <ProfileReadinessWarning
          missingFields={missingProfileFields}
          title="Complete your profile first"
          description="Add a real profile photo (not the auto-generated avatar), plus address, phone, email, nationality, link, name, role, location, and specialties before publishing a service. Don't worry — it's a mark of trust for your clients."
        />
      ) : null}

      {error ? <ErrorAlert message={error} onDismiss={() => setError(null)} /> : null}

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
        <CreatorServicesEmptyGuide
          onCreate={openCreate}
          createDisabled={
            missingProfileFields.length > 0 ||
            specialties.length === 0 ||
            saving ||
            services.length >= MAX_PROFILE_SERVICES
          }
        />
      ) : (
        <section className="space-y-6" aria-label="Your services">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-black/[0.06] dark:border-white/[0.06]">
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
                    className={`relative inline-flex shrink-0 items-center gap-1.5 py-3.5 text-base transition-colors ${
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
                      <span
                        className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[#FF5722]"
                        aria-hidden
                      />
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
              {!showPageHeader && showPublish ? publishButton : null}
            </div>
          </div>

          {visibleServices.length === 0 && !draft ? (
            <div className="rounded-lg border border-dashed border-black/[0.12] px-6 py-16 text-center dark:border-white/[0.12]">
              <p className="text-lg font-semibold text-[#111111] dark:text-white">
                No services match these filters
              </p>
              <p className="mt-2 text-[15px] text-neutral-500 dark:text-neutral-400">
                Change the status or specialty filter to see other offers.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStatusFilter('ALL');
                  setSpecialtyFilter('ALL');
                }}
                className="mt-6 inline-flex items-center rounded-lg border border-black/[0.12] px-4 py-2 text-[14px] font-medium text-[#111111] transition-colors hover:bg-black/[0.04] dark:border-white/[0.12] dark:text-white dark:hover:bg-white/[0.06]"
              >
                Reset filters
              </button>
            </div>
          ) : (
            <div className="relative z-10 flex flex-col gap-4 overflow-visible">
              {visibleServices.map((service) => {
                const status = normalizeServiceStatus(service.status);
                const deliveryLabel = formatServiceDelivery(service);
                const priceLabel = formatServicePrice(service);
                const tags = (service.tags ?? []).filter((tag) => tag.trim());
                const isDragging = dragId === service.id;
                return (
                  <article
                    key={service.id}
                    draggable={canReorder}
                    onDragStart={(event) => {
                      if (!canReorder) {
                        event.preventDefault();
                        setDropHint(true);
                        return;
                      }
                      setDragId(service.id);
                      setDropHint(false);
                      event.dataTransfer.effectAllowed = 'move';
                      event.dataTransfer.setData('text/plain', service.id);
                    }}
                    onDragEnd={() => {
                      setDragId(null);
                    }}
                    onDragOver={(event) => {
                      if (!canReorder) {
                        event.preventDefault();
                        setDropHint(true);
                        return;
                      }
                      event.preventDefault();
                      event.dataTransfer.dropEffect = 'move';
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!canReorder) {
                        setDropHint(true);
                        return;
                      }
                      const fromId = event.dataTransfer.getData('text/plain') || dragId;
                      setDragId(null);
                      if (fromId) void reorderServices(fromId, service.id);
                    }}
                    className={`group relative overflow-visible rounded-lg border border-black/[0.06] bg-white p-4 transition-colors duration-200 hover:border-black/[0.14] dark:border-white/[0.08] dark:bg-[#111111] dark:hover:border-white/[0.16] sm:p-5 ${
                      isDragging ? 'opacity-60' : ''
                    } ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''} ${
                      openMenuId === service.id ? 'z-30' : 'z-0'
                    }`}
                  >
                    <div className="flex flex-col gap-5 md:flex-row md:gap-6">
                      {!draft && hasAnyServices ? (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Reorder"
                          className="absolute left-7 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-md border border-black/[0.06] bg-white/95 px-1.5 py-2 text-neutral-400 backdrop-blur group-hover:flex dark:border-white/[0.08] dark:bg-[#111111]/90 dark:text-neutral-500 md:flex md:opacity-0 md:transition-opacity md:group-hover:opacity-100"
                          onMouseDown={(event) => {
                            event.preventDefault();
                            if (reorderBlockedByFilters) setDropHint(true);
                          }}
                          onClick={() => {
                            if (reorderBlockedByFilters) setDropHint(true);
                          }}
                        >
                          <FontAwesomeIcon icon={faGripVertical} className="h-4 w-4" />
                        </button>
                      ) : null}
                      <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 md:aspect-[4/3] md:w-[240px] lg:w-[280px]">
                        <ServiceCover
                          title={service.title}
                          coverImageUrl={service.coverImageUrl}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold leading-snug tracking-tight text-[#111111] transition-colors duration-200 group-hover:text-[#FF5722] dark:text-white dark:group-hover:text-[#FF5722]">
                              {service.title}
                            </h3>
                            <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[14px] text-neutral-500 dark:text-neutral-400">
                              {service.specialty ? (
                                <>
                                  <span className="truncate">{service.specialty}</span>
                                  <span className="text-neutral-300 dark:text-neutral-600" aria-hidden>
                                    ·
                                  </span>
                                </>
                              ) : null}
                              <span className="inline-flex items-center gap-1.5">
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${statusDotClass(status)}`}
                                  aria-hidden
                                />
                                {serviceStatusLabel(status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <p
                              className={`whitespace-nowrap tabular-nums ${
                                priceLabel === 'On request'
                                  ? 'text-[15px] font-medium text-neutral-500 dark:text-neutral-400'
                                  : 'text-lg font-semibold text-[#111111] dark:text-white'
                              }`}
                            >
                              {priceLabel}
                            </p>
                            <ServiceContextMenu
                              service={service}
                              disabled={saving || Boolean(draft)}
                              onEdit={() => openEdit(service)}
                              onDuplicate={() => void duplicateService(service)}
                              onActivate={() => void setServiceStatus(service.id, 'ACTIVE')}
                              onDeactivate={() => void setServiceStatus(service.id, 'PAUSED')}
                              onArchive={() => void archiveOrDelete(service.id, false)}
                              onRemove={() => void archiveOrDelete(service.id, true)}
                              onOpenChange={(open) =>
                                setOpenMenuId(open ? service.id : null)
                              }
                            />
                          </div>
                        </div>

                        {service.description ? (
                          <p className="mt-3 line-clamp-2 text-[15px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {service.description}
                          </p>
                        ) : null}

                        {deliveryLabel || tags.length > 0 ? (
                          <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-4 text-[14px]">
                            {deliveryLabel ? (
                              <p className="inline-flex items-center gap-2 text-neutral-600 dark:text-neutral-300">
                                <FontAwesomeIcon
                                  icon={faClock}
                                  className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                                />
                                {deliveryLabel}
                              </p>
                            ) : null}
                            {tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex rounded-md border border-black/[0.08] px-2 py-0.5 text-[13px] text-neutral-600 dark:border-white/[0.1] dark:text-neutral-300"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
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
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-black/[0.06] bg-white px-4 py-2.5 text-[14px] text-neutral-600 dark:border-white/[0.08] dark:bg-[#111111] dark:text-neutral-300"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-hidden />
              Reset filters to reorder your services
            </p>
          ) : null}
        </section>
      )}
    </div>
  );
}

type PublicServiceCardProps = {
  service: {
    id: string;
    title: string;
    description?: string | null;
    specialty?: string | null;
    pricingType?: string | null;
    basePriceCents?: number | null;
    currency?: string | null;
    deadline?: string | null;
    deliveryValue?: number | null;
    deliveryUnit?: string | null;
    coverImageUrl?: string | null;
    tags?: string[];
  };
  discussHref: string | null;
  discussLabel: string;
};

export function PublicServiceCard({ service, discussHref, discussLabel }: PublicServiceCardProps) {
  const cover = resolveStorageMediaUrl(service.coverImageUrl) || service.coverImageUrl;
  const deliveryLabel = formatServiceDelivery(service);
  const hue = solidCoverHueFromTitle(service.title || 'Service');
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
      <div className="aspect-[16/9] bg-neutral-100 dark:bg-neutral-800">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" className="h-full w-full object-cover" />
        ) : (
          <div
            className="flex h-full items-center justify-center text-3xl font-bold text-white/90"
            style={{ backgroundColor: `hsl(${hue} 48% 42%)` }}
          >
            {(service.title.trim()[0] || 'S').toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-2">
          <h3 className="text-base font-semibold leading-snug text-neutral-900 dark:text-white">
            {service.title}
          </h3>
          {service.specialty ? (
            <span className="inline-flex rounded-full bg-orange-50 px-2.5 py-1 text-[11px] font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
              {service.specialty}
            </span>
          ) : null}
        </div>
        {service.description ? (
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
            {service.description}
          </p>
        ) : null}
        <div className="mt-auto space-y-3 pt-1">
          <div className="space-y-1">
            <p className="text-xl font-bold tracking-tight text-neutral-950 tabular-nums dark:text-white">
              {formatServicePrice(service)}
            </p>
            {deliveryLabel ? (
              <p className="text-xs text-neutral-500 dark:text-neutral-400">{deliveryLabel}</p>
            ) : null}
          </div>
          {discussHref ? (
            <Link
              href={discussHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              <FontAwesomeIcon icon={faComment} className="h-3.5 w-3.5" />
              {discussLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}
