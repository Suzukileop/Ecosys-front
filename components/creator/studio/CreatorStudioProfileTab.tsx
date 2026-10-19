'use client';

import { localeTag, tr, trPlural } from '@/lib/i18n/active';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getApiErrorMessage, UserFacingError } from '@/lib/api-error';
import { ZodError } from 'zod';
import { formatLocationLabel, requestDetectedLocation } from '@/lib/geolocation';
import { ErrorAlert } from '@/components/ui/ErrorAlert';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { CreatorStudioProfileTabSkeleton } from '@/components/creator/studio/CreatorStudioSkeleton';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { AvailabilityHoursInput } from '@/components/ui/AvailabilityHoursInput';
import { ProfileReadOnlyField } from '@/components/creator/studio/ProfileReadOnlyField';
import { ContactVisibilitySelect } from '@/components/creator/studio/ContactVisibilitySelect';
import {
  DEFAULT_CONTACT_VISIBILITY,
  parseContactVisibility,
  type ContactVisibilityLevel,
  type ContactVisibilitySettings,
} from '@/lib/contact-visibility';
import { CREATOR_GENDER_VALUES, normalizeCreatorGender } from '@/lib/creator-gender';
import { NATIONALITY_SELECT_OPTIONS, nationalityLabel, normalizeNationalityCode } from '@/lib/countries';
import { parseSpecialtyList, parseSpecialtyTags } from '@/lib/specialties';
import { serializeSpokenLanguagesForApi } from '@/lib/spoken-languages';
import { parseAboutSkills, serializeAboutSkills } from '@/lib/about-skills';
import { collapseRepeatedBio, isRepeatedBioContent } from '@/lib/profile-bio';
import {
  DEFAULT_CREATOR_APP_ROLE,
  creatorShowsCareerSections,
  creatorShowsProviderAboutFields,
  dispatchCreatorAppRoleChanged,
  normalizeCreatorAppRole,
  type CreatorAppRole,
} from '@/lib/creator-app-role';
import type { CreatorProfileDto, CreatorProfileUpdateBody } from '@/types/profile';
import { updateCreatorProfile } from '@/lib/creator-profile-api';
import { ProfileAppRoleField } from '@/components/creator/studio/ProfileAppRoleField';
import {
  ProfileSectionEditorDrawer,
  SECTION_BODY_KEYS,
  isProfileDrawerSection,
  type ProfileDrawerSectionId,
  type ProfileSectionSaveInput,
} from '@/components/creator/studio/ProfileSectionEditors';
import { ProfileSectionReadView, ProfileSectionsOverview } from '@/components/creator/studio/ProfileSectionReadViews';
import {
  defaultSchedule,
  formatAvailabilityHours,
  parseAvailabilityHours,
  type AvailabilitySchedule,
} from '@/lib/availabilityHours';
import { ProfileMediaBlocksField } from '@/components/creator/studio/ProfileMediaBlocksField';
import { ProfileStrengthsField } from '@/components/creator/studio/ProfileStrengthsField';
import { SpecialtyMultiSelect } from '@/components/creator/studio/SpecialtyMultiSelect';
import { ProfileLanguagesField } from '@/components/creator/studio/ProfileLanguagesField';
import { AboutStringListField } from '@/components/creator/studio/AboutStringListField';
import { AboutSkillsField } from '@/components/creator/studio/AboutSkillsField';
import {
  AboutEducationField,
} from '@/components/creator/studio/AboutEducationField';
import { ProfileServicesField } from '@/components/creator/studio/ProfileServicesField';
import { ProfileFaqField } from '@/components/creator/studio/ProfileFaqField';
import { ProfileTeamField } from '@/components/creator/studio/ProfileTeamField';
import { ProfileGalleryField } from '@/components/creator/studio/ProfileGalleryField';
import { ProfileLinksField } from '@/components/creator/studio/ProfileLinksField';
import { ProfileProductsPicker, MAX_PORTFOLIO_PRODUCTS } from '@/components/creator/studio/ProfileProductsPicker';
import { ProfileSectionItemCount } from '@/components/creator/studio/ProfileSectionLimitUpgradeHint';
import { MAX_SERVICES } from '@/components/creator/studio/ProfileServicesField';
import {
  MAX_EXPERIENCE_ENTRIES,
} from '@/components/portfolio/PortfolioExperienceChrome';
import { buildProfileLinksFromLegacy, createEmptyContactEntry, createEmptyFaqItem, createEmptyGalleryItem, createEmptyProfileBlock, createEmptyProfileLink, createEmptyProfileService, createEmptyTeamMember, deriveProfileLinkLabel, inferProfileMediaType, parseContactEntries, parseFaqItems, parseGalleryItems, parseExperienceBlocks, parseProfileServices, parseSpokenLanguages, parseStrengthsTools, parseAboutUs, parseAboutStringList, parseAboutEducation, serializeAboutUs, serializeAboutStringList, serializeAboutEducation, emptyAboutUsForm, parseTeamMembers, primaryContactValue, profileSchema, serializeContactEntries, serializeFaqItems, serializeGalleryItems, serializeProfileBlocks, serializeProfileLinks, serializeProfileServices, serializeTeamMembers, syncContactLegacyFields, hasProfileFormChanges, areStrengthsToolsEqual, firstProfileErrorMessage, profileErrorPathToSection, type ProfileFormValues, type StrengthFormItem } from '@/components/creator/studio/profile-form-schema';
import { formatPhoneDisplay, toStoredPhoneNumber } from '@/lib/phone';
import { updateUserProfile } from '@/lib/user-profile-api';
import { pushFlashFeedback, pushInsertionLimitFeedback } from '@/stores/flashFeedbackStore';
import { TYPICAL_RESPONSE_TIME_OPTIONS } from '@/lib/typical-response-time';
import {
  getProfileSection,
  filterProfileSectionGroups,
  filterStoreInformationSectionsForRole,
  PORTFOLIO_RAIL_GROUPS,
  PROFILE_SECTION_GROUPS,
  ProfileSectionNavIcon,
  type ProfileSectionId,
} from '@/components/creator/studio/profile-section-nav';
import type { FieldPath, UseFormReturn } from 'react-hook-form';
import {
  profileFormInputClass,
  profileFormLabelClass,
  profileNavButtonActiveClass,
  profileNavButtonBaseClass,
  profileNavButtonInactiveClass,
  profileSectionBodyTextClass,
  profileSectionHeaderDescClass,
  profileSectionHeaderTitleClass,
  profileSectionMutedTextClass,
} from '@/components/creator/studio/profile-section-ui';
import { ProfileSectionStickyAside } from '@/components/creator/studio/ProfileSectionStickyAside';
import { APP_FIELD } from '@/components/landing/landingBrand';
import { CreatorAvailabilityControl, CreatorAvailabilityBadge } from '@/components/creator/studio/CreatorAvailabilityControl';
import {
  PortfolioGeneralInfoStudio,
  type PortfolioGeneralInfoDraft,
} from '@/components/portfolio/PortfolioGeneralInfoStudio';
import { PortfolioAboutStudio, type PortfolioAboutDraft } from '@/components/portfolio/PortfolioAboutStudio';
import {
  PortfolioEditorFooter,
  PortfolioFooterSelect,
  PortfolioProfileHero,
  type PortfolioAboutFieldKey,
  type PortfolioAboutFieldValue,
} from '@/components/portfolio/PortfolioInformationChrome';
import {
  mapProfileBlockToExperienceBlock,
  toDraft as experienceBlockToDraft,
  type PortfolioExperienceBlockDraft,
} from '@/components/portfolio/PortfolioExperienceChrome';
import { toStrengthDraft } from '@/components/portfolio/PortfolioStrengthsChrome';
import { PortfolioServicesReadOnly } from '@/components/portfolio/PortfolioServicesChrome';
import { PortfolioAboutUsReadOnly } from '@/components/portfolio/PortfolioAboutUsChrome';
import { PortfolioShowcaseChrome } from '@/components/portfolio/PortfolioShowcaseChrome';
import { type PortfolioLocationFieldValue } from '@/components/portfolio/PortfolioLocationChrome';
import {
  type PortfolioContactKind,
  type PortfolioContactLists,
} from '@/components/portfolio/PortfolioContactChrome';
import { PORTFOLIO_CHROME_SECTIONS } from '@/components/portfolio/portfolio-section-shared';
import { useT } from '@/lib/i18n/I18nProvider';

/** The studio edits one section at a time, so each section editor is its own chunk. */
const PortfolioExperienceStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioExperienceStudio').then((m) => m.PortfolioExperienceStudio)
);
const PortfolioSkillStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioSkillStudio').then((m) => m.PortfolioSkillStudio)
);
const PortfolioTeamStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioTeamStudio').then((m) => m.PortfolioTeamStudio)
);
const PortfolioAboutUsStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioAboutUsStudio').then((m) => m.PortfolioAboutUsStudio)
);
const PortfolioWorksStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioWorksStudio').then((m) => m.PortfolioWorksStudio)
);
const PortfolioFaqStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioFaqStudio').then((m) => m.PortfolioFaqStudio)
);
const PortfolioContactStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioContactStudio').then((m) => m.PortfolioContactStudio)
);
const PortfolioGalleryStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioGalleryStudio').then((m) => m.PortfolioGalleryStudio)
);
const PortfolioLinksStudio = dynamic(() =>
  import('@/components/portfolio/PortfolioLinksStudio').then((m) => m.PortfolioLinksStudio)
);

/** Surface Zod validation on form fields; never promote field issues to the section banner. */
function applyZodIssuesToProfileForm(
  form: UseFormReturn<ProfileFormValues>,
  error: ZodError
) {
  for (const issue of error.issues) {
    if (!issue.path.length) continue;
    const path = issue.path.join('.') as FieldPath<ProfileFormValues>;
    form.setError(path, { type: 'manual', message: issue.message });
  }
}

function setSectionSaveError(
  e: unknown,
  form: UseFormReturn<ProfileFormValues>,
  setSubmitError: (message: string | null) => void,
  fallback: string
) {
  if (e instanceof ZodError) {
    applyZodIssuesToProfileForm(form, e);
    return;
  }
  setSubmitError(getApiErrorMessage(e, fallback));
}

const PORTFOLIO_DUAL_EDIT_SECTIONS = [
  'about',
  'aboutPage',
  'experience',
] as const;

/** Every section the portfolio rail can show, in the rail's order — for "Show all sections". */
const ALL_PORTFOLIO_RAIL_SECTION_IDS: ProfileSectionId[] = PORTFOLIO_RAIL_GROUPS.flatMap((group) => [...group.sections]);

const SHOW_ALL_SECTIONS_KEY = 'portfolio-sections-show-all';

/** Keys that never make an entry "filled": ids, ordering and kind flags carried by empty rows too. */
const STRUCTURAL_KEYS = new Set(['id', 'type', 'kind', 'sortOrder', 'platform', 'mediaType', 'hideFromCv', 'level', 'category']);

/** True when a form value holds any text a visitor would see (deep: lists, nested entries). */
function hasFilledContent(value: unknown): boolean {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.some(hasFilledContent);
  if (value && typeof value === 'object') {
    return Object.entries(value).some(([key, entry]) => !STRUCTURAL_KEYS.has(key) && hasFilledContent(entry));
  }
  return false;
}

function isPortfolioDualEditSection(sectionId: ProfileSectionId): boolean {
  return (PORTFOLIO_DUAL_EDIT_SECTIONS as readonly string[]).includes(sectionId);
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(localeTag(), { month: 'long', year: 'numeric' });
}

function formatLastUpdatedLabel(value: string | null | undefined): string {
  if (!value) return tr('today');
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return tr('today');
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfThatDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfThatDay.getTime()) / 86_400_000);
  if (diffDays <= 0) return tr('today');
  if (diffDays === 1) return tr('yesterday');
  if (diffDays < 7) return tr('{count} days ago', { count: diffDays });
  return date.toLocaleDateString(localeTag(), { month: 'short', day: 'numeric', year: 'numeric' });
}

function experienceBlockHasContent(
  block: ReturnType<typeof mapProfileBlockToExperienceBlock>
): boolean {
  return (
    block.text.trim().length > 0 ||
    block.title.trim().length > 0 ||
    block.organization.trim().length > 0 ||
    block.period.trim().length > 0 ||
    block.location.trim().length > 0 ||
    block.mediaUrl.trim().length > 0 ||
    block.status != null ||
    block.employmentType != null ||
    block.tasks.some((item) => item.value.trim()) ||
    block.tools.some((item) => item.value.trim()) ||
    block.links.some((item) => item.url.trim() || item.label.trim())
  );
}

function contactEntryFilled(value: string | null | undefined, kind: 'phone' | 'other' = 'other'): boolean {
  if (kind === 'phone') {
    return Boolean(formatPhoneDisplay(value ?? '') || (value ?? '').trim());
  }
  return Boolean((value ?? '').trim());
}

function portfolioSectionItemCountLabel(
  section: ProfileSectionId,
  values: ProfileFormValues,
  portfolioItemCount: number,
  productsItemCount = 0
): string | null {
  switch (section) {
    case 'experience': {
      const count = values.experienceBlocks
        .map(mapProfileBlockToExperienceBlock)
        .filter(experienceBlockHasContent).length;
      return trPlural(count, '{count} experience', '{count} experiences');
    }
    case 'strengths': {
      const count = values.stackItems.filter((item) => item.value.trim().length > 0).length;
      return trPlural(count, '{count} item', '{count} items');
    }
    case 'tools': {
      const count = values.strengthsTools.filter((item) => item.value.trim().length > 0).length;
      return trPlural(count, '{count} tool', '{count} tools');
    }
    case 'services': {
      const count = values.serviceOffers.filter((service) => (service.title ?? '').trim().length > 0)
        .length;
      return trPlural(count, '{count} service', '{count} services');
    }
    case 'products':
      return trPlural(productsItemCount, '{count} product', '{count} products');
    case 'portfolio':
      return trPlural(portfolioItemCount, '{count} work', '{count} works');
    case 'faq': {
      const count = values.faqItems.filter(
        (item) =>
          (item.question ?? '').trim().length > 0 && (item.answer ?? '').trim().length > 0
      ).length;
      return trPlural(count, '{count} question', '{count} questions');
    }
    case 'team': {
      const count = values.teamMembers.filter(
        (member) =>
          (member.name ?? '').trim().length > 0 && (member.responsibility ?? '').trim().length > 0
      ).length;
      return trPlural(count, '{count} member', '{count} members');
    }
    case 'aboutUs': {
      const aboutUs = values.aboutUs;
      const count =
        (aboutUs.title.trim() ? 1 : 0) +
        (aboutUs.description.trim() ? 1 : 0) +
        aboutUs.tasks.filter((task) => task.trim()).length +
        aboutUs.imageUrls.filter((url) => url.trim()).length +
        (aboutUs.quote.trim() ? 1 : 0) +
        (aboutUs.founder.name.trim() || aboutUs.founder.function.trim() || aboutUs.founder.logoUrl.trim()
          ? 1
          : 0);
      return trPlural(count, '{count} field', '{count} fields');
    }
    case 'gallery': {
      const count = values.galleryItems.filter((item) => (item.mediaUrl ?? '').trim().length > 0)
        .length;
      return trPlural(count, '{count} media item', '{count} media items');
    }
    case 'links': {
      const count = values.profileLinks.filter((link) => (link.url ?? '').trim().length > 0).length;
      return trPlural(count, '{count} link', '{count} links');
    }
    case 'contact': {
      const count =
        values.contactAddresses.filter((entry) => contactEntryFilled(entry.value)).length +
        values.contactPhones.filter((entry) => contactEntryFilled(entry.value, 'phone')).length +
        values.contactEmails.filter((entry) => contactEntryFilled(entry.value)).length;
      return trPlural(count, '{count} contact detail', '{count} contact details');
    }
    case 'about':
    case 'aboutPage':
    case 'myRole':
    case 'location':
      return null;
    default:
      return null;
  }
}

type CreatorStudioProfileTabProps = {
  onProfileUpdated?: () => void;
  /** `portfolio` = My Portfolio page chrome (left sections rail + mockup layout). */
  variant?: 'studio' | 'portfolio';
  /** Controlled sections-rail side (Information workspace settings). */
  portfolioNavSide?: 'left' | 'right';
  /** Portfolio layout: shows a Preview action in the profile header. */
  onPortfolioPreview?: () => void;
  /** Limit sidebar sections (e.g. store Information: about / links / contact). */
  allowedSections?: readonly ProfileSectionId[];
  /** Sidebar rail title when using portfolio layout. Default: Portfolio Sections. */
  sectionsNavTitle?: string;
  /** Portfolio card header (avatar, status, edit). Default true. */
  showProfileHero?: boolean;
  /** `top` swaps the sections rail for a horizontal pill row above the card (pages that already have a sidebar). */
  sectionsNavPlacement?: 'rail' | 'top';
  /** Portfolio rail: the page's actions (share, CV, format) — under "Sections", or from xl a column of their own. */
  railActions?: ReactNode;
  /** Portfolio rail: what sits right under the "Sections" box (the Preview pill). */
  railPrimary?: ReactNode;
};

const PORTFOLIO_SECTION_LABELS: Partial<Record<ProfileSectionId, string>> = {
  services: 'Services & Shop',
  products: 'Products',
  aboutUs: 'About us',
  team: 'Team',
  gallery: 'Gallery',
  strengths: 'Stack',
  tools: 'Tools',
};

/** Toast copy for list CRUD: add / delete / update. */
function listCrudToastTitle(
  previousCount: number,
  nextCount: number,
  labels: { added: string; deleted: string; updated: string }
): string {
  if (nextCount > previousCount) return labels.added;
  if (nextCount < previousCount) return labels.deleted;
  return labels.updated;
}

const ABOUT_FIELD_TOAST_TITLES: Record<string, string> = {
  fullName: 'Name updated',
  username: 'Username updated',
  bio: 'Bio updated',
  specialite: 'Specialty updated',
  specialtySet: 'Specialty updated',
  gender: 'Gender updated',
  nationality: 'Nationality updated',
  yearsOfExperience: 'Years of experience updated',
  spokenLanguages: 'Languages updated',
  aboutSkills: 'Skills updated',
  aboutStrengths: 'Strengths updated',
  aboutSystemsTools: 'Systems & tools updated',
  aboutInterests: 'Interests updated',
  aboutEducation: 'Education updated',
  isAvailable: 'Status updated',
  availabilityLabel: 'Availability label updated',
  availabilityHours: 'Availability hours updated',
  typicalResponseTime: 'Response time updated',
};

/**
 * Last profile fetched per user, kept across tab switches so re-entering the tab renders
 * immediately and revalidates in the background instead of flashing the skeleton again.
 */
const profileCache = new Map<string, CreatorProfileDto>();

type ProfileUserFallback = {
  email?: string | null;
  fullName?: string | null;
  username?: string | null;
} | null | undefined;

function buildProfileFormValues(p: CreatorProfileDto, user: ProfileUserFallback): ProfileFormValues {
  const contactAddresses = parseContactEntries(p.contactAddresses, p.contactAddress);
  const contactPhones = parseContactEntries(p.contactPhones, p.contactPhone);
  const contactEmails = parseContactEntries(
    p.contactEmails,
    p.contactEmail?.trim() || user?.email || ''
  );
  const legacy = syncContactLegacyFields({ contactAddresses, contactPhones, contactEmails });
  return {
    fullName: p.fullName?.trim() || user?.fullName?.trim() || '',
    username: p.username?.trim() || user?.username?.trim() || '',
    bio: collapseRepeatedBio(p.bio ?? ''),
    specialite: parseSpecialtyList(p.specialties, p.specialite)[0] ?? p.specialite ?? '',
    specialties: parseSpecialtyList(p.specialties, p.specialite),
    specialtyTags: parseSpecialtyTags(p.specialtyTags),
    gender: normalizeCreatorGender(p.gender) ?? '',
    nationality: normalizeNationalityCode(p.nationality) ?? '',
    appRole: normalizeCreatorAppRole(p.appRole),
    spokenLanguages: parseSpokenLanguages(p.spokenLanguages, p.languages),
    locationCity: p.locationCity ?? '',
    locationCountry: p.locationCountry ?? '',
    locationLat: p.locationLat ?? null,
    locationLng: p.locationLng ?? null,
    timezoneId: p.timezoneId ?? '',
    contactAddresses,
    contactPhones,
    contactEmails,
    contactAddress: legacy.contactAddress,
    contactPhone: legacy.contactPhone,
    contactEmail: legacy.contactEmail || user?.email || '',
    availabilityHours: p.availabilityHours ?? '',
    isAvailable: p.isAvailable ?? true,
    availabilityLabel: p.availabilityLabel ?? '',
    profileLinks: buildProfileLinksFromLegacy(p),
    serviceOffers: parseProfileServices(p.profileServices),
    faqItems: parseFaqItems(p.faqItems),
    teamMembers: parseTeamMembers(p.teamMembers),
    galleryItems: parseGalleryItems(p.galleryItems),
    aboutUs: parseAboutUs(p.aboutUs),
    experienceBlocks: parseExperienceBlocks(p.experienceBlocks),
    yearsOfExperience: p.yearsOfExperience ?? null,
    stackItems: parseStrengthsTools(p.profileStack),
    strengthsTools: parseStrengthsTools(p.strengthsToolsMastered),
    aboutSkills: parseAboutSkills(p.aboutSkills),
    aboutStrengths: parseAboutStringList(p.aboutStrengths),
    aboutSystemsTools: parseAboutStringList(p.aboutSystemsTools),
    aboutInterests: parseAboutStringList(p.aboutInterests),
    aboutEducation: parseAboutEducation(p.aboutEducation),
  };
}

type SessionUser = NonNullable<ReturnType<typeof useAuth>['user']>;

export function CreatorStudioProfileTab(props: CreatorStudioProfileTabProps) {
  const { user } = useAuth();
  if (!user) return null;
  return <CreatorStudioProfileTabContent {...props} user={user} />;
}

