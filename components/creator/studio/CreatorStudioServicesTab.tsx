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

const toolbarSelectClass =
  'h-9 w-full rounded-lg border border-neutral-300 bg-transparent px-2.5 text-xs font-medium text-neutral-600 outline-none transition hover:bg-neutral-50 focus:border-orange-400 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-900';

function duplicateTitle(title: string): string {
  const base = title.trim() || 'Service';
  if (/\(copy\)$/i.test(base) || /\(copie\)$/i.test(base)) return base;
  const next = `${base} (copy)`;
  return next.length > 100 ? `${base.slice(0, 93)} (copy)` : next;
}

function statusTone(status: ServiceStatus) {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300';
    case 'PAUSED':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300';
    default:
      return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
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
  'block w-full px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 dark:text-neutral-100 dark:hover:bg-neutral-800';

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
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 transition hover:bg-neutral-50 disabled:opacity-40 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        aria-label="More actions"
        aria-expanded={open}
      >
        <FontAwesomeIcon icon={faEllipsisVertical} className="h-4 w-4" />
      </button>
      {open ? (
        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900">
          {confirmRemove ? (
            <>
              <p className="px-3 py-2 text-xs text-neutral-500 dark:text-neutral-400">
                Delete this service permanently?
              </p>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
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
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
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

export function CreatorStudioServicesTab() {
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
        profileServices: serializeProfileServices(next, fallback),
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

  return (
    <div className="relative min-h-0 w-full flex-1 space-y-4 overflow-y-auto overscroll-contain pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="order-2 min-w-0 flex-1 space-y-4 lg:order-1">
          {visibleServices.length === 0 && !draft ? (
            <div className="rounded-2xl border border-dashed border-neutral-300 px-5 py-12 text-center dark:border-neutral-700">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                No services match these filters
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Change the status or specialty filter to see other offers.
              </p>
            </div>
          ) : (
            <div className="relative z-10 space-y-4 overflow-visible">
              {visibleServices.map((service) => {
                const status = normalizeServiceStatus(service.status);
                const deliveryLabel = formatServiceDelivery(service);
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
                    className={`group relative overflow-visible rounded-2xl border border-neutral-200 bg-white shadow-sm transition dark:border-neutral-800 dark:bg-neutral-950 ${
                      isDragging ? 'opacity-60' : ''
                    } ${canReorder ? 'cursor-grab active:cursor-grabbing' : ''} ${
                      openMenuId === service.id ? 'z-30' : 'z-0'
                    }`}
                  >
                    <div className="flex min-h-[13.5rem] flex-col rounded-2xl md:min-h-[15rem] md:flex-row">
                      {!draft && hasAnyServices ? (
                        <button
                          type="button"
                          tabIndex={-1}
                          aria-label="Reorder"
                          className="absolute left-2 top-1/2 z-10 hidden -translate-y-1/2 items-center justify-center rounded-lg border border-neutral-200 bg-white/95 px-1.5 py-2 text-neutral-400 shadow-sm group-hover:flex dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-500 md:flex md:opacity-0 md:transition md:group-hover:opacity-100"
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
                      <div className="overflow-hidden md:rounded-l-2xl">
                        <ServiceCover
                          title={service.title}
                          coverImageUrl={service.coverImageUrl}
                          className="aspect-[16/9] w-full shrink-0 md:aspect-auto md:h-full md:min-h-[15rem] md:w-[220px] md:self-stretch lg:w-[260px]"
                        />
                      </div>
                      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-2xl">
                              {service.title}
                            </h3>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {service.specialty ? (
                                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
                                  {service.specialty}
                                </span>
                              ) : null}
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusTone(status)}`}
                              >
                                {serviceStatusLabel(status)}
                              </span>
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2.5">
                            <p className="inline-flex h-9 items-center rounded-xl bg-orange-500 px-3 text-sm font-bold text-white shadow-sm sm:text-base">
                              {formatServicePrice(service)}
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
                          <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                            {service.description}
                          </p>
                        ) : null}

                        {tags.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex rounded-lg border border-neutral-200 bg-neutral-50 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        ) : null}

                        {deliveryLabel ? (
                          <div className="mt-auto border-t border-neutral-200 pt-3 dark:border-neutral-800">
                            <p className="inline-flex items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                              <FontAwesomeIcon
                                icon={faClock}
                                className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                              />
                              {deliveryLabel}
                            </p>
                          </div>
                        ) : (
                          <div className="mt-auto" aria-hidden />
                        )}
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
              className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200"
            >
              Reset filters to reorder your services
            </p>
          ) : null}
        </div>

        {specialties.length > 0 ? (
          <aside className="order-1 w-full shrink-0 lg:sticky lg:top-4 lg:order-2 lg:w-48">
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={openCreate}
                disabled={saving || services.length >= MAX_PROFILE_SERVICES || missingProfileFields.length > 0}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-40"
              >
                <FontAwesomeIcon icon={faPlus} className="h-3.5 w-3.5" />
                Publish
              </button>

              {hasAnyServices ? (
                <div className="flex flex-col gap-2 rounded-xl border border-neutral-200 bg-white p-2 dark:border-neutral-800 dark:bg-neutral-950">
                  <div className="flex flex-col gap-1" role="group" aria-label="Filter by status">
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
                          className={`inline-flex h-9 w-full items-center justify-between rounded-lg px-3 text-left text-xs font-medium transition ${
                            selected
                              ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                              : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <span>{option.label}</span>
                          <span className={`tabular-nums ${selected ? 'opacity-80' : 'opacity-55'}`}>
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
                    <select
                      value={specialtyFilter}
                      onChange={(event) => setSpecialtyFilter(event.target.value)}
                      className={toolbarSelectClass}
                      aria-label="Filter by specialty"
                    >
                      <option value="ALL">All specialties</option>
                      {usedSpecialties.map((item) => (
                        <option key={specialtyKey(item)} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : null}
            </div>
          </aside>
        ) : null}
      </div>
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
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-semibold text-neutral-900 dark:text-white">{service.title}</h3>
          {service.specialty ? (
            <span className="mt-1.5 inline-flex rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-800 dark:bg-orange-500/10 dark:text-orange-300">
              {service.specialty}
            </span>
          ) : null}
        </div>
        {service.description ? (
          <p className="line-clamp-3 text-sm text-neutral-600 dark:text-neutral-400">
            {service.description}
          </p>
        ) : null}
        <div className="mt-auto space-y-2">
          <p className="text-sm font-semibold text-neutral-900 dark:text-white">
            {formatServicePrice(service)}
          </p>
          {deliveryLabel ? (
            <p className="text-xs text-neutral-500">{deliveryLabel}</p>
          ) : null}
          {(service.tags ?? []).length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {(service.tags ?? []).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-200 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {discussHref ? (
            <Link
              href={discussHref}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-3 py-2.5 text-sm font-semibold text-white hover:bg-orange-600"
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