function CreatorStudioProfileTabContent({
  user,
  onProfileUpdated,
  variant = 'studio',
  portfolioNavSide: portfolioNavSideProp,
  onPortfolioPreview,
  allowedSections,
  sectionsNavTitle,
  showProfileHero = true,
  sectionsNavPlacement = 'rail',
  railActions,
  railPrimary,
}: CreatorStudioProfileTabProps & { user: SessionUser }) {
  const t = useT();
  const isPortfolioLayout = variant === 'portfolio';
  const sectionsNavTop = isPortfolioLayout && sectionsNavPlacement === 'top';
  const navTitle = sectionsNavTitle ?? (allowedSections?.length ? 'Information' : t('Portfolio Sections'));
  const isStoreInformationNav = sectionsNavTitle === 'Information';
  const sectionLabelOverrides = useMemo((): Partial<Record<ProfileSectionId, string>> => {
    if (!isStoreInformationNav) return PORTFOLIO_SECTION_LABELS;
    return {
      ...PORTFOLIO_SECTION_LABELS,
      links: 'Link',
    };
  }, [isStoreInformationNav]);
  const { updateUser } = useAuth();
  const [initialCachedProfile] = useState(() =>
    user?.id ? profileCache.get(user.id) : undefined
  );
  const [initialFormValues] = useState(() =>
    initialCachedProfile ? buildProfileFormValues(initialCachedProfile, user) : null
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(!initialCachedProfile);
  const [revealAfterSkeleton] = useState(!initialCachedProfile);
  const [saving, setSaving] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [memberSince, setMemberSince] = useState<string | null>(initialCachedProfile?.memberSince ?? null);
  const [responseTimeLabel, setResponseTimeLabel] = useState<string | null>(
    initialCachedProfile?.responseTimeLabel ?? null
  );
  const [typicalResponseTime, setTypicalResponseTime] = useState(
    initialCachedProfile?.typicalResponseTime?.trim() ?? ''
  );
  const [profileUpdatedAt, setProfileUpdatedAt] = useState<string | null>(
    (initialCachedProfile as { updatedAt?: string | null } | undefined)?.updatedAt ?? null
  );
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(
    initialCachedProfile ? initialCachedProfile.avatarUrl ?? user?.avatarUrl ?? null : null
  );
  const [activeSection, setActiveSection] = useState<ProfileSectionId>('about');
  const [portfolioNavSideInternal, setPortfolioNavSideInternal] = useState<'left' | 'right'>('left');
  const searchParams = useSearchParams();
  const portfolioNavSide = portfolioNavSideProp ?? portfolioNavSideInternal;
  /* My Portfolio from xl: three columns — the actions box on the left, the form, the sections rail. */
  const actionsColumn = isPortfolioLayout && !sectionsNavTop && portfolioNavSide === 'right' && railActions != null;
  const [isEditing, setIsEditing] = useState(false);
  /*
   * My Profile (`sectionsNavPlacement="top"`) follows LinkedIn's model: every section is shown as a
   * visitor sees it, and edited on its own in a drawer opened by the section's Edit pill. The drawer
   * starts from the saved profile captured here when it opens, and is unmounted when it closes, so each
   * opening gets a fresh form. My Portfolio keeps its inline studios.
   */
  const sectionDrawers = sectionsNavTop;
  const [sectionDrawer, setSectionDrawer] = useState<{
    section: ProfileDrawerSectionId;
    values: ProfileFormValues;
    visibility: ContactVisibilitySettings;
    typicalResponseTime: string;
  } | null>(null);
  const [portfolioChromeOpen, setPortfolioChromeOpen] = useState(false);
  const [portfolioEditMode, setPortfolioEditMode] = useState<'individual' | 'global'>('individual');
  const [portfolioGlobalHasChanges, setPortfolioGlobalHasChanges] = useState(false);
  const [toolsDeleteMode, setToolsDeleteMode] = useState(false);
  const [toolsAddingItem, setToolsAddingItem] = useState(false);
  const [, setStackDeleteMode] = useState(false);
  const [stackAddingItem, setStackAddingItem] = useState(false);
  const [faqDeleteMode, setFaqDeleteMode] = useState(false);
  const [faqAddingItem, setFaqAddingItem] = useState(false);
  const [servicesDeleteMode, setServicesDeleteMode] = useState(false);
  const [servicesAddingItem, setServicesAddingItem] = useState(false);
  const [portfolioDeleteMode, setPortfolioDeleteMode] = useState(false);
  const [portfolioAddingItem, setPortfolioAddingItem] = useState(false);
  const [portfolioItemCount, setPortfolioItemCount] = useState(0);
  const [productsAddingItem, setProductsAddingItem] = useState(false);
  const [productsItemCount, setProductsItemCount] = useState(0);
  const [teamDeleteMode, setTeamDeleteMode] = useState(false);
  const [teamAddingItem, setTeamAddingItem] = useState(false);
  const [galleryDeleteMode, setGalleryDeleteMode] = useState(false);
  const [galleryAddingItem, setGalleryAddingItem] = useState(false);
  const [linksDeleteMode, setLinksDeleteMode] = useState(false);
  const [linksAddingItem, setLinksAddingItem] = useState(false);
  const [experienceDeleteMode, setExperienceDeleteMode] = useState(false);
  const [contactDeleteMode, setContactDeleteMode] = useState(false);
  const [contactAddingKind, setContactAddingKind] = useState<PortfolioContactKind | null>(null);
  const portfolioGlobalConfirmRef = useRef<(() => Promise<void>) | null>(null);
  const portfolioInfoCardRef = useRef<HTMLDivElement>(null);
  const [availabilitySchedule, setAvailabilitySchedule] = useState<AvailabilitySchedule>(() =>
    initialCachedProfile ? parseAvailabilityHours(initialCachedProfile.availabilityHours) : defaultSchedule()
  );
  const [contactVisibility, setContactVisibility] = useState<ContactVisibilitySettings>(() =>
    initialCachedProfile
      ? parseContactVisibility(initialCachedProfile.contactVisibility)
      : DEFAULT_CONTACT_VISIBILITY
  );
  const savedSnapshot = useRef<ProfileFormValues | null>(initialFormValues);
  const savedContactVisibility = useRef<ContactVisibilitySettings>(contactVisibility);

  useEffect(() => {
    if (!isPortfolioLayout || typeof window === 'undefined') return;
    try {
      setShowAllSections(window.localStorage.getItem(SHOW_ALL_SECTIONS_KEY) === '1');
      if (portfolioNavSideProp == null) {
        setPortfolioNavSideInternal(
          window.localStorage.getItem('portfolio-sections-nav-side') === 'right' ? 'right' : 'left'
        );
      }
    } catch {
      /* ignore */
    }
  }, [isPortfolioLayout, portfolioNavSideProp]);

  useEffect(() => {
    if (
      !toolsDeleteMode &&
      !faqDeleteMode &&
      !servicesDeleteMode &&
      !portfolioDeleteMode &&
      !teamDeleteMode &&
      !galleryDeleteMode &&
      !experienceDeleteMode &&
      !contactDeleteMode &&
      !linksDeleteMode
    ) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (portfolioInfoCardRef.current?.contains(target)) return;
      setToolsDeleteMode(false);
      setFaqDeleteMode(false);
      setServicesDeleteMode(false);
      setPortfolioDeleteMode(false);
      setTeamDeleteMode(false);
      setGalleryDeleteMode(false);
      setExperienceDeleteMode(false);
      setContactDeleteMode(false);
      setLinksDeleteMode(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [
    toolsDeleteMode,
    faqDeleteMode,
    servicesDeleteMode,
    portfolioDeleteMode,
    teamDeleteMode,
    galleryDeleteMode,
    experienceDeleteMode,
    contactDeleteMode,
    linksDeleteMode,
  ]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: initialFormValues ?? {
      fullName: '',
      username: '',
      bio: '',
      specialite: '',
      specialties: [],
      specialtyTags: [],
      gender: '',
      nationality: '',
      appRole: DEFAULT_CREATOR_APP_ROLE,
      spokenLanguages: [],
      locationCity: '',
      locationCountry: '',
      locationLat: null,
      locationLng: null,
      timezoneId: '',
      contactAddress: '',
      contactPhone: '',
      contactEmail: '',
      contactAddresses: [],
      contactPhones: [],
      contactEmails: [],
      availabilityHours: '',
      isAvailable: true,
      availabilityLabel: '',
      profileLinks: [],
      serviceOffers: [],
      faqItems: [],
      teamMembers: [],
      galleryItems: [],
      aboutUs: emptyAboutUsForm(),
      experienceBlocks: [],
      yearsOfExperience: null,
      stackItems: [],
      strengthsTools: [],
      aboutSkills: [],
      aboutStrengths: [],
      aboutSystemsTools: [],
      aboutInterests: [],
      aboutEducation: [],
    },
  });

  const watchedAppRole = form.watch('appRole');
  const effectiveAllowedSections = useMemo(() => {
    if (!allowedSections?.length) return allowedSections;
    if (!isStoreInformationNav) return allowedSections;
    return filterStoreInformationSectionsForRole(watchedAppRole, allowedSections);
  }, [allowedSections, isStoreInformationNav, watchedAppRole]);
  const sectionGroups = useMemo(() => {
    const groups = filterProfileSectionGroups(PROFILE_SECTION_GROUPS, effectiveAllowedSections);
    if (isPortfolioLayout) return groups;
    return groups
      .map((group) => group.filter((id) => id !== 'aboutUs'))
      .filter((group) => group.length > 0);
  }, [effectiveAllowedSections, isPortfolioLayout]);
  const allowedSectionIds = useMemo(() => sectionGroups.flat(), [sectionGroups]);
  /*
   * My Portfolio's rail lists the open format's sections; its grid toggle shows every section there is
   * (About us, My Role, Services, Products, Team…). The format only filters the menu — those sections
   * exist whatever the format, and the live page shows whatever holds content — so they stay editable.
   * The choice is remembered in this browser.
   */
  const [showAllSections, setShowAllSections] = useState(false);
  const canShowAllSections = isPortfolioLayout && !sectionsNavTop;
  const navigableSectionIds = useMemo(
    () => (canShowAllSections && showAllSections ? ALL_PORTFOLIO_RAIL_SECTION_IDS : allowedSectionIds),
    [allowedSectionIds, canShowAllSections, showAllSections]
  );
  const toggleShowAllSections = useCallback(() => {
    setShowAllSections((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SHOW_ALL_SECTIONS_KEY, next ? '1' : '0');
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  /*
   * My Profile shows every section on one page (ProfileSectionsOverview) when all of them are read
   * views with a drawer — the usual case. Should a role ever add an inline section, it falls back to
   * one section at a time behind the tab row.
   */
  const overviewSections = useMemo(
    () =>
      sectionsNavTop && allowedSectionIds.every(isProfileDrawerSection)
        ? allowedSectionIds.filter(isProfileDrawerSection).map((id) => ({
            id,
            label: sectionLabelOverrides[id] ?? t(getProfileSection(id).label),
          }))
        : null,
    [allowedSectionIds, sectionLabelOverrides, sectionsNavTop]
  );
  const showProviderAboutFields = creatorShowsProviderAboutFields(watchedAppRole);

  useEffect(() => {
    if (navigableSectionIds.length === 0) return;
    if (!navigableSectionIds.includes(activeSection)) {
      setActiveSection(navigableSectionIds[0]);
    }
  }, [activeSection, navigableSectionIds]);

  useEffect(() => {
    const section = searchParams.get('section');
    if (!section) return;
    if ((navigableSectionIds as string[]).includes(section)) {
      setActiveSection(section as ProfileSectionId);
    }
  }, [searchParams, navigableSectionIds]);

  const {
    fields: linkFields,
    append: appendLink,
    remove: removeLink,
    move: moveLink,
  } = useFieldArray({ control: form.control, name: 'profileLinks' });
  const {
    fields: serviceFields,
    append: appendService,
    remove: removeService,
    move: moveService,
  } = useFieldArray({ control: form.control, name: 'serviceOffers' });
  const {
    fields: faqFields,
    append: appendFaq,
    remove: removeFaq,
    move: moveFaq,
  } = useFieldArray({ control: form.control, name: 'faqItems' });
  const {
    fields: teamFields,
    append: appendTeam,
    remove: removeTeam,
    move: moveTeam,
  } = useFieldArray({ control: form.control, name: 'teamMembers' });
  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
    move: moveGallery,
  } = useFieldArray({ control: form.control, name: 'galleryItems' });
  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
    move: moveExperience,
  } = useFieldArray({ control: form.control, name: 'experienceBlocks' });
  const {
    remove: removeContactAddress,
  } = useFieldArray({ control: form.control, name: 'contactAddresses' });
  const {
    remove: removeContactPhone,
  } = useFieldArray({ control: form.control, name: 'contactPhones' });
  const {
    remove: removeContactEmail,
  } = useFieldArray({ control: form.control, name: 'contactEmails' });
  const {
    fields: aboutEducationFields,
    append: appendAboutEducation,
    remove: removeAboutEducation,
    move: moveAboutEducation,
  } = useFieldArray({ control: form.control, name: 'aboutEducation' });
  const {
    fields: aboutSkillsFields,
    append: appendAboutSkill,
    remove: removeAboutSkill,
    move: moveAboutSkill,
  } = useFieldArray({ control: form.control, name: 'aboutSkills' });

  const exitFaqChrome = useCallback(() => {
    const current = form.getValues('faqItems');
    const filled = current
      .map((item) => ({
        question: (item.question ?? '').trim(),
        answer: (item.answer ?? '').trim(),
      }))
      .filter((item) => item.question.length > 0 && item.answer.length > 0);
    if (filled.length !== current.length) {
      form.setValue(
        'faqItems',
        filled.map((item, index) => ({
          ...createEmptyFaqItem(index),
          question: item.question,
          answer: item.answer,
        })),
        { shouldDirty: false }
      );
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setFaqDeleteMode(false);
    setFaqAddingItem(false);
  }, [form]);

  const cancelFaqCompose = useCallback(() => {
    const current = form.getValues('faqItems');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const item = current[lastIndex];
      const empty =
        !(item.question ?? '').trim() && !(item.answer ?? '').trim();
      if (empty) removeFaq(lastIndex);
    }
    setFaqAddingItem(false);
  }, [form, removeFaq]);

  const exitContactChrome = useCallback(() => {
    const addresses = serializeContactEntries(form.getValues('contactAddresses'), 'address').map(
      (entry, index) => ({ ...createEmptyContactEntry(index), value: entry.value, id: entry.id })
    );
    const phones = serializeContactEntries(form.getValues('contactPhones'), 'phone').map(
      (entry, index) => ({ ...createEmptyContactEntry(index), value: entry.value, id: entry.id })
    );
    const emails = serializeContactEntries(form.getValues('contactEmails'), 'email').map(
      (entry, index) => ({ ...createEmptyContactEntry(index), value: entry.value, id: entry.id })
    );
    form.setValue('contactAddresses', addresses, { shouldDirty: false });
    form.setValue('contactPhones', phones, { shouldDirty: false });
    form.setValue('contactEmails', emails, { shouldDirty: false });
    const legacy = syncContactLegacyFields({
      contactAddresses: addresses,
      contactPhones: phones,
      contactEmails: emails,
    });
    form.setValue('contactAddress', legacy.contactAddress, { shouldDirty: false });
    form.setValue('contactPhone', legacy.contactPhone, { shouldDirty: false });
    form.setValue('contactEmail', legacy.contactEmail, { shouldDirty: false });

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setContactDeleteMode(false);
    setContactAddingKind(null);
  }, [form]);

  const cancelContactCompose = useCallback(() => {
    const kind = contactAddingKind;
    if (kind === 'address') {
      const current = form.getValues('contactAddresses');
      const lastIndex = current.length - 1;
      if (lastIndex >= 0 && !(current[lastIndex].value ?? '').trim()) {
        removeContactAddress(lastIndex);
      }
    } else if (kind === 'phone') {
      const current = form.getValues('contactPhones');
      const lastIndex = current.length - 1;
      if (lastIndex >= 0 && !formatPhoneDisplay(current[lastIndex].value) && !(current[lastIndex].value ?? '').trim()) {
        removeContactPhone(lastIndex);
      }
    } else if (kind === 'email') {
      const current = form.getValues('contactEmails');
      const lastIndex = current.length - 1;
      if (lastIndex >= 0 && !(current[lastIndex].value ?? '').trim()) {
        removeContactEmail(lastIndex);
      }
    }
    setContactAddingKind(null);
  }, [
    contactAddingKind,
    form,
    removeContactAddress,
    removeContactEmail,
    removeContactPhone,
  ]);

  const cancelStackCompose = useCallback(() => {
    const current = form.getValues('stackItems');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const item = current[lastIndex];
      const empty = !(item.value ?? '').trim();
      if (empty) {
        form.setValue(
          'stackItems',
          current.filter((_, index) => index !== lastIndex),
          { shouldDirty: false }
        );
      }
    }
    setStackAddingItem(false);
  }, [form]);

  const cancelToolsCompose = useCallback(() => {
    const current = form.getValues('strengthsTools');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const item = current[lastIndex];
      const empty = !(item.value ?? '').trim();
      if (empty) {
        form.setValue(
          'strengthsTools',
          current.filter((_, index) => index !== lastIndex),
          { shouldDirty: false }
        );
      }
    }
    setToolsAddingItem(false);
  }, [form]);

  const exitStackChrome = useCallback(() => {
    const current = form.getValues('stackItems');
    const filled = current
      .map((item) => ({
        value: item.value ?? '',
        description: item.description ?? '',
        category: item.category ?? '',
        level: item.level ?? null,
        useCases: item.useCases ?? [],
        experienceYears: item.experienceYears ?? null,
        experienceLabel: item.experienceLabel ?? '',
        currentlyUsed: item.currentlyUsed ?? null,
        iconUrl: item.iconUrl ?? null,
      }))
      .filter((item) => item.value.trim().length > 0);
    if (filled.length !== current.length) {
      form.setValue('stackItems', filled, { shouldDirty: false });
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setStackDeleteMode(false);
    setStackAddingItem(false);
  }, [form]);

  const exitToolsChrome = useCallback(() => {
    const current = form.getValues('strengthsTools');
    const filled = current
      .map((item) => ({
        value: item.value ?? '',
        description: item.description ?? '',
        category: item.category ?? '',
        level: item.level ?? null,
        useCases: item.useCases ?? [],
        experienceYears: item.experienceYears ?? null,
        experienceLabel: item.experienceLabel ?? '',
        currentlyUsed: item.currentlyUsed ?? null,
        iconUrl: item.iconUrl ?? null,
      }))
      .filter((item) => item.value.trim().length > 0);
    if (filled.length !== current.length) {
      form.setValue('strengthsTools', filled, { shouldDirty: false });
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setToolsDeleteMode(false);
    setToolsAddingItem(false);
  }, [form]);

  const cancelServicesCompose = useCallback(() => {
    const current = form.getValues('serviceOffers');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const service = current[lastIndex];
      const empty =
        !(service.title ?? '').trim() &&
        !(service.description ?? '').trim() &&
        !(service.deadline ?? '').trim() &&
        service.basePriceCents == null &&
        !(service.tasks ?? []).some((task) => (task.value ?? '').trim());
      if (empty) removeService(lastIndex);
    }
    setServicesAddingItem(false);
  }, [form, removeService]);

  const exitServicesChrome = useCallback(() => {
    const current = form.getValues('serviceOffers');
    const filled = current
      .filter((service) => (service.title ?? '').trim().length > 0)
      .map((service) => ({
        title: service.title ?? '',
        description: service.description ?? '',
        basePriceCents: service.basePriceCents ?? null,
        deadline: service.deadline ?? '',
        tasks: service.tasks ?? [],
      }));
    if (filled.length !== current.length) {
      form.setValue(
        'serviceOffers',
        filled.map((service, index) => ({
          ...createEmptyProfileService(index),
          ...service,
        })),
        { shouldDirty: false }
      );
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setServicesDeleteMode(false);
    setServicesAddingItem(false);
  }, [form]);

  const exitPortfolioChrome = useCallback(() => {
    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setPortfolioDeleteMode(false);
    setPortfolioAddingItem(false);
  }, []);

  const cancelPortfolioCompose = useCallback(() => {
    setPortfolioAddingItem(false);
  }, []);

  const exitProductsChrome = useCallback(() => {
    setProductsAddingItem(false);
  }, []);

  const cancelProductsCompose = useCallback(() => {
    setProductsAddingItem(false);
  }, []);

  const cancelTeamCompose = useCallback(() => {
    const current = form.getValues('teamMembers');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const member = current[lastIndex];
      const empty =
        !(member.name ?? '').trim() &&
        !(member.responsibility ?? '').trim() &&
        !(member.imageUrl ?? '').trim() &&
        !(member.socialLinks ?? []).some((link) => (link.url ?? '').trim());
      if (empty) removeTeam(lastIndex);
    }
    setTeamAddingItem(false);
  }, [form, removeTeam]);

  const exitTeamChrome = useCallback(() => {
    const current = form.getValues('teamMembers');
    const filled = current
      .filter(
        (member) =>
          (member.name ?? '').trim().length > 0 &&
          (member.responsibility ?? '').trim().length > 0
      )
      .map((member) => ({
        name: member.name ?? '',
        responsibility: member.responsibility ?? '',
        imageUrl: member.imageUrl ?? '',
        socialLinks: (member.socialLinks ?? []).map((link) => ({
          id: link.id,
          platform: link.platform,
          label: link.label ?? '',
          url: link.url ?? '',
          sortOrder: link.sortOrder,
        })),
      }));
    if (filled.length !== current.length) {
      form.setValue(
        'teamMembers',
        filled.map((member, index) => ({
          ...createEmptyTeamMember(index),
          ...member,
          socialLinks: member.socialLinks.map((link, linkIndex) => ({
            ...link,
            sortOrder: linkIndex,
          })),
        })),
        { shouldDirty: false }
      );
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setTeamDeleteMode(false);
    setTeamAddingItem(false);
  }, [form]);

  const cancelGalleryCompose = useCallback(() => {
    const current = form.getValues('galleryItems');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const item = current[lastIndex];
      const empty = !(item.mediaUrl ?? '').trim();
      if (empty) removeGallery(lastIndex);
    }
    setGalleryAddingItem(false);
  }, [form, removeGallery]);

  const exitGalleryChrome = useCallback(() => {
    const current = form.getValues('galleryItems');
    const filled = current
      .map((item) => ({
        title: item.title ?? '',
        mediaUrl: item.mediaUrl ?? '',
        mediaType: item.mediaType ?? null,
      }))
      .filter((item) => item.mediaUrl.trim().length > 0);
    if (filled.length !== current.length) {
      form.setValue(
        'galleryItems',
        filled.map((item, index) => ({
          ...createEmptyGalleryItem(index),
          title: item.title,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
        })),
        { shouldDirty: false }
      );
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setGalleryDeleteMode(false);
    setGalleryAddingItem(false);
  }, [form]);

  const cancelLinksCompose = useCallback(() => {
    const current = form.getValues('profileLinks');
    const lastIndex = current.length - 1;
    if (lastIndex >= 0) {
      const item = current[lastIndex];
      const empty = !(item.url ?? '').trim();
      if (empty) removeLink(lastIndex);
    }
    setLinksAddingItem(false);
  }, [form, removeLink]);

  const exitLinksChrome = useCallback(() => {
    const current = form.getValues('profileLinks');
    const filled = current
      .map((link) => ({
        id: link.id,
        type: link.type || 'CUSTOM',
        label: link.label ?? '',
        url: link.url ?? '',
        platform: link.platform ?? null,
      }))
      .filter((link) => link.url.trim().length > 0)
      .map((link) => ({
        ...link,
        label: link.label.trim() || deriveProfileLinkLabel(link.url),
      }));
    if (filled.length !== current.length) {
      form.setValue(
        'profileLinks',
        filled.map((link, index) => ({
          ...createEmptyProfileLink(index),
          id: link.id,
          type: link.type,
          label: link.label,
          url: link.url,
          platform: link.platform,
        })),
        { shouldDirty: false }
      );
    }

    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setLinksDeleteMode(false);
    setLinksAddingItem(false);
  }, [form]);

  // FAQ / Services / Portfolio / Team / Gallery / Links / Skills: click outside exits edit mode.
  useEffect(() => {
    if (!isPortfolioLayout || !portfolioChromeOpen) return;
    if (
      activeSection !== 'faq' &&
      activeSection !== 'services' &&
      activeSection !== 'portfolio' &&
      activeSection !== 'products' &&
      activeSection !== 'team' &&
      activeSection !== 'gallery' &&
      activeSection !== 'links' &&
      activeSection !== 'strengths' &&
      activeSection !== 'tools' &&
      activeSection !== 'contact'
    ) {
      return;
    }
    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (portfolioInfoCardRef.current?.contains(target)) return;
      if (activeSection === 'faq') exitFaqChrome();
      else if (activeSection === 'services') exitServicesChrome();
      else if (activeSection === 'portfolio') exitPortfolioChrome();
      else if (activeSection === 'products') exitProductsChrome();
      else if (activeSection === 'strengths') exitStackChrome();
      else if (activeSection === 'tools') exitToolsChrome();
      else if (activeSection === 'gallery') exitGalleryChrome();
      else if (activeSection === 'links') exitLinksChrome();
      else if (activeSection === 'contact') exitContactChrome();
      else exitTeamChrome();
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [
    activeSection,
    exitContactChrome,
    exitFaqChrome,
    exitGalleryChrome,
    exitLinksChrome,
    exitPortfolioChrome,
    exitProductsChrome,
    exitServicesChrome,
    exitStackChrome,
    exitToolsChrome,
    exitTeamChrome,
    isPortfolioLayout,
    portfolioChromeOpen,
  ]);

  // Team / FAQ / Services / Portfolio / Gallery / Links / Skills add compose: click outside cancels.
  useEffect(() => {
    if (!isPortfolioLayout || portfolioChromeOpen) return;
    if (activeSection === 'team' && teamAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelTeamCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'faq' && faqAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelFaqCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'services' && servicesAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelServicesCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'portfolio' && portfolioAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelPortfolioCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'products' && productsAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelProductsCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'gallery' && galleryAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelGalleryCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'links' && linksAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelLinksCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'tools' && toolsAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelToolsCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'strengths' && stackAddingItem) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelStackCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    if (activeSection === 'contact' && contactAddingKind) {
      const onPointerDown = (event: MouseEvent) => {
        const target = event.target as Node | null;
        if (!target) return;
        if (portfolioInfoCardRef.current?.contains(target)) return;
        cancelContactCompose();
      };
      document.addEventListener('mousedown', onPointerDown);
      return () => document.removeEventListener('mousedown', onPointerDown);
    }
    return undefined;
  }, [
    activeSection,
    cancelContactCompose,
    cancelFaqCompose,
    cancelGalleryCompose,
    cancelLinksCompose,
    cancelPortfolioCompose,
    cancelProductsCompose,
    cancelServicesCompose,
    cancelStackCompose,
    cancelToolsCompose,
    cancelTeamCompose,
    contactAddingKind,
    faqAddingItem,
    galleryAddingItem,
    isPortfolioLayout,
    linksAddingItem,
    portfolioAddingItem,
    productsAddingItem,
    portfolioChromeOpen,
    servicesAddingItem,
    toolsAddingItem,
    stackAddingItem,
    teamAddingItem,
  ]);

  const applyProfile = useCallback((p: CreatorProfileDto) => {
      setMemberSince(p.memberSince ?? null);
      setResponseTimeLabel(p.responseTimeLabel ?? null);
      setTypicalResponseTime(p.typicalResponseTime?.trim() ?? '');
      setProfileUpdatedAt((p as { updatedAt?: string | null }).updatedAt ?? null);
      setProfileAvatarUrl(p.avatarUrl ?? user?.avatarUrl ?? null);

      const resetValues = buildProfileFormValues(p, {
        email: user?.email,
        fullName: user?.fullName,
        username: user?.username,
      });
      form.reset(resetValues);
      savedSnapshot.current = resetValues;
      const visibility = parseContactVisibility(p.contactVisibility);
      setContactVisibility(visibility);
      savedContactVisibility.current = visibility;
      setAvailabilitySchedule(parseAvailabilityHours(p.availabilityHours));
      setIsEditing(false);
  }, [form, user?.avatarUrl, user?.email, user?.fullName, user?.username]);

  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  const loadProfile = useCallback(
    async (options?: { silent?: boolean; revalidate?: boolean }) => {
      try {
        if (!options?.silent) {
          setLoadingProfile(true);
        }
        setLoadError(null);
        const res = await api.get<CreatorProfileDto>('/api/creator/profile');
        if (user?.id) profileCache.set(user.id, res.data);
        // A background revalidation must never discard edits the user has started meanwhile.
        if (options?.revalidate && isEditingRef.current) return;
        applyProfile(res.data);
      } catch (e) {
        if (!options?.revalidate) {
          setLoadError(getApiErrorMessage(e, t('Unable to load profile.')));
        }
      } finally {
        if (!options?.silent) {
          setLoadingProfile(false);
        }
      }
    },
    [applyProfile, user?.id, t]
  );

  useEffect(() => {
    if (initialCachedProfile) {
      void loadProfile({ silent: true, revalidate: true });
      return;
    }
    void loadProfile();
  }, [initialCachedProfile, loadProfile]);

  const enableLocation = async () => {
    setLocationError(null);
    setDetectingLocation(true);
    try {
      const detected = await requestDetectedLocation();
      form.setValue('locationLat', detected.lat, { shouldValidate: true });
      form.setValue('locationLng', detected.lng, { shouldValidate: true });
      form.setValue('timezoneId', detected.timezoneId, { shouldValidate: true });
      form.setValue('locationCity', detected.city, { shouldValidate: true });
      form.setValue('locationCountry', detected.country, { shouldValidate: true });
    } catch (e) {
      setLocationError(getApiErrorMessage(e, t('Unable to detect your location.')));
    } finally {
      setDetectingLocation(false);
    }
  };

  const onSubmit = async (raw: ProfileFormValues) => {
    setSubmitError(null);
    const availabilityHoursForSave = formatAvailabilityHours(availabilitySchedule, raw.timezoneId);
    const saved = savedSnapshot.current;

    if (
      saved &&
      !hasProfileFormChanges(
        raw,
        saved,
        availabilityHoursForSave,
        saved.availabilityHours ?? '',
        contactVisibility,
        savedContactVisibility.current
      )
    ) {
      setIsEditing(false);
      pushFlashFeedback({
        variant: 'info',
        title: t('No changes to save'),
        description: t('Update a field before saving your information.'),
      });
      return;
    }

    setSaving(true);
    try {
      const merged = {
        ...raw,
        availabilityHours: availabilityHoursForSave,
        spokenLanguages: raw.spokenLanguages.filter((item) => item.value.trim().length > 0),
        experienceBlocks: raw.experienceBlocks.filter((block) => block.text.trim().length > 0),
        stackItems: raw.stackItems.filter((item) => item.value.trim().length > 0),
        strengthsTools: raw.strengthsTools.filter((item) => item.value.trim().length > 0),
        aboutSkills: raw.aboutSkills.filter((item) => item.title.trim().length > 0),
        aboutStrengths: raw.aboutStrengths.filter((item) => item.value.trim().length > 0),
        aboutSystemsTools: raw.aboutSystemsTools.filter((item) => item.value.trim().length > 0),
        aboutInterests: raw.aboutInterests.filter((item) => item.value.trim().length > 0),
        aboutEducation: raw.aboutEducation.filter(
          (item) =>
            item.schoolYear.trim().length > 0 ||
            item.title.trim().length > 0 ||
            item.institution.trim().length > 0
        ),
        profileLinks: raw.profileLinks.filter((link) => link.url.trim().length > 0),
        serviceOffers: raw.serviceOffers.filter(
          (service) =>
            service.title.trim().length > 0 ||
            Boolean(service.description?.trim()) ||
            Boolean(service.deadline?.trim()) ||
            service.basePriceCents != null ||
            (service.tasks?.some((item) => item.value.trim()) ?? false)
        ),
        faqItems: raw.faqItems.filter(
          (item) => item.question.trim().length > 0 || item.answer.trim().length > 0
        ),
        teamMembers: raw.teamMembers.filter(
          (member) =>
            member.name.trim().length > 0 ||
            member.responsibility.trim().length > 0 ||
            Boolean(member.imageUrl?.trim()) ||
            (member.socialLinks?.some((link) => link.url.trim() || link.label?.trim()) ?? false)
        ),
        galleryItems: raw.galleryItems.filter((item) => item.mediaUrl.trim().length > 0),
        ...(() => {
          const contactAddresses = raw.contactAddresses.filter((entry) => entry.value.trim().length > 0);
          const contactPhones = raw.contactPhones.filter((entry) => entry.value.trim().length > 0);
          const contactEmails = raw.contactEmails.filter((entry) => entry.value.trim().length > 0);
          const legacy = syncContactLegacyFields({
            contactAddresses,
            contactPhones,
            contactEmails,
            contactAddress: raw.contactAddress,
            contactPhone: raw.contactPhone,
            contactEmail: raw.contactEmail,
          });
          return {
            contactAddresses,
            contactPhones,
            contactEmails,
            ...legacy,
          };
        })(),
      };
      const parsed = profileSchema.parse(merged);
      const trimmedName = parsed.fullName.trim();
      const savedName = saved?.fullName?.trim() ?? '';
      const trimmedUsername = parsed.username.trim();
      const savedUsername = saved?.username?.trim() ?? '';
      if (trimmedName !== savedName || trimmedUsername !== savedUsername) {
        const updated = await updateUserProfile({
          ...(trimmedName !== savedName ? { fullName: trimmedName } : {}),
          ...(trimmedUsername !== savedUsername ? { username: trimmedUsername } : {}),
        });
        updateUser({
          fullName: updated.fullName,
          username: updated.username,
          avatarUrl: updated.avatarUrl,
        });
      }

      const hasCompleteLocation =
        parsed.locationLat != null &&
        parsed.locationLng != null &&
        Boolean(parsed.timezoneId?.trim());

      await updateCreatorProfile({
        bio: parsed.bio?.trim() ? parsed.bio.trim() : undefined,
        specialite: parseSpecialtyList(parsed.specialties, parsed.specialite)[0] ?? '',
        specialties: parseSpecialtyList(parsed.specialties, parsed.specialite),
        specialtyTags: parseSpecialtyTags(parsed.specialtyTags),
        gender: parsed.gender?.trim() ? parsed.gender.trim() : undefined,
        nationality: parsed.nationality?.trim() ? parsed.nationality.trim().toUpperCase() : '',
        appRole: parsed.appRole ?? DEFAULT_CREATOR_APP_ROLE,
        spokenLanguages: serializeSpokenLanguagesForApi(parsed.spokenLanguages),
        ...(hasCompleteLocation
          ? {
              locationCity: parsed.locationCity?.trim() ? parsed.locationCity.trim() : undefined,
              locationCountry: parsed.locationCountry?.trim()
                ? parsed.locationCountry.trim()
                : undefined,
              locationLat: parsed.locationLat ?? undefined,
              locationLng: parsed.locationLng ?? undefined,
              timezoneId: parsed.timezoneId?.trim() ? parsed.timezoneId.trim() : undefined,
            }
          : {}),
        contactAddress: parsed.contactAddress?.trim() ? parsed.contactAddress.trim() : undefined,
        contactPhone: (() => {
          const stored = toStoredPhoneNumber(parsed.contactPhone);
          return stored || undefined;
        })(),
        contactEmail: parsed.contactEmail?.trim() ? parsed.contactEmail.trim() : undefined,
        contactAddresses: serializeContactEntries(parsed.contactAddresses, 'address'),
        contactPhones: serializeContactEntries(parsed.contactPhones, 'phone'),
        contactEmails: serializeContactEntries(parsed.contactEmails, 'email'),
        availabilityHours: parsed.availabilityHours?.trim()
          ? parsed.availabilityHours.trim()
          : undefined,
        isAvailable: parsed.isAvailable,
        availabilityLabel: parsed.availabilityLabel?.trim() ?? '',
        contactVisibility: JSON.stringify(contactVisibility),
        profileLinks: serializeProfileLinks(parsed.profileLinks),
        profileServices: serializeProfileServices(
          parsed.serviceOffers,
          parsed.specialties?.[0] ?? '',
          parsed.specialties
        ),
        faqItems: serializeFaqItems(parsed.faqItems),
        teamMembers: serializeTeamMembers(parsed.teamMembers),
        galleryItems: serializeGalleryItems(parsed.galleryItems),
        aboutUs: serializeAboutUs(parsed.aboutUs),
        experienceBlocks: serializeProfileBlocks(parsed.experienceBlocks),
        yearsOfExperience: parsed.yearsOfExperience,
        profileStack: parsed.stackItems.map((item) => ({
          name: item.value.trim(),
          description: item.description?.trim() ? item.description.trim() : null,
          category: item.category?.trim() ? item.category.trim().slice(0, 80) : null,
          level: item.level ?? null,
          useCases: [],
          experienceYears: null,
          experienceLabel: null,
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        })),
        strengthsToolsMastered: parsed.strengthsTools.map((item) => ({
          name: item.value.trim(),
          description: item.description?.trim() ? item.description.trim() : null,
          category: null,
          level: item.level ?? null,
          useCases: (item.useCases ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 8),
          experienceYears: null,
          experienceLabel: null,
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        })),
        aboutSkills: serializeAboutSkills(parsed.aboutSkills),
        aboutStrengths: serializeAboutStringList(parsed.aboutStrengths),
        aboutSystemsTools: serializeAboutStringList(parsed.aboutSystemsTools),
        aboutInterests: serializeAboutStringList(parsed.aboutInterests),
        aboutEducation: serializeAboutEducation(parsed.aboutEducation),
      });

      await loadProfile({ silent: true });
      onProfileUpdated?.();
      setIsEditing(false);
      const sectionLabel = t(getProfileSection(activeSection).label ?? 'Information');
      pushFlashFeedback({
        variant: 'success',
        title: `${sectionLabel} saved`,
      });
    } catch (e) {
      setSectionSaveError(e, form, setSubmitError, t('Save failed.'));
    } finally {
      setSaving(false);
    }
  };

  const onInvalidSubmit = (errors: Record<string, unknown>) => {
    const first = firstProfileErrorMessage(errors);
    if (!first) {
      return;
    }
    const section = profileErrorPathToSection(first.path);
    setActiveSection(section);
    // Keep errors on the invalid fields — do not show a section-level banner.
  };

  const values = form.watch();
  const locationCity = values.locationCity;
  const locationCountry = values.locationCountry;
  const timezoneId = values.timezoneId;
  const hasLocation = Boolean(values.locationLat != null && values.locationLng != null && timezoneId);
  const currentSection = getProfileSection(activeSection);
  const isFormSection = activeSection !== 'myRole';
  const availabilityHoursForCompare = formatAvailabilityHours(availabilitySchedule, timezoneId);
  const hasUnsavedChanges =
    savedSnapshot.current != null &&
    hasProfileFormChanges(
      values,
      savedSnapshot.current,
      availabilityHoursForCompare,
      savedSnapshot.current.availabilityHours ?? '',
      contactVisibility,
      savedContactVisibility.current
    );

  const isPortfolioChromeSection = (PORTFOLIO_CHROME_SECTIONS as readonly string[]).includes(
    activeSection
  );

  const handleSectionChange = (sectionId: ProfileSectionId) => {
    if (isEditing && savedSnapshot.current) {
      form.reset(savedSnapshot.current);
      setAvailabilitySchedule(parseAvailabilityHours(savedSnapshot.current.availabilityHours));
      setContactVisibility(savedContactVisibility.current);
      setSubmitError(null);
    }
    setIsEditing(false);
    setPortfolioChromeOpen(false);
    setPortfolioEditMode('individual');
    setPortfolioGlobalHasChanges(false);
    portfolioGlobalConfirmRef.current = null;
    setToolsDeleteMode(false);
    setToolsAddingItem(false);
    setFaqDeleteMode(false);
    setFaqAddingItem(false);
    setServicesDeleteMode(false);
    setServicesAddingItem(false);
    setPortfolioDeleteMode(false);
    setPortfolioAddingItem(false);
    setProductsAddingItem(false);
    setTeamDeleteMode(false);
    setTeamAddingItem(false);
    setGalleryDeleteMode(false);
    setGalleryAddingItem(false);
    setLinksDeleteMode(false);
    setLinksAddingItem(false);
    setExperienceDeleteMode(false);
    setContactDeleteMode(false);
    setContactAddingKind(null);
    setActiveSection(sectionId === 'location' ? 'about' : sectionId);
  };

  useEffect(() => {
    if (activeSection === 'location') {
      setActiveSection('about');
    }
  }, [activeSection]);

  const cancelEdit = () => {
    if (savedSnapshot.current) {
      form.reset(savedSnapshot.current);
      setAvailabilitySchedule(parseAvailabilityHours(savedSnapshot.current.availabilityHours));
      setContactVisibility(savedContactVisibility.current);
    }
    setSubmitError(null);
    setIsEditing(false);
  };

  /*
   * My Profile's section navigation (`sectionsNavPlacement="top"`): one row of plain text tabs at the
   * top left, at every width — the open one in bold ink over a 2px ink bar, the navbar's own idiom,
   * no pills. Never a second vertical menu: the Manage rail on the right is the page's only one.
   */
  const renderSectionPills = () => (
    <nav
      aria-label={`${navTitle} sections`}
      className="order-first -mx-4 flex gap-6 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
    >
      {sectionGroups.flat().map((sectionId) => {
        const section = getProfileSection(sectionId);
        const active = activeSection === section.id;
        const label = sectionLabelOverrides[section.id] ?? t(section.label);
        return (
          <button
            key={section.id}
            type="button"
            onClick={() => handleSectionChange(section.id)}
            aria-current={active ? 'true' : undefined}
            className={`relative inline-flex h-10 shrink-0 items-center whitespace-nowrap text-[15px] leading-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'font-bold text-[color:var(--gn-ink)]'
                : 'font-medium text-[color:var(--gn-ink2)] hover:text-[color:var(--gn-ink)]'
            }`}
          >
            {label}
            {active ? (
              <span aria-hidden className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-[color:var(--gn-ink)]" />
            ) : null}
          </button>
        );
      })}
    </nav>
  );

  /** Portfolio on phones: the sections rail becomes a swipeable tab strip under the profile header. */
  /* Whether a section has anything in it, read from the form — null where the count lives in another
     studio (Portfolio works, Products: known once opened) or there is nothing to fill (My Role), so the
     rail never calls a section empty without knowing. */
  const sectionFilled = (id: ProfileSectionId): boolean | null => {
    switch (id) {
      case 'about':
        return Boolean(values.fullName?.trim() && values.bio?.trim());
      case 'aboutPage':
        return hasFilledContent([
          values.specialties,
          values.spokenLanguages,
          values.aboutSkills,
          values.aboutStrengths,
          values.aboutSystemsTools,
          values.aboutInterests,
          values.aboutEducation,
        ]);
      case 'aboutUs':
        return hasFilledContent(values.aboutUs);
      case 'experience':
        return hasFilledContent(values.experienceBlocks);
      case 'strengths':
        return hasFilledContent(values.stackItems);
      case 'tools':
        return hasFilledContent(values.strengthsTools);
      case 'services':
        return hasFilledContent(values.serviceOffers);
      case 'team':
        return hasFilledContent(values.teamMembers);
      case 'gallery':
        return hasFilledContent(values.galleryItems);
      case 'faq':
        return hasFilledContent(values.faqItems);
      case 'links':
        return hasFilledContent(values.profileLinks);
      case 'contact':
        return hasFilledContent([values.contactEmails, values.contactPhones, values.contactAddresses]);
      case 'portfolio':
        return portfolioItemCount > 0 ? true : null;
      case 'products':
        return productsItemCount > 0 ? true : null;
      default:
        return null;
    }
  };

  /* Phones: the sections as one swipeable row of the News interest chips (the open one solid ink),
     the way search shows its result types below lg. */
  const renderPortfolioMobileTabs = () => (
    <nav
      aria-label={`${navTitle} sections`}
      className="flex gap-2 overflow-x-auto px-5 pb-1 pt-4 [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden"
    >
      {navigableSectionIds.map((sectionId) => {
        const section = getProfileSection(sectionId);
        const active = activeSection === section.id;
        const label = sectionLabelOverrides[section.id] ?? t(section.label);
        return (
          <button
            key={section.id}
            type="button"
            onClick={(event) => {
              event.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              handleSectionChange(section.id);
            }}
            aria-current={active ? 'true' : undefined}
            data-pf-no-color-transition
            className={`inline-flex h-10 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-semibold leading-5 transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
              active
                ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                : 'bg-[color:var(--gn-inset)] text-[color:var(--gn-ink)] active:bg-[color:var(--gn-hover)]'
            }`}
          >
            {label}
          </button>
        );
      })}
    </nav>
  );

  const renderSectionNav = (layout: 'mobile' | 'desktop') => {
    if (isPortfolioLayout && layout === 'desktop') {
      /*
       * The News rail (from md): an outlined "Sections" box — 20px title, then the sections under
       * small-caps group kickers, as 44px rows (glyph, label; the open one bold with a check). An empty
       * section carries a hollow dot, and the title line counts what is filled. A second box holds the
       * page's actions (`railActions`).
       */
      const allowed = new Set(navigableSectionIds);
      const inFormat = new Set(allowedSectionIds);
      const railGroups = PORTFOLIO_RAIL_GROUPS.map((group) => ({
        title: group.title,
        sections: group.sections.filter((id) => allowed.has(id)),
      })).filter((group) => group.sections.length > 0);
      const known = railGroups.flatMap((group) => group.sections).map(sectionFilled).filter((value) => value != null);
      const filledCount = known.filter(Boolean).length;

      return (
        <>
          <section className="gn-rail-box flex min-h-0 flex-col px-px pb-2 pt-5" aria-labelledby="portfolio-sections-title">
            <div className="flex items-baseline justify-between gap-3 px-6 pb-1 pt-1">
              <h2
                id="portfolio-sections-title"
                className="text-[20px] font-extrabold leading-6 tracking-[-0.01em] text-[color:var(--gn-ink)]"
              >
                {t('Sections')}
              </h2>
              <div className="flex shrink-0 items-center gap-1.5 self-center">
                {known.length > 0 ? (
                  <span className="text-[13px] tabular-nums text-[color:var(--gn-ink2)]">
                    {t('{filledCount} / {knownLength} filled', { filledCount, knownLength: known.length })}
                  </span>
                ) : null}
                {/* Four squares: every section there is, not only the format's. */}
                <button
                  type="button"
                  onClick={toggleShowAllSections}
                  aria-pressed={showAllSections}
                  title={showAllSections ? t('Show {navTitle} sections only', { navTitle }) : t('Show all sections')}
                  aria-label={showAllSections ? t('Show {navTitle} sections only', { navTitle }) : t('Show all sections')}
                  className={`-mr-2 inline-flex h-8 w-8 items-center justify-center rounded-full transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[color:var(--gn-ring)] ${
                    showAllSections
                      ? 'bg-[color:var(--gn-ink)] text-[color:var(--gn-surface)]'
                      : 'text-[color:var(--gn-ink)] hover:bg-[color:var(--gn-hover)]'
                  }`}
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinejoin="round" aria-hidden>
                    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
                    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
                    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
                    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
                  </svg>
                </button>
              </div>
            </div>
            <nav aria-label={t('Portfolio sections')} className="flex w-full flex-col">
              {railGroups.map((group) => (
                <div key={group.title} className="flex flex-col pt-3">
                  <p className="gn-kicker px-6 pb-1">{t(group.title)}</p>
                  {group.sections.map((sectionId) => {
                    const section = getProfileSection(sectionId);
                    const active = activeSection === section.id;
                    const label = sectionLabelOverrides[section.id] ?? t(section.label);
                    const filled = sectionFilled(section.id);
                    /* Shown by "Show all sections": outside the open format, so in secondary ink. */
                    const extra = !inFormat.has(section.id);
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => handleSectionChange(section.id)}
                        aria-current={active ? 'true' : undefined}
                        title={extra ? t('Not part of the {navTitle} format', { navTitle }) : undefined}
                        data-pf-no-color-transition
                        className={`flex w-full items-center gap-3 px-6 py-2.5 text-left text-[15px] leading-5 transition-colors duration-150 hover:bg-[color:var(--gn-hover)] hover:text-[color:var(--gn-ink)] focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[color:var(--gn-ring)] ${
                          active ? 'font-bold' : 'font-medium'
                        } ${extra && !active ? 'text-[color:var(--gn-ink2)]' : 'text-[color:var(--gn-ink)]'}`}
                      >
                        <ProfileSectionNavIcon sectionId={section.id} active={active} inheritColor />
                        <span className="min-w-0 flex-1 truncate">{label}</span>
                        {active ? (
                          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                            <path d="m5 12.5 4.5 4.5L19 7.5" />
                          </svg>
                        ) : filled === false ? (
                          <span className="flex shrink-0 items-center gap-1.5 text-[12px] text-[color:var(--gn-ink2)]">
                            <span aria-hidden className="h-1.5 w-1.5 rounded-full shadow-[inset_0_0_0_1.5px_currentColor]" />
                            <span className="sr-only">{t('Empty')}</span>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </section>
          {railPrimary}
          {/* From xl the actions box has its own column on the left (see the grid below). */}
          {railActions ? <div className={actionsColumn ? 'xl:hidden' : ''}>{railActions}</div> : null}
        </>
      );
    }

    return (
    <nav
      className={
        layout === 'mobile'
          ? 'flex gap-1 overflow-x-auto p-2'
          : 'flex flex-col gap-1 overflow-visible p-2 pt-3'
      }
      aria-label={t('Information sections')}
    >
      {sectionGroups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`flex shrink-0 gap-1 ${
            layout === 'desktop' ? 'w-full flex-col' : ''
          } ${
            groupIndex > 0
              ? layout === 'desktop'
                ? 'border-t border-neutral-200 pt-2 dark:border-neutral-800'
                : ''
              : ''
          }`}
        >
          {groupIndex > 0 && layout === 'mobile' ? (
            <div
              className="mx-0.5 w-px shrink-0 self-stretch bg-neutral-200 dark:bg-neutral-700"
              aria-hidden
            />
          ) : null}
          <div className={`flex gap-1 ${layout === 'desktop' ? 'w-full flex-col' : ''}`}>
            {group.map((sectionId) => {
              const section = getProfileSection(sectionId);
              const active = activeSection === section.id;
              const label = sectionLabelOverrides[section.id] ?? t(section.label);
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => handleSectionChange(section.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`${profileNavButtonBaseClass} ${
                    layout === 'desktop' ? 'mx-2 w-[calc(100%-1rem)]' : ''
                  } ${
                    active ? profileNavButtonActiveClass : profileNavButtonInactiveClass
                  }`}
                >
                  <ProfileSectionNavIcon sectionId={section.id} active={active} />
                  <span className="min-w-0 truncate">{label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
    );
  };

  const handleAvailabilityChange = (schedule: AvailabilitySchedule) => {
    setAvailabilitySchedule(schedule);
    form.setValue('availabilityHours', formatAvailabilityHours(schedule, timezoneId), { shouldDirty: true });
  };

  const beginPortfolioEdit = useCallback(() => {
    setAvailabilitySchedule(parseAvailabilityHours(values.availabilityHours));
    setIsEditing(true);
  }, [values.availabilityHours]);

  const buildCreatorProfileUpdateBody = useCallback(
    (
      parsed: ReturnType<typeof profileSchema.parse>,
      nextVisibility: ContactVisibilitySettings,
      responseTimeOverride?: string
    ) => {
      const hasCompleteLocation =
        parsed.locationLat != null &&
        parsed.locationLng != null &&
        Boolean(parsed.timezoneId?.trim());

      return {
        bio: parsed.bio?.trim() ? parsed.bio.trim() : undefined,
        specialite: parseSpecialtyList(parsed.specialties, parsed.specialite)[0] ?? '',
        specialties: parseSpecialtyList(parsed.specialties, parsed.specialite),
        specialtyTags: parseSpecialtyTags(parsed.specialtyTags),
        gender: parsed.gender?.trim() ? parsed.gender.trim() : undefined,
        nationality: parsed.nationality?.trim() ? parsed.nationality.trim().toUpperCase() : '',
        appRole: parsed.appRole ?? DEFAULT_CREATOR_APP_ROLE,
        spokenLanguages: serializeSpokenLanguagesForApi(parsed.spokenLanguages),
        ...(hasCompleteLocation
          ? {
              locationCity: parsed.locationCity?.trim() ? parsed.locationCity.trim() : undefined,
              locationCountry: parsed.locationCountry?.trim()
                ? parsed.locationCountry.trim()
                : undefined,
              locationLat: parsed.locationLat ?? undefined,
              locationLng: parsed.locationLng ?? undefined,
              timezoneId: parsed.timezoneId?.trim() ? parsed.timezoneId.trim() : undefined,
            }
          : {}),
        contactAddress: parsed.contactAddress?.trim() ? parsed.contactAddress.trim() : undefined,
        contactPhone: (() => {
          const stored = toStoredPhoneNumber(parsed.contactPhone);
          return stored || undefined;
        })(),
        contactEmail: parsed.contactEmail?.trim() ? parsed.contactEmail.trim() : undefined,
        contactAddresses: serializeContactEntries(parsed.contactAddresses, 'address'),
        contactPhones: serializeContactEntries(parsed.contactPhones, 'phone'),
        contactEmails: serializeContactEntries(parsed.contactEmails, 'email'),
        availabilityHours: parsed.availabilityHours?.trim()
          ? parsed.availabilityHours.trim()
          : undefined,
        isAvailable: parsed.isAvailable,
        availabilityLabel: parsed.availabilityLabel?.trim() ?? '',
        contactVisibility: JSON.stringify(nextVisibility),
        typicalResponseTime:
          responseTimeOverride !== undefined ? responseTimeOverride : typicalResponseTime,
        profileLinks: serializeProfileLinks(parsed.profileLinks),
        profileServices: serializeProfileServices(
          parsed.serviceOffers,
          parsed.specialties?.[0] ?? '',
          parsed.specialties
        ),
        faqItems: serializeFaqItems(parsed.faqItems),
        teamMembers: serializeTeamMembers(parsed.teamMembers),
        galleryItems: serializeGalleryItems(parsed.galleryItems),
        aboutUs: serializeAboutUs(parsed.aboutUs),
        experienceBlocks: serializeProfileBlocks(parsed.experienceBlocks),
        yearsOfExperience: parsed.yearsOfExperience,
        profileStack: parsed.stackItems.map((item) => ({
          name: item.value.trim(),
          description: item.description?.trim() ? item.description.trim() : null,
          category: item.category?.trim() ? item.category.trim().slice(0, 80) : null,
          level: item.level ?? null,
          useCases: [],
          experienceYears: null,
          experienceLabel: null,
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        })),
        strengthsToolsMastered: parsed.strengthsTools.map((item) => ({
          name: item.value.trim(),
          description: item.description?.trim() ? item.description.trim() : null,
          category: null,
          level: item.level ?? null,
          useCases: (item.useCases ?? []).map((entry) => entry.trim()).filter(Boolean).slice(0, 8),
          experienceYears: null,
          experienceLabel: null,
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        })),
        aboutSkills: serializeAboutSkills(parsed.aboutSkills),
        aboutStrengths: serializeAboutStringList(parsed.aboutStrengths),
        aboutSystemsTools: serializeAboutStringList(parsed.aboutSystemsTools),
        aboutInterests: serializeAboutStringList(parsed.aboutInterests),
        aboutEducation: serializeAboutEducation(parsed.aboutEducation),
      };
    },
    [typicalResponseTime]
  );

  /*
   * My Profile's section drawers save through here. The body is the regular serializer's output
   * (buildCreatorProfileUpdateBody) cut down to the drawer's own keys (SECTION_BODY_KEYS):
   * PUT /api/creator/profile only writes the fields it receives non-null, so every other section stays
   * exactly as stored — a section save can neither wipe nor re-validate the rest of the profile.
   * Visibility is a single JSON column, so it goes whole (saved settings + this drawer's switches), and
   * only when one of them changed.
   */
  const saveProfileSection = useCallback(
    async ({
      section,
      values: draft,
      visibility: nextVisibility,
      typicalResponseTime: nextResponseTime,
    }: ProfileSectionSaveInput) => {
      const full: CreatorProfileUpdateBody = buildCreatorProfileUpdateBody(draft, nextVisibility, nextResponseTime);
      const body: Record<string, unknown> = {};
      for (const key of SECTION_BODY_KEYS[section]) {
        if (full[key] !== undefined) body[key] = full[key];
      }
      if (section === 'about') {
        /* The serializer turns an empty value into `undefined` ("leave as is"); a field the owner
           cleared has to be sent empty for the API to remove it. */
        body.gender = draft.gender?.trim() ?? '';
        body.availabilityHours = draft.availabilityHours?.trim() ?? '';
        /* The API only clears the years together with the experience blocks: resend the stored ones. */
        if (draft.yearsOfExperience == null && savedSnapshot.current?.yearsOfExperience != null) {
          body.experienceBlocks = full.experienceBlocks;
        }
      }
      if (JSON.stringify(nextVisibility) !== JSON.stringify(savedContactVisibility.current)) {
        body.contactVisibility = full.contactVisibility;
      }

      await updateCreatorProfile(body as CreatorProfileUpdateBody);
      if (section === 'myRole') {
        dispatchCreatorAppRoleChanged(normalizeCreatorAppRole(draft.appRole));
      }
      await loadProfile({ silent: true });
      onProfileUpdated?.();
      pushFlashFeedback({ variant: 'success', title: t('{section} saved', { section: t(getProfileSection(section).label) }) });
    },
    [buildCreatorProfileUpdateBody, loadProfile, onProfileUpdated]
  );

  const openSectionDrawer = (section: ProfileDrawerSectionId) => {
    setSectionDrawer({
      section,
      values: savedSnapshot.current ?? form.getValues(),
      visibility: savedContactVisibility.current,
      typicalResponseTime,
    });
  };

  const persistPortfolioVisibility = useCallback(
    async (key: keyof ContactVisibilitySettings, level: ContactVisibilityLevel) => {
      const nextVisibility = { ...contactVisibility, [key]: level };
      setContactVisibility(nextVisibility);
      if (savedContactVisibility.current[key] === level) return;

      setSaving(true);
      setSubmitError(null);
      try {
        const raw = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(availabilitySchedule, raw.timezoneId);
        const parsed = profileSchema.parse({
          ...raw,
          availabilityHours: availabilityHoursForSave,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, nextVisibility));
        savedContactVisibility.current = nextVisibility;
        pushFlashFeedback({
          variant: 'success',
          title: t('Visibility updated'),
        });
      } catch (e) {
        setContactVisibility(savedContactVisibility.current);
        setSectionSaveError(e, form, setSubmitError, t('Unable to update visibility.'));
      } finally {
        setSaving(false);
      }
    },
    [availabilitySchedule, buildCreatorProfileUpdateBody, contactVisibility, form, t]
  );

  const persistPortfolioAboutField = useCallback(
    async (
      field: PortfolioAboutFieldKey,
      value: PortfolioAboutFieldValue[PortfolioAboutFieldKey]
    ) => {
      setSaving(true);
      setSubmitError(null);
      try {
        let nextSchedule = availabilitySchedule;

        if (field === 'fullName') {
          const trimmedName = String(value).trim();
          form.setValue('fullName', trimmedName, { shouldDirty: true });
          if (trimmedName !== (savedSnapshot.current?.fullName?.trim() ?? '')) {
            const updated = await updateUserProfile({ fullName: trimmedName });
            updateUser({
              fullName: updated.fullName,
              username: updated.username,
              avatarUrl: updated.avatarUrl,
            });
          }
        } else if (field === 'username') {
          const trimmedUsername = String(value).trim();
          form.setValue('username', trimmedUsername, { shouldDirty: true });
          if (trimmedUsername !== (savedSnapshot.current?.username?.trim() ?? '')) {
            const updated = await updateUserProfile({ username: trimmedUsername });
            updateUser({
              fullName: updated.fullName,
              username: updated.username,
              avatarUrl: updated.avatarUrl,
            });
          }
        } else if (field === 'bio') {
          form.setValue('bio', String(value), { shouldDirty: true });
        } else if (field === 'specialite') {
          form.setValue('specialite', String(value), { shouldDirty: true });
        } else if (field === 'specialtySet') {
          const payload = value as PortfolioAboutFieldValue['specialtySet'];
          const specialties = parseSpecialtyList(payload.specialties);
          form.setValue('specialties', specialties, { shouldDirty: true });
          form.setValue('specialtyTags', parseSpecialtyTags(payload.specialtyTags), { shouldDirty: true });
          form.setValue('specialite', specialties[0] ?? '', { shouldDirty: true });
        } else if (field === 'gender') {
          const nextGender = normalizeCreatorGender(value) ?? '';
          form.setValue('gender', nextGender, { shouldDirty: true });
        } else if (field === 'nationality') {
          form.setValue('nationality', normalizeNationalityCode(value) ?? '', { shouldDirty: true });
        } else if (field === 'yearsOfExperience') {
          const years =
            value == null
              ? null
              : typeof value === 'number'
                ? value
                : Number.parseInt(String(value), 10);
          form.setValue(
            'yearsOfExperience',
            years == null || Number.isNaN(years) ? null : years,
            { shouldDirty: true }
          );
        } else if (field === 'spokenLanguages') {
          const languages = value as PortfolioAboutFieldValue['spokenLanguages'];
          form.setValue('spokenLanguages', languages, { shouldDirty: true });
        } else if (field === 'aboutSkills') {
          form.setValue('aboutSkills', value as PortfolioAboutFieldValue['aboutSkills'], {
            shouldDirty: true,
          });
        } else if (field === 'aboutStrengths') {
          form.setValue(
            'aboutStrengths',
            (value as string[]).map((item) => ({ value: item })),
            { shouldDirty: true }
          );
        } else if (field === 'aboutSystemsTools') {
          form.setValue(
            'aboutSystemsTools',
            (value as string[]).map((item) => ({ value: item })),
            { shouldDirty: true }
          );
        } else if (field === 'aboutInterests') {
          form.setValue(
            'aboutInterests',
            (value as string[]).map((item) => ({ value: item })),
            { shouldDirty: true }
          );
        } else if (field === 'aboutEducation') {
          form.setValue('aboutEducation', value as PortfolioAboutFieldValue['aboutEducation'], {
            shouldDirty: true,
          });
        } else if (field === 'isAvailable') {
          form.setValue('isAvailable', Boolean(value), { shouldDirty: true });
        } else if (field === 'availabilityLabel') {
          form.setValue('availabilityLabel', String(value ?? ''), { shouldDirty: true });
        } else if (field === 'availabilityHours') {
          const hours = String(value);
          nextSchedule = parseAvailabilityHours(hours);
          setAvailabilitySchedule(nextSchedule);
          form.setValue('availabilityHours', hours, { shouldDirty: true });
        } else if (field === 'typicalResponseTime') {
          setTypicalResponseTime(String(value));
        }

        const latest = form.getValues();
        const availabilityHoursForSave =
          field === 'availabilityHours'
            ? String(value)
            : formatAvailabilityHours(nextSchedule, latest.timezoneId);
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          ...(field === 'fullName' ? { fullName: String(value).trim() } : {}),
          ...(field === 'username' ? { username: String(value).trim() } : {}),
          ...(field === 'bio' ? { bio: String(value) } : {}),
          ...(field === 'specialite' ? { specialite: String(value) } : {}),
          ...(field === 'specialtySet'
            ? {
                specialties: parseSpecialtyList(
                  (value as PortfolioAboutFieldValue['specialtySet']).specialties
                ),
                specialtyTags: parseSpecialtyTags(
                  (value as PortfolioAboutFieldValue['specialtySet']).specialtyTags
                ),
                specialite:
                  parseSpecialtyList(
                    (value as PortfolioAboutFieldValue['specialtySet']).specialties
                  )[0] ?? '',
              }
            : {}),
          ...(field === 'gender' ? { gender: normalizeCreatorGender(value) ?? '' } : {}),
          ...(field === 'nationality'
            ? { nationality: normalizeNationalityCode(value) ?? '' }
            : {}),
          ...(field === 'yearsOfExperience'
            ? {
                yearsOfExperience:
                  value == null
                    ? null
                    : typeof value === 'number'
                      ? value
                      : Number.parseInt(String(value), 10),
              }
            : {}),
          ...(field === 'spokenLanguages'
            ? { spokenLanguages: value as PortfolioAboutFieldValue['spokenLanguages'] }
            : {}),
          ...(field === 'aboutSkills'
            ? { aboutSkills: value as PortfolioAboutFieldValue['aboutSkills'] }
            : {}),
          ...(field === 'aboutStrengths'
            ? { aboutStrengths: (value as string[]).map((item) => ({ value: item })) }
            : {}),
          ...(field === 'aboutSystemsTools'
            ? { aboutSystemsTools: (value as string[]).map((item) => ({ value: item })) }
            : {}),
          ...(field === 'aboutInterests'
            ? { aboutInterests: (value as string[]).map((item) => ({ value: item })) }
            : {}),
          ...(field === 'aboutEducation'
            ? { aboutEducation: value as PortfolioAboutFieldValue['aboutEducation'] }
            : {}),
          ...(field === 'isAvailable' ? { isAvailable: Boolean(value) } : {}),
          ...(field === 'availabilityLabel' ? { availabilityLabel: String(value ?? '') } : {}),
        });

        const responseTimeForSave =
          field === 'typicalResponseTime' ? String(value) : typicalResponseTime;

        // Scoped PUT: about fields must not re-submit services/FAQ/etc.
        // Full-body saves were rejecting bio edits when service categories used old specialty aliases
        // (e.g. "designer") after specialties were canonicalized ("Design").
        if (field === 'bio') {
          if (isRepeatedBioContent(String(value))) {
            form.setError('bio', {
              type: 'manual',
              message: t('Bio looks duplicated — remove the repeated paragraph before saving.'),
            });
            throw new UserFacingError('Bio looks duplicated — remove the repeated paragraph before saving.');
          }
          const cleaned = collapseRepeatedBio(String(value));
          form.setValue('bio', cleaned, { shouldDirty: true });
          form.clearErrors('bio');
          await updateCreatorProfile({ bio: cleaned });
        } else if (field === 'fullName') {
          // Already persisted via updateUserProfile above.
        } else if (field === 'username') {
          // Already persisted via updateUserProfile above.
        } else if (field === 'specialtySet') {
          const payload = value as PortfolioAboutFieldValue['specialtySet'];
          const specialties = parseSpecialtyList(payload.specialties);
          await updateCreatorProfile({
            specialties,
            specialtyTags: parseSpecialtyTags(payload.specialtyTags),
            specialite: specialties[0] ?? '',
          });
        } else if (field === 'specialite') {
          await updateCreatorProfile({ specialite: String(value) });
        } else if (field === 'gender') {
          await updateCreatorProfile({ gender: normalizeCreatorGender(value) ?? undefined });
        } else if (field === 'nationality') {
          await updateCreatorProfile({ nationality: normalizeNationalityCode(value) ?? '' });
        } else if (field === 'yearsOfExperience') {
          const years =
            value == null
              ? null
              : typeof value === 'number'
                ? value
                : Number.parseInt(String(value), 10);
          await updateCreatorProfile({
            yearsOfExperience: years == null || Number.isNaN(years) ? null : years,
          });
        } else if (field === 'spokenLanguages') {
          await updateCreatorProfile({
            spokenLanguages: serializeSpokenLanguagesForApi(
              value as PortfolioAboutFieldValue['spokenLanguages']
            ),
          });
        } else if (field === 'aboutSkills') {
          await updateCreatorProfile({
            aboutSkills: serializeAboutSkills(value as PortfolioAboutFieldValue['aboutSkills']),
          });
        } else if (field === 'aboutStrengths') {
          await updateCreatorProfile({
            aboutStrengths: serializeAboutStringList(
              (value as string[]).map((item) => ({ value: item }))
            ),
          });
        } else if (field === 'aboutSystemsTools') {
          await updateCreatorProfile({
            aboutSystemsTools: serializeAboutStringList(
              (value as string[]).map((item) => ({ value: item }))
            ),
          });
        } else if (field === 'aboutInterests') {
          await updateCreatorProfile({
            aboutInterests: serializeAboutStringList(
              (value as string[]).map((item) => ({ value: item }))
            ),
          });
        } else if (field === 'aboutEducation') {
          await updateCreatorProfile({
            aboutEducation: serializeAboutEducation(
              value as PortfolioAboutFieldValue['aboutEducation']
            ),
          });
        } else if (field === 'isAvailable') {
          await updateCreatorProfile({ isAvailable: Boolean(value) });
        } else if (field === 'availabilityLabel') {
          await updateCreatorProfile({ availabilityLabel: String(value ?? '').trim() });
        } else if (field === 'availabilityHours') {
          await updateCreatorProfile({ availabilityHours: String(value) });
        } else if (field === 'typicalResponseTime') {
          await updateCreatorProfile({ typicalResponseTime: responseTimeForSave });
        } else {
          await updateCreatorProfile(
            buildCreatorProfileUpdateBody(parsed, contactVisibility, responseTimeForSave)
          );
        }
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: ABOUT_FIELD_TOAST_TITLES[field] ?? t('About updated'),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this field.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
      typicalResponseTime,
      updateUser,
    ]
  );

  const registerPortfolioGlobalConfirm = useCallback((confirm: (() => Promise<void>) | null) => {
    portfolioGlobalConfirmRef.current = confirm;
  }, []);

  const persistPortfolioServices = useCallback(
    async (
      nextServices: Array<{
        title: string;
        description: string;
        basePriceCents: number | null;
        deadline: string;
        tasks: Array<{ value: string }>;
      }>
    ) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const fallbackSpecialty = form.getValues('specialties')?.[0] ?? '';
        const previous = form.getValues('serviceOffers');
        const cleaned = nextServices
          .map((service, index) => {
            const prior = previous[index];
            return {
              ...createEmptyProfileService(index, prior?.specialty || fallbackSpecialty),
              id: prior?.id ?? crypto.randomUUID(),
              title: service.title.trim(),
              description: service.description?.trim() ?? '',
              basePriceCents: service.basePriceCents ?? null,
              deadline: service.deadline?.trim() ?? '',
              tasks: (service.tasks ?? [])
                .map((task) => ({ value: task.value.trim() }))
                .filter((task) => task.value.length > 0),
              specialty: prior?.specialty || fallbackSpecialty,
              pricingType:
                prior?.pricingType ?? (service.basePriceCents != null ? 'FIXED' : 'QUOTE'),
              coverImageUrl: prior?.coverImageUrl ?? '',
              status: prior?.status ?? 'ACTIVE',
              tags: prior?.tags ?? [],
            };
          })
          .filter((service) => service.title.length > 0);
        const merged = cleaned;
        form.setValue('serviceOffers', merged, { shouldDirty: true });

        if (
          JSON.stringify(serializeProfileServices(merged, fallbackSpecialty)) ===
          JSON.stringify(
            serializeProfileServices(savedSnapshot.current?.serviceOffers ?? [], fallbackSpecialty)
          )
        ) {
          form.setValue('serviceOffers', merged, { shouldDirty: false });
          return;
        }

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          serviceOffers: merged,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        const previousCount = serializeProfileServices(
          savedSnapshot.current?.serviceOffers ?? [],
          form.getValues('specialties')?.[0] ?? ''
        ).length;
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(previousCount, cleaned.length, {
            added: 'Service added',
            deleted: 'Service deleted',
            updated: 'Service updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioFaq = useCallback(
    async (nextItems: Array<{ question: string; answer: string }>) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const cleaned = nextItems
          .map((item) => ({
            question: item.question.trim(),
            answer: item.answer.trim(),
          }))
          .filter((item) => item.question.length > 0 && item.answer.length > 0);
        const merged = cleaned.map((item, index) => ({
          ...createEmptyFaqItem(index),
          question: item.question,
          answer: item.answer,
        }));
        form.setValue('faqItems', merged, { shouldDirty: true });

        const savedFaq = serializeFaqItems(savedSnapshot.current?.faqItems ?? []).map(
          ({ question, answer }) => ({ question, answer })
        );
        const nextFaq = cleaned.map(({ question, answer }) => ({ question, answer }));
        if (JSON.stringify(nextFaq) === JSON.stringify(savedFaq)) {
          form.setValue('faqItems', merged, { shouldDirty: false });
          return;
        }

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          faqItems: merged,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(savedFaq.length, cleaned.length, {
            added: 'FAQ item added',
            deleted: 'FAQ item deleted',
            updated: 'FAQ updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioTeam = useCallback(
    async (
      nextMembers: Array<{
        name: string;
        responsibility: string;
        imageUrl: string;
        socialLinks: Array<{
          id: string;
          platform: string;
          label: string;
          url: string;
          sortOrder: number;
        }>;
      }>
    ) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const cleaned = nextMembers
          .map((member) => ({
            name: member.name.trim(),
            responsibility: member.responsibility.trim(),
            imageUrl: member.imageUrl?.trim() ?? '',
            socialLinks: (member.socialLinks ?? [])
              .filter((link) => link.url.trim().length > 0)
              .map((link, linkIndex) => ({
                id: link.id,
                platform: link.platform,
                label: link.label?.trim() ?? '',
                url: link.url.trim(),
                sortOrder: linkIndex,
              })),
          }))
          .filter((member) => member.name.length > 0 && member.responsibility.length > 0);
        const merged = cleaned.map((member, index) => {
          const empty = createEmptyTeamMember(index);
          return {
            ...empty,
            name: member.name,
            responsibility: member.responsibility,
            imageUrl: member.imageUrl,
            socialLinks: member.socialLinks.map((link, linkIndex) => ({
              id: link.id || crypto.randomUUID(),
              platform:
                (link.platform as (typeof empty.socialLinks)[number]['platform']) || 'LINKEDIN',
              label: link.label,
              url: link.url,
              sortOrder: linkIndex,
            })),
          };
        });
        form.setValue('teamMembers', merged, { shouldDirty: true });

        const savedTeam = serializeTeamMembers(savedSnapshot.current?.teamMembers ?? []).map(
          ({ name, responsibility, imageUrl, socialLinks }) => ({
            name,
            responsibility,
            imageUrl,
            socialLinks: socialLinks.map(({ platform, label, url }) => ({
              platform,
              label,
              url,
            })),
          })
        );
        const nextTeam = serializeTeamMembers(merged).map(
          ({ name, responsibility, imageUrl, socialLinks }) => ({
            name,
            responsibility,
            imageUrl,
            socialLinks: socialLinks.map(({ platform, label, url }) => ({
              platform,
              label,
              url,
            })),
          })
        );
        if (JSON.stringify(nextTeam) === JSON.stringify(savedTeam)) {
          form.setValue('teamMembers', merged, { shouldDirty: false });
          return;
        }

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          teamMembers: merged,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(savedTeam.length, cleaned.length, {
            added: 'Team member added',
            deleted: 'Team member deleted',
            updated: 'Team member updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioAboutUs = useCallback(
    async (next: ProfileFormValues['aboutUs']) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const payload = serializeAboutUs(next);
        await updateCreatorProfile({ aboutUs: payload });
        const parsed = parseAboutUs(payload);
        form.setValue('aboutUs', parsed, { shouldDirty: false });
        if (savedSnapshot.current) {
          savedSnapshot.current = { ...savedSnapshot.current, aboutUs: parsed };
        }
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: t('About us updated'),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update About us.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [form, onProfileUpdated, t]
  );

  const persistPortfolioExperience = useCallback(
    async (next: { blocks: PortfolioExperienceBlockDraft[] }) => {
      setSubmitError(null);
      try {
        const current = form.getValues('experienceBlocks');
        const existingFilled = current.filter(
          (block) =>
            block.text.trim().length > 0 ||
            Boolean(block.title?.trim()) ||
            Boolean(block.organization?.trim()) ||
            Boolean(block.period?.trim()) ||
            Boolean(block.location?.trim()) ||
            Boolean(block.mediaUrl?.trim()) ||
            block.status != null ||
            block.employmentType != null ||
            (block.tasks?.some((item) => item.value.trim()) ?? false) ||
            (block.tools?.some((item) => item.value.trim()) ?? false) ||
            (block.links?.some((item) => item.url.trim() || item.label.trim()) ?? false)
        );
        const cleaned = next.blocks
          .map((block) => ({
            title: block.title.trim(),
            organization: block.organization.trim(),
            period: block.period.trim(),
            text: block.text.trim(),
            status: block.status,
            location: block.location.trim(),
            employmentType: block.employmentType,
            hideFromCv: Boolean(block.hideFromCv),
            mediaUrl: block.mediaUrl.trim(),
            mediaType: block.mediaUrl.trim() ? block.mediaType : null,
            tasks: (block.tasks ?? [])
              .map((item) => ({ value: item.value.trim() }))
              .filter((item) => item.value.length > 0),
            tools: (block.tools ?? [])
              .map((item) => ({
                value: item.value.trim(),
                description: (item.description ?? '').trim(),
                iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
              }))
              .filter((item) => item.value.length > 0),
            links: (block.links ?? [])
              .map((link, linkIndex) => ({
                id: link.id,
                label: link.label.trim(),
                url: link.url.trim(),
                platform: link.platform,
                sortOrder: linkIndex,
              }))
              .filter((link) => link.label.length > 0 || link.url.length > 0),
          }))
          .filter(
            (block) =>
              block.text.length > 0 ||
              block.title.length > 0 ||
              block.organization.length > 0 ||
              block.period.length > 0 ||
              block.location.length > 0 ||
              block.mediaUrl.length > 0 ||
              block.status != null ||
              block.employmentType != null ||
              block.tasks.length > 0 ||
              block.tools.length > 0 ||
              block.links.length > 0
          );
        const merged = cleaned.map((block, index) => {
          const existing = existingFilled[index] ?? createEmptyProfileBlock(index);
          return {
            ...existing,
            sortOrder: index,
            title: block.title,
            organization: block.organization,
            period: block.period,
            text: block.text,
            status: block.status,
            location: block.location,
            employmentType: block.employmentType,
            hideFromCv: block.hideFromCv,
            mediaUrl: block.mediaUrl,
            mediaType: block.mediaUrl ? block.mediaType ?? null : null,
            tasks: block.tasks,
            tools: block.tools.map((tool) => {
              const previous = (existing.tools ?? []).find(
                (item) => item.value.trim().toLowerCase() === tool.value.toLowerCase()
              );
              return {
                value: tool.value,
                description: tool.description || previous?.description || '',
                category: previous?.category ?? '',
                level: previous?.level ?? null,
                useCases: previous?.useCases ?? [],
                experienceYears: previous?.experienceYears ?? null,
                experienceLabel: previous?.experienceLabel ?? '',
                currentlyUsed: previous?.currentlyUsed ?? null,
                iconUrl: tool.iconUrl ?? previous?.iconUrl ?? null,
              };
            }),
            links: block.links.map((link, linkIndex) => ({
              id: link.id || crypto.randomUUID(),
              label: link.label,
              url: link.url,
              platform: link.platform,
              sortOrder: linkIndex,
            })),
          };
        });
        form.setValue('experienceBlocks', merged, { shouldDirty: true });

        const savedBlocks = savedSnapshot.current?.experienceBlocks ?? [];
        if (
          JSON.stringify(serializeProfileBlocks(merged)) ===
          JSON.stringify(serializeProfileBlocks(savedBlocks))
        ) {
          form.setValue('experienceBlocks', merged, { shouldDirty: false });
          return;
        }

        setSaving(true);
        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          experienceBlocks: merged,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(existingFilled.length, cleaned.length, {
            added: 'Experience added',
            deleted: 'Experience deleted',
            updated: 'Experience updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioStack = useCallback(
    async (
      nextItems: Array<{
        value: string;
        description?: string;
        category?: string;
        level?: StrengthFormItem['level'];
        useCases?: string[];
        experienceYears?: number | null;
        experienceLabel?: string;
        currentlyUsed?: boolean | null;
        iconUrl?: string | null;
      }>
    ) => {
      const cleaned = nextItems
        .map((item) => ({
          value: item.value.trim(),
          description: (item.description ?? '').trim(),
          category: (item.category ?? '').trim().slice(0, 80),
          level: item.level ?? null,
          useCases: [],
          experienceYears: null,
          experienceLabel: '',
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        }))
        .filter((item) => item.value.length > 0);

      form.setValue('stackItems', cleaned, { shouldDirty: true });

      if (areStrengthsToolsEqual(cleaned, savedSnapshot.current?.stackItems ?? [])) {
        form.setValue('stackItems', cleaned, { shouldDirty: false });
        return;
      }

      setSaving(true);
      setSubmitError(null);
      try {
        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          stackItems: cleaned,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        const previousCount = (savedSnapshot.current?.stackItems ?? []).filter(
          (item) => item.value.trim().length > 0
        ).length;
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(previousCount, cleaned.length, {
            added: 'Stack item added',
            deleted: 'Stack item deleted',
            updated: 'Stack item updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioStrengths = useCallback(
    async (
      nextItems: Array<{
        value: string;
        description?: string;
        category?: string;
        level?: StrengthFormItem['level'];
        useCases?: string[];
        experienceYears?: number | null;
        experienceLabel?: string;
        currentlyUsed?: boolean | null;
        iconUrl?: string | null;
      }>
    ) => {
      const cleaned = nextItems
        .map((item) => ({
          value: item.value.trim(),
          description: (item.description ?? '').trim(),
          category: (item.category ?? '').trim().slice(0, 80),
          level: item.level ?? null,
          useCases: [],
          experienceYears: null,
          experienceLabel: '',
          currentlyUsed: null,
          iconUrl: item.iconUrl?.trim() ? item.iconUrl.trim() : null,
        }))
        .filter((item) => item.value.length > 0);

      form.setValue('strengthsTools', cleaned, { shouldDirty: true });

      if (areStrengthsToolsEqual(cleaned, savedSnapshot.current?.strengthsTools ?? [])) {
        form.setValue('strengthsTools', cleaned, { shouldDirty: false });
        return;
      }

      setSaving(true);
      setSubmitError(null);
      try {
        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          strengthsTools: cleaned,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        const previousCount = (savedSnapshot.current?.strengthsTools ?? []).filter(
          (item) => item.value.trim().length > 0
        ).length;
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(previousCount, cleaned.length, {
            added: 'Skill added',
            deleted: 'Skill deleted',
            updated: 'Skill updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioGallery = useCallback(
    async (
      nextItems: Array<{
        id?: string;
        title: string;
        mediaUrl: string;
        mediaType: 'IMAGE' | 'VIDEO' | null;
      }>
    ) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const current = form.getValues('galleryItems');
        const cleaned = nextItems
          .map((item, index) => {
            const mediaUrl = item.mediaUrl.trim();
            const existingId =
              item.id?.trim() ||
              current[index]?.id ||
              current.find((row) => row.mediaUrl.trim() === mediaUrl)?.id;
            return {
              id: existingId,
              title: item.title.trim(),
              mediaUrl,
              mediaType: mediaUrl
                ? item.mediaType ?? inferProfileMediaType(mediaUrl)
                : null,
            };
          })
          .filter((item) => item.mediaUrl.length > 0);
        const merged = cleaned.map((item, index) => ({
          id: item.id && /^[0-9a-f-]{36}$/i.test(item.id) ? item.id : crypto.randomUUID(),
          sortOrder: index,
          title: item.title,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
        }));

        const savedGallery = serializeGalleryItems(savedSnapshot.current?.galleryItems ?? []).map(
          ({ title, mediaUrl, mediaType }) => ({ title, mediaUrl, mediaType })
        );
        const nextGallery = serializeGalleryItems(merged).map(
          ({ title, mediaUrl, mediaType }) => ({ title, mediaUrl, mediaType })
        );
        if (JSON.stringify(nextGallery) === JSON.stringify(savedGallery)) {
          form.setValue('galleryItems', merged, { shouldDirty: false });
          return;
        }

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        // Drop incomplete compose drafts from other sections so gallery save isn't blocked.
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          spokenLanguages: latest.spokenLanguages.filter((item) => item.value.trim().length > 0),
          experienceBlocks: latest.experienceBlocks.filter((block) => block.text.trim().length > 0),
          strengthsTools: latest.strengthsTools.filter((item) => item.value.trim().length > 0),
          stackItems: latest.stackItems.filter((item) => item.value.trim().length > 0),
          profileLinks: latest.profileLinks.filter((link) => link.url.trim().length > 0),
          serviceOffers: latest.serviceOffers.filter(
            (service) =>
              service.title.trim().length > 0 ||
              Boolean(service.description?.trim()) ||
              Boolean(service.deadline?.trim()) ||
              service.basePriceCents != null ||
              (service.tasks?.some((task) => task.value.trim()) ?? false)
          ),
          faqItems: latest.faqItems.filter(
            (item) => item.question.trim().length > 0 || item.answer.trim().length > 0
          ),
          teamMembers: latest.teamMembers.filter(
            (member) =>
              member.name.trim().length > 0 ||
              member.responsibility.trim().length > 0 ||
              Boolean(member.imageUrl?.trim()) ||
              (member.socialLinks?.some((link) => link.url.trim() || link.label?.trim()) ?? false)
          ),
          galleryItems: merged,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        // Commit form only after the API succeeds — avoids a stuck "no changes" retry after failure.
        form.setValue('galleryItems', merged, { shouldDirty: false });
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(savedGallery.length, cleaned.length, {
            added: 'Gallery item added',
            deleted: 'Gallery item deleted',
            updated: 'Gallery updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioLinks = useCallback(
    async (
      nextLinks: Array<{
        id?: string;
        url: string;
        label?: string;
        type?: string;
        platform?: string | null;
        iconUrl?: string | null;
        hideFromCv?: boolean;
      }>
    ) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const current = form.getValues('profileLinks');
        const cleaned = nextLinks
          .map((link, index) => {
            const url = link.url.trim();
            const existingId =
              link.id?.trim() ||
              current[index]?.id ||
              current.find((row) => row.url.trim() === url)?.id;
            const existing =
              (existingId
                ? current.find((row) => row.id === existingId)
                : undefined) ?? current[index];
            const type =
              link.type?.trim() ||
              (existing?.type?.trim() ? existing.type : 'CUSTOM') ||
              'CUSTOM';
            const iconUrl =
              link.iconUrl !== undefined
                ? link.iconUrl?.trim()
                  ? link.iconUrl.trim()
                  : null
                : existing?.iconUrl?.trim()
                  ? existing.iconUrl.trim()
                  : null;
            return {
              id: existingId,
              url,
              label: deriveProfileLinkLabel(url),
              type,
              platform: existing?.platform ?? null,
              iconUrl,
              hideFromCv:
                link.hideFromCv !== undefined ? link.hideFromCv : existing?.hideFromCv === true,
            };
          })
          .filter((link) => link.url.length > 0);
        const merged = cleaned.map((link, index) => ({
          ...createEmptyProfileLink(index),
          id: link.id && /^[0-9a-f-]{36}$/i.test(link.id) ? link.id : crypto.randomUUID(),
          type: link.type || 'CUSTOM',
          label: link.label,
          url: link.url,
          platform: link.platform ?? null,
          iconUrl: link.iconUrl ?? null,
          hideFromCv: link.hideFromCv,
        }));

        const savedLinks = serializeProfileLinks(savedSnapshot.current?.profileLinks ?? []).map(
          ({ label, url, iconUrl, hideFromCv }) => ({
            label,
            url,
            iconUrl: iconUrl ?? null,
            hideFromCv: hideFromCv === true,
          })
        );
        const nextLinksComparable = serializeProfileLinks(merged).map(
          ({ label, url, iconUrl, hideFromCv }) => ({
            label,
            url,
            iconUrl: iconUrl ?? null,
            hideFromCv: hideFromCv === true,
          })
        );
        if (JSON.stringify(nextLinksComparable) === JSON.stringify(savedLinks)) {
          form.setValue('profileLinks', merged, { shouldDirty: false });
          return;
        }

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        // Drop incomplete compose drafts from other sections so links save isn't blocked.
        const parsed = profileSchema.parse({
          ...latest,
          availabilityHours: availabilityHoursForSave,
          spokenLanguages: latest.spokenLanguages.filter((item) => item.value.trim().length > 0),
          experienceBlocks: latest.experienceBlocks.filter((block) => block.text.trim().length > 0),
          strengthsTools: latest.strengthsTools.filter((item) => item.value.trim().length > 0),
          stackItems: latest.stackItems.filter((item) => item.value.trim().length > 0),
          profileLinks: merged,
          serviceOffers: latest.serviceOffers.filter(
            (service) =>
              service.title.trim().length > 0 ||
              Boolean(service.description?.trim()) ||
              Boolean(service.deadline?.trim()) ||
              service.basePriceCents != null ||
              (service.tasks?.some((task) => task.value.trim()) ?? false)
          ),
          faqItems: latest.faqItems.filter(
            (item) => item.question.trim().length > 0 || item.answer.trim().length > 0
          ),
          teamMembers: latest.teamMembers.filter(
            (member) =>
              member.name.trim().length > 0 ||
              member.responsibility.trim().length > 0 ||
              Boolean(member.imageUrl?.trim()) ||
              (member.socialLinks?.some((link) => link.url.trim() || link.label?.trim()) ?? false)
          ),
          galleryItems: latest.galleryItems.filter((item) => item.mediaUrl.trim().length > 0),
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        // Commit form only after the API succeeds — avoids a stuck "no changes" retry after failure.
        form.setValue('profileLinks', merged, { shouldDirty: false });
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(savedLinks.length, cleaned.length, {
            added: 'Link added',
            deleted: 'Link deleted',
            updated: 'Link updated',
          }),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update this section.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioLocation = useCallback(
    async (next: PortfolioLocationFieldValue) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const latest = form.getValues();
        const nextCity = next.city.trim();
        const nextCountry = next.country.trim();
        const nextTimezone = next.timezone.trim();
        form.setValue('locationCity', nextCity, { shouldDirty: true });
        form.setValue('locationCountry', nextCountry, { shouldDirty: true });
        form.setValue('timezoneId', nextTimezone, { shouldDirty: true });

        const hasCompleteLocation =
          latest.locationLat != null &&
          latest.locationLng != null &&
          Boolean(nextTimezone);

        if (!hasCompleteLocation) {
          throw new UserFacingError('Enable device location before saving location fields.');
        }

        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          nextTimezone
        );
        const parsed = profileSchema.parse({
          ...latest,
          locationCity: nextCity,
          locationCountry: nextCountry,
          timezoneId: nextTimezone,
          availabilityHours: availabilityHoursForSave,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: t('Location updated'),
        });
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update location.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistPortfolioGeneralInfo = useCallback(
    async (draft: PortfolioGeneralInfoDraft) => {
      const latest = form.getValues();

      setSaving(true);
      setSubmitError(null);
      try {
        const trimmedName = draft.fullName.trim();
        const trimmedUsername = draft.username.trim();
        const nameChanged = trimmedName !== (savedSnapshot.current?.fullName?.trim() ?? '');
        const usernameChanged = trimmedUsername !== (savedSnapshot.current?.username?.trim() ?? '');
        if (nameChanged || usernameChanged) {
          const updated = await updateUserProfile({
            ...(nameChanged ? { fullName: trimmedName } : {}),
            ...(usernameChanged ? { username: trimmedUsername } : {}),
          });
          updateUser({
            fullName: updated.fullName,
            username: updated.username,
            avatarUrl: updated.avatarUrl,
          });
        }

        if (isRepeatedBioContent(draft.bio)) {
          throw new UserFacingError('Bio looks duplicated — remove the repeated paragraph before saving.');
        }

        const specialties = parseSpecialtyList(draft.specialties);
        const specialtiesChanged =
          specialties.join('|') !==
          parseSpecialtyList(latest.specialties ?? [], latest.specialite ?? '').join('|');
        await updateCreatorProfile({
          ...(specialtiesChanged ? { specialties, specialite: specialties[0] ?? '' } : {}),
          ...(draft.yearsOfExperience != null ? { yearsOfExperience: draft.yearsOfExperience } : {}),
          bio: collapseRepeatedBio(draft.bio),
          gender: normalizeCreatorGender(draft.gender) ?? undefined,
          nationality: normalizeNationalityCode(draft.nationality) ?? '',
          isAvailable: draft.isAvailable,
          availabilityHours: draft.availability
            ? formatAvailabilityHours(draft.availability, latest.timezoneId)
            : '',
        });
        await loadProfile({ silent: true });
        onProfileUpdated?.();
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update profile.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [form, loadProfile, onProfileUpdated, updateUser]
  );

  const persistPortfolioAboutDetails = useCallback(
    async (draft: PortfolioAboutDraft) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const specialties = parseSpecialtyList(draft.specialties);
        await updateCreatorProfile({
          specialite: specialties[0] ?? '',
          specialties,
          specialtyTags: parseSpecialtyTags(draft.specialtyTags),
          yearsOfExperience: draft.yearsOfExperience,
          spokenLanguages: serializeSpokenLanguagesForApi(draft.languages),
          aboutSkills: serializeAboutSkills(draft.aboutSkills),
          aboutStrengths: serializeAboutStringList(draft.aboutStrengths.map((value) => ({ value }))),
          aboutSystemsTools: serializeAboutStringList(draft.aboutSystemsTools.map((value) => ({ value }))),
          aboutInterests: serializeAboutStringList(draft.aboutInterests.map((value) => ({ value }))),
          aboutEducation: serializeAboutEducation(draft.aboutEducation),
        });
        await loadProfile({ silent: true });
        onProfileUpdated?.();
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update profile.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [form, loadProfile, onProfileUpdated]
  );

  const persistPortfolioContact = useCallback(
    async (next: PortfolioContactLists) => {
      setSaving(true);
      setSubmitError(null);
      try {
        const previousEmails = form.getValues('contactEmails');
        const previousPrimary = previousEmails[0];
        const primaryLocked =
          Boolean(previousPrimary?.value?.trim()) &&
          previousPrimary != null;

        let emailsInput = next.emails;
        if (primaryLocked && previousPrimary) {
          const rest = next.emails.filter((entry) => entry.id !== previousPrimary.id);
          emailsInput = [
            { id: previousPrimary.id, value: previousPrimary.value.trim() },
            ...rest,
          ];
        }

        const contactAddresses = next.addresses.map((entry, index) => ({
          ...createEmptyContactEntry(index),
          id: entry.id || crypto.randomUUID(),
          value: entry.value,
        }));
        const contactPhones = next.phones.map((entry, index) => ({
          ...createEmptyContactEntry(index),
          id: entry.id || crypto.randomUUID(),
          value: entry.value,
        }));
        const contactEmails = emailsInput.map((entry, index) => ({
          ...createEmptyContactEntry(index),
          id: entry.id || crypto.randomUUID(),
          value: entry.value,
        }));
        const legacy = syncContactLegacyFields({
          contactAddresses,
          contactPhones,
          contactEmails,
        });

        form.setValue('contactAddresses', contactAddresses, { shouldDirty: true });
        form.setValue('contactPhones', contactPhones, { shouldDirty: true });
        form.setValue('contactEmails', contactEmails, { shouldDirty: true });
        form.setValue('contactAddress', legacy.contactAddress, { shouldDirty: true });
        form.setValue('contactPhone', legacy.contactPhone, { shouldDirty: true });
        form.setValue('contactEmail', legacy.contactEmail, { shouldDirty: true });

        const latest = form.getValues();
        const availabilityHoursForSave = formatAvailabilityHours(
          availabilitySchedule,
          latest.timezoneId
        );
        const parsed = profileSchema.parse({
          ...latest,
          ...legacy,
          contactAddresses,
          contactPhones,
          contactEmails,
          availabilityHours: availabilityHoursForSave,
        });

        await updateCreatorProfile(buildCreatorProfileUpdateBody(parsed, contactVisibility));
        await loadProfile({ silent: true });
        onProfileUpdated?.();
        const countFilled = (entries: Array<{ value?: string }>) =>
          entries.filter((entry) => Boolean(entry.value?.trim())).length;
        const previousTotal =
          countFilled(savedSnapshot.current?.contactAddresses ?? []) +
          countFilled(savedSnapshot.current?.contactPhones ?? []) +
          countFilled(savedSnapshot.current?.contactEmails ?? []);
        const nextTotal =
          countFilled(contactAddresses) +
          countFilled(contactPhones) +
          countFilled(contactEmails);
        pushFlashFeedback({
          variant: 'success',
          title: listCrudToastTitle(previousTotal, nextTotal, {
            added: 'Contact detail added',
            deleted: 'Contact detail deleted',
            updated: 'Contact updated',
          }),
        });
        setContactAddingKind(null);
      } catch (e) {
        setSectionSaveError(e, form, setSubmitError, t('Unable to update contact.'));
        throw e;
      } finally {
        setSaving(false);
      }
    },
    [
      availabilitySchedule,
      buildCreatorProfileUpdateBody,
      contactVisibility,
      form,
      loadProfile,
      onProfileUpdated,
    ]
  );

  const persistAppRole = useCallback(
    async (nextRole: CreatorAppRole) => {
      const current = normalizeCreatorAppRole(form.getValues('appRole'));
      if (current === nextRole) return;

      form.setValue('appRole', nextRole, { shouldDirty: true });
      setSaving(true);
      setSubmitError(null);
      try {
        await updateCreatorProfile({ appRole: nextRole });
        const snapshot = savedSnapshot.current;
        if (snapshot) {
          savedSnapshot.current = { ...snapshot, appRole: nextRole };
        }
        form.reset({ ...form.getValues(), appRole: nextRole });
        dispatchCreatorAppRoleChanged(nextRole);
        onProfileUpdated?.();
        pushFlashFeedback({
          variant: 'success',
          title: t('Role updated'),
        });
      } catch (e) {
        form.setValue('appRole', current, { shouldDirty: false });
        setSectionSaveError(e, form, setSubmitError, t('Unable to update your role.'));
      } finally {
        setSaving(false);
      }
    },
    [form, onProfileUpdated, t]
  );

  const renderSectionContent = () => {
    const fieldVariant = isPortfolioLayout ? 'flat' : 'boxed';

    switch (activeSection) {
      case 'myRole':
        return (
          <ProfileAppRoleField
            value={normalizeCreatorAppRole(values.appRole)}
            disabled={saving}
            onChange={(role) => void persistAppRole(role)}
          />
        );
      case 'portfolio':
        if (isPortfolioLayout) {
          return (
            <PortfolioWorksStudio stackOptions={values.specialtyTags} onCountChange={setPortfolioItemCount} />
          );
        }
        return (
          <PortfolioShowcaseChrome
            stackOptions={values.specialtyTags}
            pickerOpen={portfolioAddingItem}
            onPickerOpenChange={setPortfolioAddingItem}
            onSelectionCountChange={setPortfolioItemCount}
          />
        );
      case 'products':
        return (
          <ProfileProductsPicker
            readOnly={false}
            pickerOpen={productsAddingItem}
            onPickerOpenChange={setProductsAddingItem}
            onSelectionCountChange={setProductsItemCount}
          />
        );
      case 'about':
        if (isPortfolioLayout) {
          return (
            <>
            <PortfolioGeneralInfoStudio
              initial={{
                fullName: values.fullName ?? '',
                username: values.username ?? '',
                bio: values.bio ?? '',
                gender: values.gender ?? '',
                nationality: values.nationality ?? '',
                isAvailable: values.isAvailable,
                availability: values.availabilityHours?.trim()
                  ? parseAvailabilityHours(values.availabilityHours)
                  : null,
                specialties: parseSpecialtyList(values.specialties ?? [], values.specialite ?? ''),
                yearsOfExperience: values.yearsOfExperience ?? null,
              }}
              availabilityLabel={values.availabilityLabel ?? ''}
              hideProviderFields={!showProviderAboutFields}
              /* Career roles edit their specialty on the About page; the others have none, so it lives
                 here. (My Profile edits it from the header's Edit intro and never renders this studio.) */
              showSpecialty={!creatorShowsCareerSections(watchedAppRole)}
              appRole={watchedAppRole}
              visibility={{
                gender: contactVisibility.gender,
                availability: contactVisibility.availability,
                location: contactVisibility.location,
              }}
              onVisibilityChange={(key, level) => void persistPortfolioVisibility(key, level)}
              onSave={persistPortfolioGeneralInfo}
              location={{
                city: values.locationCity ?? '',
                country: values.locationCountry ?? '',
                timezone: values.timezoneId ?? '',
                hasCompleteLocation: hasLocation,
                detectingLocation,
                onDetectLocation: () => {
                void (async () => {
                  await enableLocation();
                  const latest = form.getValues();
                  if (
                    latest.locationLat != null &&
                    latest.locationLng != null &&
                    latest.timezoneId?.trim()
                  ) {
                    try {
                      await persistPortfolioLocation({
                        city: latest.locationCity ?? '',
                        country: latest.locationCountry ?? '',
                        timezone: latest.timezoneId ?? '',
                      });
                    } catch {
                      // Error already surfaced.
                    }
                  }
                })();
                },
              }}
            />
            {locationError ? (
              <p className="mt-3 px-1 text-sm text-red-600 dark:text-red-400">{locationError}</p>
            ) : null}
            </>
          );
        }
        if (!isEditing) {
          return (
            <div className="space-y-4">
              <ProfileReadOnlyField label={t('Name')} value={values.fullName} />
              <ProfileReadOnlyField
                label={t('Username')}
                value={values.username || null}
                emptyLabel={t('Not set')}
              />
              <ProfileReadOnlyField label={t('Bio')} value={values.bio} />
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileReadOnlyField label={t('Gender')} value={values.gender} emptyLabel={t('Not set')} />
                <ProfileReadOnlyField
                  label={t('Nationality')}
                  value={nationalityLabel(values.nationality)}
                  emptyLabel={t('Not set')}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={profileSectionMutedTextClass}>{t('Status:')}</span>
                <CreatorAvailabilityBadge
                  isAvailable={values.isAvailable}
                  availabilityLabel={values.availabilityLabel}
                />
              </div>
              <ProfileReadOnlyField
                label={t('Availability hours')}
                value={
                  values.availabilityHours
                    ? formatAvailabilityHours(parseAvailabilityHours(values.availabilityHours), timezoneId)
                    : null
                }
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <ProfileReadOnlyField
                  label={t('Member since')}
                  value={formatMemberSince(memberSince)}
                  emptyLabel={t('Not available yet')}
                />
                <ProfileReadOnlyField
                  label={t('Typical response time')}
                  value={responseTimeLabel}
                  emptyLabel={t('Not enough data yet')}
                />
              </div>
              {hasLocation ? (
                <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950/50">
                  <p className={`mb-1 ${profileSectionMutedTextClass} font-semibold text-neutral-700 dark:text-neutral-300`}>
                    {t('Location')}
                  </p>
                  <p className={`${profileSectionBodyTextClass} font-semibold text-neutral-900 dark:text-white`}>
                    {formatLocationLabel(locationCity, locationCountry)}
                  </p>
                  <p className={`mt-1 ${profileSectionMutedTextClass}`}>{t('Timezone: {timezoneId}', { timezoneId })}</p>
                </div>
              ) : (
                <ProfileReadOnlyField
                  label={t('Location')}
                  value={null}
                  emptyLabel={t('Location not configured')}
                />
              )}
            </div>
          );
        }
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="fullName" className={profileFormLabelClass}>
                {t('Name')}
              </label>
              <input
                id="fullName"
                type="text"
                placeholder={t('e.g. Algorithmic Flow')}
                className={profileFormInputClass}
                {...form.register('fullName')}
              />
              {form.formState.errors.fullName ? (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.fullName.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="username" className={profileFormLabelClass}>
                {t('Username')}
              </label>
              <div>
                <input
                  id="username"
                  type="text"
                  spellCheck={false}
                  autoComplete="username"
                  placeholder="leopard"
                  className={profileFormInputClass}
                  {...form.register('username')}
                />
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                {t('Unique and case-sensitive — leopard and Leopard are different.')}
              </p>
              {form.formState.errors.username ? (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.username.message}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="bio" className={profileFormLabelClass}>
                {t('Bio')}
              </label>
              <textarea
                id="bio"
                rows={5}
                placeholder={t('e.g. Data insights and algorithm explainers to simplify the web.')}
                className={profileFormInputClass}
                {...form.register('bio')}
              />
              {form.formState.errors.bio ? (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {form.formState.errors.bio.message}
                </p>
              ) : null}
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="gender" className={profileFormLabelClass}>
                  {t('Gender')}
                </label>
                <select id="gender" className={profileFormInputClass} {...form.register('gender')}>
                  <option value="">{t('Not set')}</option>
                  {CREATOR_GENDER_VALUES.map((value) => (
                    <option key={value} value={value}>
                      {t(value)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="nationality" className={profileFormLabelClass}>
                  {t('Nationality')}
                </label>
                <select
                  id="nationality"
                  className={`${profileFormInputClass} dark:[color-scheme:dark]`}
                  {...form.register('nationality')}
                >
                  <option value="" className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
                    {t('Not set')}
                  </option>
                  {NATIONALITY_SELECT_OPTIONS.map((option) => (
                    <option
                      key={option.code}
                      value={option.code}
                      className="bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100"
                    >
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <CreatorAvailabilityControl
              isAvailable={values.isAvailable}
              availabilityLabel={values.availabilityLabel}
              onChange={(next) => form.setValue('isAvailable', next, { shouldDirty: true })}
            />
            <ContactVisibilitySelect
              id="visibility-gender"
              label={t('Gender visibility (public profile)')}
              value={contactVisibility.gender}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, gender: value }))}
            />
            <div>
              <label className={profileFormLabelClass}>{t('Availability hours')}</label>
              <div className="mt-2">
                <AvailabilityHoursInput
                  value={availabilitySchedule}
                  onChange={handleAvailabilityChange}
                  timezoneId={timezoneId}
                />
              </div>
            </div>
            <ContactVisibilitySelect
              id="visibility-availability-about"
              label={t('Availability visibility (public profile)')}
              value={contactVisibility.availability}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, availability: value }))}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <ProfileReadOnlyField
                label={t('Member since')}
                value={formatMemberSince(memberSince)}
                emptyLabel={t('Calculated automatically')}
                variant={fieldVariant}
              />
              <div>
                <label htmlFor="typicalResponseTime" className={profileFormLabelClass}>
                  {t('Typical response time')}
                </label>
                <select
                  id="typicalResponseTime"
                  className={profileFormInputClass}
                  value={typicalResponseTime}
                  onChange={(event) => setTypicalResponseTime(event.target.value)}
                >
                  <option value="">{t('Not set')}</option>
                  {TYPICAL_RESPONSE_TIME_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.label)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <ContactVisibilitySelect
              id="visibility-response-time"
              label={t('Response time visibility (public profile)')}
              value={contactVisibility.responseTime}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, responseTime: value }))}
            />
            <div className="space-y-4 rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className={profileFormLabelClass}>{t('Location')}</p>
              <button
                type="button"
                onClick={() => void enableLocation()}
                disabled={detectingLocation}
                className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
              >
                {detectingLocation && <LoadingSpinner size="sm" />}
                {hasLocation ? t('Refresh location') : t('Enable location (required)')}
              </button>
              {hasLocation ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-[15px] leading-relaxed text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                  <p className="font-medium">{formatLocationLabel(locationCity, locationCountry)}</p>
                  <p className="mt-1 text-emerald-800/80 dark:text-emerald-300/80">{t('Timezone: {timezoneId}', { timezoneId })}</p>
                </div>
              ) : (
                <p className="text-[15px] leading-relaxed text-amber-700 dark:text-amber-300">
                  {t('You must enable location before saving your information.')}
                </p>
              )}
              {locationError ? <p className="text-sm text-red-600">{locationError}</p> : null}
              {form.formState.errors.timezoneId ? (
                <p className="text-sm text-red-600">{form.formState.errors.timezoneId.message}</p>
              ) : null}
              <ContactVisibilitySelect
                id="visibility-location"
                label={t('Location visibility (public profile)')}
                value={contactVisibility.location}
                onChange={(value) => setContactVisibility((prev) => ({ ...prev, location: value }))}
              />
            </div>
          </div>
        );
      case 'aboutPage':
        if (isPortfolioLayout) {
          return (
            <PortfolioAboutStudio
              initial={{
                specialties: parseSpecialtyList(values.specialties ?? [], values.specialite ?? ''),
                specialtyTags: parseSpecialtyTags(values.specialtyTags ?? []),
                yearsOfExperience: values.yearsOfExperience ?? null,
                languages: values.spokenLanguages.filter((item) => item.value.trim().length > 0),
                aboutEducation: serializeAboutEducation(values.aboutEducation),
                aboutSkills: values.aboutSkills,
                aboutStrengths: serializeAboutStringList(values.aboutStrengths),
                aboutSystemsTools: serializeAboutStringList(values.aboutSystemsTools),
                aboutInterests: serializeAboutStringList(values.aboutInterests),
              }}
              hideProviderFields={!showProviderAboutFields}
              onSave={persistPortfolioAboutDetails}
              visibility={{
                spokenLanguages: contactVisibility.spokenLanguages,
                yearsOfExperience: contactVisibility.yearsOfExperience,
                aboutSkills: contactVisibility.aboutSkills,
                aboutStrengths: contactVisibility.aboutStrengths,
                aboutSystemsTools: contactVisibility.aboutSystemsTools,
                aboutInterests: contactVisibility.aboutInterests,
                aboutEducation: contactVisibility.aboutEducation,
              }}
              onVisibilityChange={(key, level) => void persistPortfolioVisibility(key, level)}
            />
          );
        }
        if (!isEditing) {
          return (
            <div className="space-y-4">
              {showProviderAboutFields ? (
                <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                  <ProfileReadOnlyField
                    label={t('Specialty')}
                    value={
                      (values.specialties ?? []).length > 0
                        ? (values.specialties ?? []).join(' · ')
                        : values.specialite
                    }
                  />
                  <ProfileReadOnlyField
                    label={t('Years of experience')}
                    value={
                      values.yearsOfExperience != null
                        ? values.yearsOfExperience === 1
                          ? '1 year'
                          : `${values.yearsOfExperience} years`
                        : null
                    }
                    emptyLabel={t('Not set')}
                  />
                </div>
              ) : (
                <ProfileReadOnlyField
                  label={t('Specialty')}
                  value={
                    (values.specialties ?? []).length > 0
                      ? (values.specialties ?? []).join(' · ')
                      : values.specialite
                  }
                />
              )}
              <div>
                <p className={`mb-2 ${profileSectionMutedTextClass} font-semibold text-neutral-700 dark:text-neutral-300`}>
                  {t('Working languages')}
                </p>
                <ProfileLanguagesField
                  control={form.control}
                  setValue={form.setValue}
                  readOnly
                  values={values.spokenLanguages.filter((item) => item.value.trim().length > 0)}
                />
              </div>
              <AboutEducationField
                control={form.control}
                fields={aboutEducationFields}
                append={appendAboutEducation}
                remove={removeAboutEducation}
                move={moveAboutEducation}
                register={form.register}
                readOnly
                values={serializeAboutEducation(values.aboutEducation)}
              />
              <AboutSkillsField
                control={form.control}
                fields={aboutSkillsFields}
                append={appendAboutSkill}
                remove={removeAboutSkill}
                move={moveAboutSkill}
                register={form.register}
                readOnly
                values={serializeAboutSkills(values.aboutSkills)}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutStrengths"
                  label={t('Strengths')}
                  maxItems={12}
                  readOnly
                  values={serializeAboutStringList(values.aboutStrengths)}
                />
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutSystemsTools"
                  label={t('Systems & Tools')}
                  maxItems={16}
                  readOnly
                  values={serializeAboutStringList(values.aboutSystemsTools)}
                />
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutInterests"
                  label={t('Interests')}
                  maxItems={12}
                  readOnly
                  values={serializeAboutStringList(values.aboutInterests)}
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-5">
            {showProviderAboutFields ? (
              <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
                <div>
                  <p className={profileFormLabelClass}>{t('Specialty')}</p>
                  <SpecialtyMultiSelect
                    specialties={values.specialties ?? []}
                    tags={values.specialtyTags ?? []}
                    onSpecialtiesChange={(next) => {
                      form.setValue('specialties', next, { shouldDirty: true });
                      form.setValue('specialite', next[0] ?? '', { shouldDirty: true });
                    }}
                    onTagsChange={(next) => form.setValue('specialtyTags', next, { shouldDirty: true })}
                    showTags={false}
                  />
                </div>
                <div>
                  <label htmlFor="about-page-yearsOfExperience" className={profileFormLabelClass}>
                    {t('Years of experience')}
                  </label>
                  <input
                    id="about-page-yearsOfExperience"
                    type="number"
                    min={0}
                    max={80}
                    className={profileFormInputClass}
                    {...form.register('yearsOfExperience', {
                      setValueAs: (v) => {
                        if (v === '' || v == null) return null;
                        const n = Number(v);
                        return Number.isNaN(n) ? null : n;
                      },
                    })}
                  />
                  <ContactVisibilitySelect
                    id="visibility-years-about"
                    label={t('Years of experience visibility (public profile)')}
                    value={contactVisibility.yearsOfExperience}
                    onChange={(value) =>
                      setContactVisibility((prev) => ({ ...prev, yearsOfExperience: value }))
                    }
                  />
                </div>
              </div>
            ) : null}
            <ProfileLanguagesField control={form.control} setValue={form.setValue} />
            <ContactVisibilitySelect
              id="visibility-spoken-languages-about"
              label={t('Working languages visibility (public profile)')}
              value={contactVisibility.spokenLanguages}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, spokenLanguages: value }))}
            />
            <AboutEducationField
              control={form.control}
              fields={aboutEducationFields}
              append={appendAboutEducation}
              remove={removeAboutEducation}
              move={moveAboutEducation}
              register={form.register}
            />
            <ContactVisibilitySelect
              id="visibility-about-education"
              label={t('Education visibility (public profile)')}
              value={contactVisibility.aboutEducation}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, aboutEducation: value }))}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-4">
                <AboutSkillsField
                  control={form.control}
                  fields={aboutSkillsFields}
                  append={appendAboutSkill}
                  remove={removeAboutSkill}
                  move={moveAboutSkill}
                  register={form.register}
                />
                <ContactVisibilitySelect
                  id="visibility-about-skills"
                  label={t('Skills visibility (public profile)')}
                  value={contactVisibility.aboutSkills}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, aboutSkills: value }))}
                />
              </div>
              <div className="space-y-4">
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutStrengths"
                  label={t('Strengths')}
                  description={t('Personal strengths that complement your specialty.')}
                  maxItems={12}
                />
                <ContactVisibilitySelect
                  id="visibility-about-strengths"
                  label={t('Strengths visibility (public profile)')}
                  value={contactVisibility.aboutStrengths}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, aboutStrengths: value }))}
                />
              </div>
              <div className="space-y-4">
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutSystemsTools"
                  label={t('Systems & Tools')}
                  description={t('Platforms, software, and tools you rely on.')}
                  maxItems={16}
                />
                <ContactVisibilitySelect
                  id="visibility-about-systems-tools"
                  label={t('Systems & tools visibility (public profile)')}
                  value={contactVisibility.aboutSystemsTools}
                  onChange={(value) =>
                    setContactVisibility((prev) => ({ ...prev, aboutSystemsTools: value }))
                  }
                />
              </div>
              <div className="space-y-4">
                <AboutStringListField
                  control={form.control}
                  register={form.register}
                  name="aboutInterests"
                  label={t('Interests')}
                  description={t('Topics and hobbies that help clients connect with you.')}
                  maxItems={12}
                />
                <ContactVisibilitySelect
                  id="visibility-about-interests"
                  label={t('Interests visibility (public profile)')}
                  value={contactVisibility.aboutInterests}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, aboutInterests: value }))}
                />
              </div>
            </div>
          </div>
        );
      case 'experience':
        if (isPortfolioLayout) {
          return (
            <PortfolioExperienceStudio
              blocks={values.experienceBlocks.map((block) =>
                experienceBlockToDraft(mapProfileBlockToExperienceBlock(block))
              )}
              onSave={persistPortfolioExperience}
            />
          );
        }
        if (!isEditing) {
          return (
            <div className="space-y-5">
              <ProfileReadOnlyField
                label={t('Years of experience')}
                value={values.yearsOfExperience != null ? String(values.yearsOfExperience) : null}
                emptyLabel={t('Not specified')}
                variant={fieldVariant}
              />
              <ProfileMediaBlocksField
                control={form.control}
                name="experienceBlocks"
                fields={experienceFields}
                append={appendExperience}
                remove={removeExperience}
                move={moveExperience}
                register={form.register}
                watch={form.watch}
                setValue={form.setValue}
                readOnly
              />
            </div>
          );
        }
        return (
          <div className="space-y-5">
            <ProfileSectionItemCount
              count={experienceFields.length}
              limit={MAX_EXPERIENCE_ENTRIES}
              unit="experiences"
            />
            <div>
              <label htmlFor="yearsOfExperience" className={profileFormLabelClass}>
                {t('Years of experience')}
              </label>
              <input
                id="yearsOfExperience"
                type="number"
                min={0}
                max={80}
                placeholder={t('e.g. 8')}
                className={`${profileFormInputClass} max-w-xs`}
                {...form.register('yearsOfExperience', {
                  setValueAs: (value) => {
                    if (value === '' || value == null) return null;
                    const parsed = Number(value);
                    return Number.isNaN(parsed) ? null : parsed;
                  },
                })}
              />
            </div>
            <ProfileMediaBlocksField
              control={form.control}
              name="experienceBlocks"
              fields={experienceFields}
              append={appendExperience}
              remove={removeExperience}
              move={moveExperience}
              register={form.register}
              watch={form.watch}
              setValue={form.setValue}
            />
            <ContactVisibilitySelect
              id="visibility-experience-edit"
              label={t('Public visibility (Experience)')}
              value={contactVisibility.experience}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, experience: value }))}
            />
            <ContactVisibilitySelect
              id="visibility-years-edit"
              label={t('Public visibility (Years of experience)')}
              value={contactVisibility.yearsOfExperience}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, yearsOfExperience: value }))}
            />
          </div>
        );
      case 'strengths':
        if (isPortfolioLayout) {
          return (
            <PortfolioSkillStudio
              key="stack"
              variant="stack"
              items={values.stackItems.map(toStrengthDraft)}
              onSave={persistPortfolioStack}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileStrengthsField
              control={form.control}
              setValue={form.setValue}
              readOnly
              values={values.stackItems}
              allowedSpecialties={values.specialties ?? []}
              mode="stack"
            />
          );
        }
        return (
          <div className="space-y-5">
            <ProfileStrengthsField
              control={form.control}
              setValue={form.setValue}
              allowedSpecialties={values.specialties ?? []}
              mode="stack"
            />
            <ContactVisibilitySelect
              id="visibility-stack-edit"
              label={t('Public visibility (Stack)')}
              value={contactVisibility.profileStack}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, profileStack: value }))}
            />
          </div>
        );
      case 'tools':
        if (isPortfolioLayout) {
          return (
            <PortfolioSkillStudio
              key="tools"
              variant="tools"
              items={values.strengthsTools.map(toStrengthDraft)}
              onSave={persistPortfolioStrengths}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileStrengthsField
              control={form.control}
              setValue={form.setValue}
              readOnly
              values={values.strengthsTools}
              allowedSpecialties={values.specialties ?? []}
              mode="tools"
            />
          );
        }
        return (
          <div className="space-y-5">
            <ProfileStrengthsField
              control={form.control}
              setValue={form.setValue}
              allowedSpecialties={values.specialties ?? []}
              mode="tools"
            />
            <ContactVisibilitySelect
              id="visibility-tools-edit"
              label={t('Public visibility (Tools)')}
              value={contactVisibility.strengthsTools}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, strengthsTools: value }))}
            />
          </div>
        );
      case 'services':
        if (isPortfolioLayout) {
          return (
            <PortfolioServicesReadOnly
              items={values.serviceOffers.map((service) => ({
                id: service.id,
                title: service.title ?? '',
                description: service.description ?? '',
                basePriceCents: service.basePriceCents ?? null,
                deadline: service.deadline ?? '',
                tasks: service.tasks ?? [],
              }))}
              onItemSave={async (index, next) => {
                const current = form.getValues('serviceOffers');
                await persistPortfolioServices(
                  current.map((service, serviceIndex) =>
                    serviceIndex === index
                      ? next
                      : {
                          title: service.title ?? '',
                          description: service.description ?? '',
                          basePriceCents: service.basePriceCents ?? null,
                          deadline: service.deadline ?? '',
                          tasks: service.tasks ?? [],
                        }
                  )
                );
                setServicesAddingItem(false);
              }}
              onItemsSave={async (next) => {
                await persistPortfolioServices(next);
              }}
              onRemoveItem={async (index) => {
                const current = form.getValues('serviceOffers');
                const remaining = current
                  .filter((_, serviceIndex) => serviceIndex !== index)
                  .map((service) => ({
                    title: service.title ?? '',
                    description: service.description ?? '',
                    basePriceCents: service.basePriceCents ?? null,
                    deadline: service.deadline ?? '',
                    tasks: service.tasks ?? [],
                  }));
                removeService(index);
                setServicesAddingItem(false);
                if (remaining.some((service) => service.title.trim())) {
                  await persistPortfolioServices(remaining);
                } else {
                  form.setValue('serviceOffers', [], { shouldDirty: true });
                  await persistPortfolioServices([]);
                }
              }}
              fieldSaving={saving}
              composeAdd={servicesAddingItem}
              onCancelNewItem={cancelServicesCompose}
              sectionRootRef={portfolioInfoCardRef}
              onGlobalHasChangesChange={setPortfolioGlobalHasChanges}
              onRegisterGlobalConfirm={registerPortfolioGlobalConfirm}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileServicesField
              control={form.control}
              fields={serviceFields}
              append={appendService}
              remove={removeService}
              move={moveService}
              register={form.register}
              setValue={form.setValue}
              readOnly
              values={values.serviceOffers}
            />
          );
        }
        return (
          <div className="space-y-5">
            <ProfileServicesField
              control={form.control}
              fields={serviceFields}
              append={appendService}
              remove={removeService}
              move={moveService}
              register={form.register}
              setValue={form.setValue}
            />
            <ContactVisibilitySelect
              id="visibility-services"
              label={t('Services visibility (public profile)')}
              value={contactVisibility.services}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, services: value }))}
            />
          </div>
        );
      case 'faq':
        if (isPortfolioLayout) {
          return (
            <PortfolioFaqStudio
              key="faq"
              items={values.faqItems.map((item) => ({
                question: item.question ?? '',
                answer: item.answer ?? '',
              }))}
              onSave={persistPortfolioFaq}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileFaqField
              control={form.control}
              fields={faqFields}
              append={appendFaq}
              remove={removeFaq}
              move={moveFaq}
              register={form.register}
              readOnly
              values={values.faqItems}
            />
          );
        }
        return (
          <div className="space-y-5">
            <ProfileFaqField
              control={form.control}
              fields={faqFields}
              append={appendFaq}
              remove={removeFaq}
              move={moveFaq}
              register={form.register}
            />
            <ContactVisibilitySelect
              id="visibility-faq"
              label={t('FAQ visibility (public profile)')}
              value={contactVisibility.faq}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, faq: value }))}
            />
          </div>
        );
      case 'aboutUs':
        if (isPortfolioLayout) {
          return <PortfolioAboutUsStudio key="aboutUs" value={values.aboutUs} onSave={persistPortfolioAboutUs} />;
        }
        return (
          <PortfolioAboutUsReadOnly
            value={values.aboutUs}
            saving={saving}
            editMode={isPortfolioLayout ? portfolioEditMode : 'individual'}
            onSave={persistPortfolioAboutUs}
          />
        );
      case 'team':
        if (isPortfolioLayout) {
          return (
            <PortfolioTeamStudio
              key="team"
              items={values.teamMembers.map((member) => ({
                name: member.name ?? '',
                responsibility: member.responsibility ?? '',
                imageUrl: member.imageUrl ?? '',
                socialLinks: (member.socialLinks ?? []).map((link, linkIndex) => ({
                  id: link.id,
                  platform: link.platform,
                  label: link.label ?? '',
                  url: link.url ?? '',
                  sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : linkIndex,
                })),
              }))}
              onSave={persistPortfolioTeam}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileTeamField
              control={form.control}
              fields={teamFields}
              append={appendTeam}
              remove={removeTeam}
              move={moveTeam}
              register={form.register}
              setValue={form.setValue}
              watch={form.watch}
              readOnly
              values={values.teamMembers}
            />
          );
        }
        return (
          <ProfileTeamField
            control={form.control}
            fields={teamFields}
            append={appendTeam}
            remove={removeTeam}
            move={moveTeam}
            register={form.register}
            setValue={form.setValue}
            watch={form.watch}
          />
        );
      case 'gallery':
        if (isPortfolioLayout) {
          return (
            <PortfolioGalleryStudio
              key="gallery"
              items={values.galleryItems.map((item) => ({
                id: item.id,
                title: item.title ?? '',
                mediaUrl: item.mediaUrl ?? '',
                mediaType: item.mediaType ?? null,
              }))}
              onSave={persistPortfolioGallery}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileGalleryField
              control={form.control}
              fields={galleryFields}
              append={appendGallery}
              remove={removeGallery}
              move={moveGallery}
              register={form.register}
              setValue={form.setValue}
              watch={form.watch}
              readOnly
              values={values.galleryItems}
            />
          );
        }
        return (
          <ProfileGalleryField
            control={form.control}
            fields={galleryFields}
            append={appendGallery}
            remove={removeGallery}
            move={moveGallery}
            register={form.register}
            setValue={form.setValue}
            watch={form.watch}
          />
        );
      case 'links':
        if (isPortfolioLayout) {
          return (
            <PortfolioLinksStudio
              key="links"
              items={values.profileLinks.map((link) => ({
                id: link.id,
                url: link.url ?? '',
                type: link.type || 'CUSTOM',
                platform: link.platform ?? null,
                iconUrl: link.iconUrl ?? null,
                hideFromCv: link.hideFromCv === true,
              }))}
              onSave={persistPortfolioLinks}
            />
          );
        }
        if (!isEditing) {
          return (
            <ProfileLinksField
              control={form.control}
              fields={linkFields}
              append={appendLink}
              remove={removeLink}
              move={moveLink}
              register={form.register}
              readOnly
              values={values.profileLinks}
            />
          );
        }
        return (
          <div className="space-y-5">
            <ProfileLinksField
              control={form.control}
              fields={linkFields}
              append={appendLink}
              remove={removeLink}
              move={moveLink}
              register={form.register}
              errors={form.formState.errors.profileLinks}
            />
            <ContactVisibilitySelect
              id="visibility-links"
              label={t('Links visibility (public profile)')}
              value={contactVisibility.links}
              onChange={(value) => setContactVisibility((prev) => ({ ...prev, links: value }))}
            />
          </div>
        );
      case 'location':
        // Location UI now lives under About (sidebar entry removed).
        if (isPortfolioLayout) {
          return null;
        }
        if (!isEditing) {
          return hasLocation ? (
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/60 px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950/50">
              <p className={`${profileSectionBodyTextClass} font-semibold text-neutral-900 dark:text-white`}>
                {formatLocationLabel(locationCity, locationCountry)}
              </p>
              <p className={`mt-1 ${profileSectionMutedTextClass}`}>{t('Timezone: {timezoneId}', { timezoneId })}</p>
            </div>
          ) : (
            <ProfileReadOnlyField
              label={t('Location')}
              value={null}
              emptyLabel={t('Location not configured')}
              variant={fieldVariant}
            />
          );
        }
        return (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => void enableLocation()}
              disabled={detectingLocation}
              className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-5 py-2.5 text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
            >
              {detectingLocation && <LoadingSpinner size="sm" />}
              {hasLocation ? t('Refresh location') : t('Enable location (required)')}
            </button>
            {hasLocation ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5 text-[15px] leading-relaxed text-emerald-900 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
                <p className="font-medium">{formatLocationLabel(locationCity, locationCountry)}</p>
                <p className="mt-1 text-emerald-800/80 dark:text-emerald-300/80">{t('Timezone: {timezoneId}', { timezoneId })}</p>
              </div>
            ) : (
              <p className="text-[15px] leading-relaxed text-amber-700 dark:text-amber-300">
                {t('You must enable location before saving your information.')}
              </p>
            )}
            {form.formState.errors.timezoneId ? (
              <p className="text-sm text-red-600">{form.formState.errors.timezoneId.message}</p>
            ) : null}
          </div>
        );
      case 'contact':
        if (isPortfolioLayout) {
          return (
            <PortfolioContactStudio
              key="contact"
              emails={values.contactEmails.map((entry) => ({ id: entry.id, value: entry.value ?? '' }))}
              phones={values.contactPhones.map((entry) => ({ id: entry.id, value: entry.value ?? '' }))}
              addresses={values.contactAddresses.map((entry) => ({ id: entry.id, value: entry.value ?? '' }))}
              visibility={{
                email: contactVisibility.email,
                phone: contactVisibility.phone,
                address: contactVisibility.address,
              }}
              onVisibilityChange={(key, level) => void persistPortfolioVisibility(key, level)}
              onSave={persistPortfolioContact}
            />
          );
        }
        if (!isEditing) {
          return (
            <div className="space-y-4">
              <ProfileReadOnlyField
                label={t('Professional address')}
                value={
                  primaryContactValue(values.contactAddresses, values.contactAddress) || null
                }
                variant={fieldVariant}
              />
              <div className={isPortfolioLayout ? 'grid gap-0 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-2'}>
                <ProfileReadOnlyField
                  label={t('Phone')}
                  value={formatPhoneDisplay(
                    primaryContactValue(values.contactPhones, values.contactPhone)
                  )}
                  variant={fieldVariant}
                />
                <ProfileReadOnlyField
                  label={t('Contact email')}
                  value={
                    primaryContactValue(values.contactEmails, values.contactEmail) || user.email
                  }
                  variant={fieldVariant}
                />
              </div>
            </div>
          );
        }
        return (
          <div className="space-y-5">
            <div>
              <label htmlFor="contactAddress" className={profileFormLabelClass}>
                {t('Professional address')}
              </label>
              <input
                id="contactAddress"
                type="text"
                placeholder={t('e.g. Paris, France or 12 Rue de l\'Innovation, 75001 Paris')}
                className={profileFormInputClass}
                value={values.contactAddress ?? ''}
                onChange={(event) => {
                  const next = event.target.value;
                  form.setValue('contactAddress', next, { shouldDirty: true });
                  const current = form.getValues('contactAddresses');
                  if (current.length === 0) {
                    form.setValue(
                      'contactAddresses',
                      [{ ...createEmptyContactEntry(0), value: next }],
                      { shouldDirty: true }
                    );
                  } else {
                    form.setValue(
                      'contactAddresses',
                      current.map((entry, index) =>
                        index === 0 ? { ...entry, value: next } : entry
                      ),
                      { shouldDirty: true }
                    );
                  }
                }}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="contactPhone" className={profileFormLabelClass}>
                  {t('Phone')}
                </label>
                <div className="mt-2">
                  <PhoneInput
                    id="contactPhone"
                    value={values.contactPhone ?? ''}
                    onChange={(v) => {
                      form.setValue('contactPhone', v, { shouldDirty: true });
                      const current = form.getValues('contactPhones');
                      if (current.length === 0) {
                        form.setValue(
                          'contactPhones',
                          [{ ...createEmptyContactEntry(0), value: v }],
                          { shouldDirty: true }
                        );
                      } else {
                        form.setValue(
                          'contactPhones',
                          current.map((entry, index) =>
                            index === 0 ? { ...entry, value: v } : entry
                          ),
                          { shouldDirty: true }
                        );
                      }
                    }}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="contactEmail" className={profileFormLabelClass}>
                  {t('Contact email')}
                </label>
                <input
                  id="contactEmail"
                  type="email"
                  placeholder={user?.email ?? 'contact@yourbrand.com'}
                  className={profileFormInputClass}
                  value={values.contactEmail ?? ''}
                  onChange={(event) => {
                    const next = event.target.value;
                    form.setValue('contactEmail', next, { shouldDirty: true });
                    const current = form.getValues('contactEmails');
                    if (current.length === 0) {
                      form.setValue(
                        'contactEmails',
                        [{ ...createEmptyContactEntry(0), value: next }],
                        { shouldDirty: true }
                      );
                    } else {
                      form.setValue(
                        'contactEmails',
                        current.map((entry, index) =>
                          index === 0 ? { ...entry, value: next } : entry
                        ),
                        { shouldDirty: true }
                      );
                    }
                  }}
                />
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-5 dark:border-neutral-800 dark:bg-neutral-950/40">
              <p className={`${profileSectionBodyTextClass} font-semibold text-neutral-900 dark:text-white`}>
                {t('Public visibility')}
              </p>
              <p className={`mt-1.5 ${profileSectionMutedTextClass}`}>
                {t('Public = everyone · Members only = signed-in users · Hidden = never shown')}
              </p>
              <div className="mt-5 space-y-4">
                <ContactVisibilitySelect
                  id="visibility-address"
                  label={t('Address')}
                  value={contactVisibility.address}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, address: value }))}
                />
                <ContactVisibilitySelect
                  id="visibility-phone"
                  label={t('Phone')}
                  value={contactVisibility.phone}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, phone: value }))}
                />
                <ContactVisibilitySelect
                  id="visibility-email"
                  label={t('Email')}
                  value={contactVisibility.email}
                  onChange={(value) => setContactVisibility((prev) => ({ ...prev, email: value }))}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const sectionDisplayLabel =
    sectionLabelOverrides[activeSection] || t(currentSection.label);
  const sectionDisplayDescription = isPortfolioLayout
    ? currentSection.description.replace(
        /Highlight your background.*/,
        'Highlight your career background and past achievements with maximum space.'
      )
    : currentSection.description;

  return (
    <div className="w-full space-y-4">
      {loadError ? <ErrorAlert message={loadError} /> : null}
      {locationError ? (
        <ErrorAlert message={locationError} onDismiss={() => setLocationError(null)} />
      ) : null}

      {loadingProfile ? (
        <CreatorStudioProfileTabSkeleton layout={isPortfolioLayout && !sectionsNavTop ? 'rail' : 'pills'} />
      ) : (
        <form
          onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
          noValidate
          style={
            revealAfterSkeleton
              ? { animation: 'pf-workspace-panel-in 420ms cubic-bezier(0.16, 1, 0.3, 1) backwards' }
              : undefined
          }
        >
          <div
            className={
              sectionsNavTop
                ? `grid items-start gap-6${showProfileHero ? ' pt-12 sm:pt-14' : ''}`
                : isPortfolioLayout
                ? `grid items-start gap-5 md:gap-8 lg:gap-10 ${
                    portfolioNavSide === 'right'
                      ? `md:grid-cols-[minmax(0,1fr)_auto] ${actionsColumn ? ' xl:grid-cols-[auto_minmax(0,1fr)_auto]' : ''}`
                      : 'md:grid-cols-[auto_minmax(0,1fr)]'
                  }`
                : 'grid items-start gap-5 md:grid-cols-[minmax(0,1fr)_15rem] md:gap-6'
            }
          >
            {/* Portfolio: the News rail (sticky on scroll) — the "Sections" box, then the actions box; from
                xl the actions box moves to a column of its own on the left (three columns, the form in
                the middle). Below xl three columns would squeeze the form, so it stays in the rail. */}
            {actionsColumn ? (
              <div className="hidden self-start xl:col-start-1 xl:row-start-1 xl:block">
                <ProfileSectionStickyAside className="w-[232px]" surfaceClassName="flex w-full max-w-full min-w-0 flex-col pb-6">
                  {railActions}
                </ProfileSectionStickyAside>
              </div>
            ) : null}
            {sectionsNavTop ? (
              overviewSections ? null : renderSectionPills()
            ) : isPortfolioLayout ? (
              <ProfileSectionStickyAside
                className={`w-[16.5rem] lg:w-[300px] ${
                  portfolioNavSide === 'right'
                    ? ` md:col-start-2 md:row-start-1${actionsColumn ? ' xl:col-start-3' : ''}`
                    : ''
                }`}
                surfaceClassName="flex w-full max-w-full min-w-0 flex-col gap-6 pb-6"
                scrollable
              >
                {renderSectionNav('desktop')}
              </ProfileSectionStickyAside>
            ) : null}

            <div
              className={
                isPortfolioLayout
                  ? `order-2 min-h-[480px] min-w-0 md:order-none${
                      portfolioNavSide === 'right'
                        ? ` md:col-start-1 md:row-start-1${actionsColumn ? ' xl:col-start-2' : ''}`
                        : ''
                    }`
                  : 'order-2 min-h-[480px] min-w-0 md:order-none md:col-start-1 md:row-start-1'
              }
            >
              <div
                ref={isPortfolioLayout ? portfolioInfoCardRef : undefined}
                className={
                  isPortfolioLayout
                    ? 'flex min-h-[480px] flex-col gap-6'
                    : 'flex min-h-[480px] flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] dark:border-neutral-700/50 dark:bg-[#171717] dark:shadow-[0_6px_20px_rgba(0,0,0,0.22)]'
                }
              >
                {/* The hero's section toolbar (visibility, Edit / Add) is My Portfolio's inline editing;
                    My Profile's sections carry their own Edit pill and drawer instead. */}
                {isPortfolioLayout && !sectionDrawers ? (
                  <PortfolioProfileHero
                    showIdentity={showProfileHero}
                    onPreview={onPortfolioPreview}
                    name={values.fullName || user.fullName || ''}
                    avatarUrl={profileAvatarUrl ?? user.avatarUrl}
                    isAvailable={values.isAvailable}
                    availabilityLabel={values.availabilityLabel}
                    {...(isPortfolioChromeSection && activeSection !== 'about' && activeSection !== 'aboutPage'
                      ? {
                          aboutChromeOpen: portfolioChromeOpen,
                          saving,
                          ...(isPortfolioDualEditSection(activeSection)
                            ? {
                                aboutEditMode: portfolioEditMode,
                                onAboutEditModeChange: setPortfolioEditMode,
                                aboutGlobalHasChanges: portfolioGlobalHasChanges,
                                onAboutGlobalConfirm: () => {
                                  void portfolioGlobalConfirmRef.current?.();
                                },
                              }
                            : {}),
                          onAboutToggle: () => {
                            if (portfolioChromeOpen) {
                              const closeChrome = () => {
                                setPortfolioChromeOpen(false);
                                setPortfolioEditMode('individual');
                                setPortfolioGlobalHasChanges(false);
                                portfolioGlobalConfirmRef.current = null;
                                setToolsDeleteMode(false);
                                setToolsAddingItem(false);
                                setStackDeleteMode(false);
                                setStackAddingItem(false);
                                setFaqDeleteMode(false);
                                setFaqAddingItem(false);
                                setServicesDeleteMode(false);
                                setServicesAddingItem(false);
                                setPortfolioDeleteMode(false);
                                setPortfolioAddingItem(false);
                                setProductsAddingItem(false);
                                setTeamDeleteMode(false);
                                setTeamAddingItem(false);
                                setGalleryDeleteMode(false);
                                setGalleryAddingItem(false);
                                setLinksDeleteMode(false);
                                setLinksAddingItem(false);
                                setExperienceDeleteMode(false);
                                setContactDeleteMode(false);
                                setContactAddingKind(null);
                              };

                              if (activeSection === 'portfolio' || activeSection === 'team') {
                                const confirm = portfolioGlobalConfirmRef.current;
                                if (confirm) {
                                  void (async () => {
                                    try {
                                      await confirm();
                                    } catch {
                                      // Keep chrome open so the user can fix/retry.
                                      return;
                                    }
                                    closeChrome();
                                  })();
                                  return;
                                }
                              }

                              if (activeSection === 'experience') {
                                const current = form.getValues('experienceBlocks');
                                const experienceHasContent = (
                                  block: ReturnType<typeof mapProfileBlockToExperienceBlock>
                                ) =>
                                  block.text.trim().length > 0 ||
                                  block.title.trim().length > 0 ||
                                  block.organization.trim().length > 0 ||
                                  block.period.trim().length > 0 ||
                                  block.location.trim().length > 0 ||
                                  block.mediaUrl.trim().length > 0 ||
                                  block.status != null ||
                                  block.employmentType != null ||
                                  block.tasks.some((item) => item.value.trim()) ||
                                  block.tools.some((item) => item.value.trim()) ||
                                  block.links.some((item) => item.url.trim() || item.label.trim());
                                const filled = current
                                  .map(mapProfileBlockToExperienceBlock)
                                  .filter(experienceHasContent);
                                const years = form.getValues('yearsOfExperience') ?? null;
                                const savedYears =
                                  savedSnapshot.current?.yearsOfExperience ?? null;
                                const payloadChanged =
                                  years !== savedYears ||
                                  JSON.stringify(
                                    serializeProfileBlocks(
                                      filled.map((block, index) => ({
                                        ...createEmptyProfileBlock(index),
                                        title: block.title,
                                        organization: block.organization,
                                        period: block.period,
                                        text: block.text,
                                        status: block.status,
                                        location: block.location,
                                        employmentType: block.employmentType,
                                        mediaUrl: block.mediaUrl,
                                        mediaType: block.mediaType,
                                        tasks: block.tasks,
                                        tools: block.tools,
                                        links: block.links,
                                      }))
                                    )
                                  ) !==
                                    JSON.stringify(
                                      serializeProfileBlocks(
                                        savedSnapshot.current?.experienceBlocks ?? []
                                      )
                                    );
                                if (filled.length !== current.length) {
                                  form.setValue(
                                    'experienceBlocks',
                                    current.filter((block) =>
                                      experienceHasContent(mapProfileBlockToExperienceBlock(block))
                                    ),
                                    { shouldDirty: false }
                                  );
                                }
                                if (payloadChanged) {
                                  void persistPortfolioExperience({ blocks: filled });
                                }
                              }

                              if (activeSection === 'strengths') {
                                const current = form.getValues('stackItems');
                                const filled = current
                                  .map((item) => ({
                                    value: item.value ?? '',
                                    description: item.description ?? '',
                                    category: item.category ?? '',
                                    level: item.level ?? null,
                                    useCases: item.useCases ?? [],
                                    experienceYears: item.experienceYears ?? null,
                                    experienceLabel: item.experienceLabel ?? '',
                                    currentlyUsed: item.currentlyUsed ?? null,
                                    iconUrl: item.iconUrl ?? null,
                                  }))
                                  .filter((item) => item.value.trim().length > 0);
                                if (filled.length !== current.length) {
                                  form.setValue('stackItems', filled, { shouldDirty: false });
                                }
                                if (
                                  !areStrengthsToolsEqual(
                                    filled,
                                    savedSnapshot.current?.stackItems ?? []
                                  )
                                ) {
                                  void persistPortfolioStack(filled);
                                }
                              }

                              if (activeSection === 'tools') {
                                const current = form.getValues('strengthsTools');
                                const filled = current
                                  .map((item) => ({
                                    value: item.value ?? '',
                                    description: item.description ?? '',
                                    category: item.category ?? '',
                                    level: item.level ?? null,
                                    useCases: item.useCases ?? [],
                                    experienceYears: item.experienceYears ?? null,
                                    experienceLabel: item.experienceLabel ?? '',
                                    currentlyUsed: item.currentlyUsed ?? null,
                                    iconUrl: item.iconUrl ?? null,
                                  }))
                                  .filter((item) => item.value.trim().length > 0);
                                if (filled.length !== current.length) {
                                  form.setValue('strengthsTools', filled, { shouldDirty: false });
                                }
                                if (
                                  !areStrengthsToolsEqual(
                                    filled,
                                    savedSnapshot.current?.strengthsTools ?? []
                                  )
                                ) {
                                  void persistPortfolioStrengths(filled);
                                }
                              }

                              if (activeSection === 'services') {
                                const current = form.getValues('serviceOffers');
                                const filled = current
                                  .filter((service) => service.title.trim().length > 0)
                                  .map((service) => ({
                                    title: service.title ?? '',
                                    description: service.description ?? '',
                                    basePriceCents: service.basePriceCents ?? null,
                                    deadline: service.deadline ?? '',
                                    tasks: service.tasks ?? [],
                                  }));
                                const saved = serializeProfileServices(
                                  savedSnapshot.current?.serviceOffers ?? []
                                );
                                const nextSerialized = serializeProfileServices(
                                  filled.map((service, index) => ({
                                    ...createEmptyProfileService(index),
                                    ...service,
                                  }))
                                );
                                if (filled.length !== current.length) {
                                  form.setValue(
                                    'serviceOffers',
                                    filled.map((service, index) => ({
                                      ...createEmptyProfileService(index),
                                      ...service,
                                    })),
                                    { shouldDirty: false }
                                  );
                                }
                                if (JSON.stringify(nextSerialized) !== JSON.stringify(saved)) {
                                  void persistPortfolioServices(filled);
                                }
                              }

                              if (activeSection === 'faq') {
                                const current = form.getValues('faqItems');
                                const filled = current
                                  .filter(
                                    (item) =>
                                      item.question.trim().length > 0 &&
                                      item.answer.trim().length > 0
                                  )
                                  .map((item) => ({
                                    question: item.question ?? '',
                                    answer: item.answer ?? '',
                                  }));
                                const filledAsForm = filled.map((item, index) => ({
                                  id:
                                    current.find(
                                      (entry) =>
                                        entry.question.trim() === item.question &&
                                        entry.answer.trim() === item.answer
                                    )?.id ??
                                    current[index]?.id ??
                                    crypto.randomUUID(),
                                  sortOrder: index,
                                  question: item.question,
                                  answer: item.answer,
                                }));
                                const saved = serializeFaqItems(
                                  savedSnapshot.current?.faqItems ?? []
                                );
                                const nextSerialized = serializeFaqItems(filledAsForm);
                                if (filled.length !== current.length) {
                                  form.setValue('faqItems', filledAsForm, { shouldDirty: false });
                                }
                                if (
                                  JSON.stringify(
                                    nextSerialized.map(({ question, answer }) => ({
                                      question,
                                      answer,
                                    }))
                                  ) !==
                                  JSON.stringify(
                                    saved.map(({ question, answer }) => ({ question, answer }))
                                  )
                                ) {
                                  void persistPortfolioFaq(filled);
                                }
                              }

                              if (activeSection === 'contact') {
                                exitContactChrome();
                                return;
                              }

                              if (activeSection === 'team') {
                                const current = form.getValues('teamMembers');
                                const filled = current
                                  .filter(
                                    (member) =>
                                      member.name.trim().length > 0 &&
                                      member.responsibility.trim().length > 0
                                  )
                                  .map((member) => ({
                                    name: member.name ?? '',
                                    responsibility: member.responsibility ?? '',
                                    imageUrl: member.imageUrl ?? '',
                                    socialLinks: (member.socialLinks ?? []).map((link) => ({
                                      id: link.id,
                                      platform: link.platform,
                                      label: link.label ?? '',
                                      url: link.url ?? '',
                                      sortOrder: link.sortOrder,
                                    })),
                                  }));
                                const saved = serializeTeamMembers(
                                  savedSnapshot.current?.teamMembers ?? []
                                );
                                const nextSerialized = serializeTeamMembers(
                                  filled.map((member, index) => ({
                                    ...createEmptyTeamMember(index),
                                    ...member,
                                  }))
                                );
                                if (filled.length !== current.length) {
                                  form.setValue(
                                    'teamMembers',
                                    filled.map((member, index) => ({
                                      ...createEmptyTeamMember(index),
                                      ...member,
                                    })),
                                    { shouldDirty: false }
                                  );
                                }
                                if (
                                  JSON.stringify(
                                    nextSerialized.map(
                                      ({ name, responsibility, imageUrl, socialLinks }) => ({
                                        name,
                                        responsibility,
                                        imageUrl,
                                        socialLinks: socialLinks.map(
                                          ({ platform, label, url }) => ({
                                            platform,
                                            label,
                                            url,
                                          })
                                        ),
                                      })
                                    )
                                  ) !==
                                  JSON.stringify(
                                    saved.map(
                                      ({ name, responsibility, imageUrl, socialLinks }) => ({
                                        name,
                                        responsibility,
                                        imageUrl,
                                        socialLinks: socialLinks.map(
                                          ({ platform, label, url }) => ({
                                            platform,
                                            label,
                                            url,
                                          })
                                        ),
                                      })
                                    )
                                  )
                                ) {
                                  void persistPortfolioTeam(filled);
                                }
                              }

                              closeChrome();
                              return;
                            }

                            setToolsDeleteMode(false);
                            setToolsAddingItem(false);
                            setFaqDeleteMode(false);
                            setFaqAddingItem(false);
                            setServicesDeleteMode(false);
                            setServicesAddingItem(false);
                            setPortfolioDeleteMode(false);
                            setPortfolioAddingItem(false);
                            setTeamDeleteMode(false);
                            setTeamAddingItem(false);
                            setGalleryDeleteMode(false);
                            setGalleryAddingItem(false);
                            setLinksDeleteMode(false);
                            setLinksAddingItem(false);
                            setExperienceDeleteMode(false);
                            setContactDeleteMode(false);
                            setContactAddingKind(null);
                            setPortfolioChromeOpen(true);
                          },
                          ...(activeSection === 'experience'
                            ? {
                                // Inline studio owns editing, add and remove.
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.experience,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('experience', level);
                                },
                              }
                            : {}),
                          ...(activeSection === 'services'
                            ? {
                                // Per-card hover/touch edit+delete — no section Edit/Delete chrome.
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.services,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('services', level);
                                },
                                hideHeroActions: servicesAddingItem,
                                onAddEntry: () => {
                                  if (servicesAddingItem) return;
                                  setServicesDeleteMode(false);
                                  const current = form.getValues('serviceOffers');
                                  if (current.length >= MAX_SERVICES) {
                                    pushInsertionLimitFeedback({
                                      limit: MAX_SERVICES,
                                      unit: 'services',
                                    });
                                    return;
                                  }
                                  appendService(createEmptyProfileService(current.length));
                                  setServicesAddingItem(true);
                                },
                                addEntryLabel: 'Add service',
                              }
                            : {}),
                          ...(activeSection === 'portfolio'
                            ? {
                                // The showcase owns add, edit, reorder and delete inline.
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.portfolio,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('portfolio', level);
                                },
                                hideHeroActions: portfolioAddingItem,
                              }
                            : {}),
                          ...(activeSection === 'products'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                hideHeroActions: productsAddingItem,
                                ...(productsItemCount > 0
                                  ? {
                                      onAddEntry: () => {
                                        if (productsAddingItem) return;
                                        if (productsItemCount >= MAX_PORTFOLIO_PRODUCTS) {
                                          pushInsertionLimitFeedback({
                                            limit: MAX_PORTFOLIO_PRODUCTS,
                                            unit: 'products',
                                          });
                                          return;
                                        }
                                        setProductsAddingItem(true);
                                      },
                                      addEntryLabel: 'Add product',
                                    }
                                  : {}),
                              }
                            : {}),
                          ...(activeSection === 'faq'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.faq,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('faq', level);
                                },
                              }
                            : {}),
                          ...(activeSection === 'team'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.team,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('team', level);
                                },
                              }
                            : {}),
                          ...(activeSection === 'gallery'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.gallery,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('gallery', level);
                                },
                              }
                            : {}),
                          ...(activeSection === 'links'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                visibility: contactVisibility.links,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('links', level);
                                },
                              }
                            : {}),
                          ...(activeSection === 'contact'
                            ? {
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                                hideHeroActions: contactAddingKind != null,
                              }
                            : {}),
                          ...(activeSection === 'strengths'
                            ? {
                                visibility: contactVisibility.profileStack,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('profileStack', level);
                                },
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                              }
                            : {}),
                          ...(activeSection === 'tools'
                            ? {
                                visibility: contactVisibility.strengthsTools,
                                onVisibilityChange: (level: ContactVisibilityLevel) => {
                                  void persistPortfolioVisibility('strengthsTools', level);
                                },
                                onAboutToggle: undefined,
                                aboutChromeOpen: false,
                              }
                            : {}),
                        }
                      : {})}
                    hideBottomBorder={
                      activeSection === 'services' ||
                      activeSection === 'products' ||
                      activeSection === 'portfolio' ||
                      activeSection === 'team'
                    }
                  />
                ) : null}

                {/* Portfolio: the form is its own card under the hero card; elsewhere this wrapper is
                    layout-neutral (display: contents). */}
                <div
                  className={
                    isPortfolioLayout
                      ? sectionsNavTop
                        ? /* My Profile: the sections sit straight on the page, like the other tabs —
                             a grey card around a whole form only boxed it in. */
                          'flex min-h-[420px] flex-1 flex-col overflow-x-clip'
                        : 'gn-card flex min-h-[420px] flex-1 flex-col overflow-x-clip'
                      : 'contents'
                  }
                >
                {isPortfolioLayout && !sectionsNavTop ? renderPortfolioMobileTabs() : null}

                <div
                  className={`flex-1 ${
                    isPortfolioLayout
                      ? sectionsNavTop
                        ? 'px-4 pt-0 sm:px-0'
                        : showProfileHero
                          ? 'px-5 pt-5 sm:px-7 sm:pt-7'
                          : 'px-5 pt-0 sm:px-7 sm:pt-0.5'
                      : 'p-5 sm:p-7'
                  }`}
                >
                  {!isPortfolioLayout ? (
                    <header className="mb-8 border-b border-neutral-200/60 pb-6 dark:border-neutral-700/40">
                      <div className="flex items-center gap-4">
                        <ProfileSectionNavIcon sectionId={activeSection} variant="header" />
                        <div className="min-w-0 flex-1">
                          <h2 className={profileSectionHeaderTitleClass}>{sectionDisplayLabel}</h2>
                          <p className={profileSectionHeaderDescClass}>{sectionDisplayDescription}</p>
                        </div>
                      </div>
                    </header>
                  ) : null}

                  {submitError && isFormSection ? (
                    <div className="mb-4">
                      <ErrorAlert message={submitError} onDismiss={() => setSubmitError(null)} />
                    </div>
                  ) : null}

                  {overviewSections ? (
                    <ProfileSectionsOverview
                      sections={overviewSections}
                      values={values}
                      visibility={contactVisibility}
                      memberSince={memberSince}
                      typicalResponseTime={typicalResponseTime}
                      showProviderFields={showProviderAboutFields}
                      onEdit={openSectionDrawer}
                      onVisibilityChange={(key, level) => void persistPortfolioVisibility(key, level)}
                    />
                  ) : sectionDrawers && isProfileDrawerSection(activeSection) ? (
                    <ProfileSectionReadView
                      section={activeSection}
                      title={sectionDisplayLabel}
                      values={values}
                      visibility={contactVisibility}
                      memberSince={memberSince}
                      typicalResponseTime={typicalResponseTime}
                      showProviderFields={showProviderAboutFields}
                      onEdit={() => openSectionDrawer(activeSection)}
                    />
                  ) : (
                    renderSectionContent()
                  )}
                </div>

                {isFormSection ||
                (isPortfolioLayout && activeSection === 'myRole') ? (
                  isPortfolioLayout ? (
                    <PortfolioEditorFooter
                      flush={sectionsNavTop}
                      lastUpdatedLabel={formatLastUpdatedLabel(profileUpdatedAt)}
                      leadingMetaLabel={portfolioSectionItemCountLabel(
                        activeSection,
                        values,
                        portfolioItemCount,
                        productsItemCount
                      )}
                      /* My Profile: member since and response time are part of the General Info read
                         view (response time is edited in its drawer), so the footer is meta only. */
                      metaItems={
                        activeSection === 'about' && !sectionDrawers
                          ? [
                              {
                                label: t('Member since'),
                                value: formatMemberSince(memberSince) ?? '—',
                              },
                              ...(showProviderAboutFields
                                ? [
                                    {
                                      label: t('Response time'),
                                      value: (
                                        <PortfolioFooterSelect
                                          value={typicalResponseTime}
                                          options={TYPICAL_RESPONSE_TIME_OPTIONS}
                                          onChange={(next) =>
                                            void persistPortfolioAboutField('typicalResponseTime', next)
                                          }
                                          disabled={saving}
                                          ariaLabel={t('Typical response time')}
                                        />
                                      ),
                                    },
                                  ]
                                : []),
                            ]
                          : undefined
                      }
                      isEditing={isEditing}
                      saving={saving}
                      hasUnsavedChanges={hasUnsavedChanges}
                      onCancel={cancelEdit}
                      /* No page-wide Edit / Save: My Profile saves per section from its drawers, and
                         My Portfolio's chrome sections save inline. */
                      hidePrimaryActions={
                        sectionDrawers ||
                        isPortfolioChromeSection ||
                        activeSection === 'myRole'
                      }
                      hideTopBorder={
                        activeSection === 'experience' ||
                        activeSection === 'strengths' ||
                        activeSection === 'tools' ||
                        activeSection === 'services' ||
                        activeSection === 'products' ||
                        activeSection === 'portfolio' ||
                        activeSection === 'faq' ||
                        activeSection === 'team' ||
                        activeSection === 'gallery' ||
                        activeSection === 'links' ||
                        activeSection === 'contact' ||
                        activeSection === 'myRole'
                      }
                      onEdit={beginPortfolioEdit}
                    />
                  ) : (
                    <div className="flex justify-end gap-3 border-t border-neutral-200 bg-neutral-50/50 px-5 py-5 dark:border-neutral-800 dark:bg-neutral-950/30 sm:px-7">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            disabled={saving}
                            className="rounded-full border border-neutral-300 px-5 py-2.5 text-[15px] font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-60 dark:border-neutral-600 dark:text-neutral-300 dark:hover:bg-neutral-800"
                          >
                            {t('Cancel')}
                          </button>
                          <button
                            type="submit"
                            disabled={saving || !hasUnsavedChanges}
                            className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-black disabled:opacity-60 dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
                          >
                            {saving ? <LoadingSpinner size="sm" /> : null}
                            {t('Save information')}
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setAvailabilitySchedule(parseAvailabilityHours(values.availabilityHours));
                            setIsEditing(true);
                          }}
                          className="inline-flex items-center gap-2 rounded-full bg-[#111111] px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-black dark:bg-white dark:text-[#111111] dark:hover:bg-neutral-200"
                        >
                          {t('Edit')}
                        </button>
                      )}
                    </div>
                  )
                ) : null}
                </div>
                {/* Phones (no rail): the page's actions under the form, so none is out of reach. */}
                {actionsColumn ? <div className="px-2 md:hidden">{railActions}</div> : null}
              </div>
            </div>

            {!isPortfolioLayout ? (
              <>
                <aside className={`order-1 overflow-hidden rounded-lg ${APP_FIELD} dark:border dark:border-neutral-800 dark:bg-neutral-900 md:hidden`}>
                  {renderSectionNav('mobile')}
                </aside>
                <ProfileSectionStickyAside>{renderSectionNav('desktop')}</ProfileSectionStickyAside>
              </>
            ) : null}
          </div>
        </form>
      )}

      {/* Portaled to <body>, so it sits outside the form above (no implicit submit) and over the page. */}
      {sectionDrawer ? (
        <ProfileSectionEditorDrawer
          section={sectionDrawer.section}
          initialValues={sectionDrawer.values}
          initialVisibility={sectionDrawer.visibility}
          initialResponseTime={sectionDrawer.typicalResponseTime}
          timezoneId={timezoneId ?? ''}
          showProviderFields={showProviderAboutFields}
          onSave={saveProfileSection}
          onClose={() => setSectionDrawer(null)}
        />
      ) : null}
    </div>
  );
}
