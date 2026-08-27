import api from '@/lib/api';
import { normalizeSpringPage } from '@/lib/ecosystem';
import { dedupeSpokenLanguages } from '@/lib/spoken-languages';
import { normalizeCreatorGender } from '@/lib/creator-gender';
import { resolveStorageMediaUrl } from '@/lib/storage-media-url';
import {
  parseProductWhyBlocks,
  serializeProductWhyBlocks,
} from '@/components/marketplace/product-why-block-schema';
import type { PagedResponse, SpringPageRaw, CreatorReputationDto } from '@/types/ecosystem';
import type { CreatorContentItemDto } from '@/types/creator-content';
import type {
  ContentReport,
  FavoriteItem,
  MarketplaceBundleDetail,
  MarketplaceBundleRequest,
  MarketplaceBundleSummary,
  MarketplaceProductGroup,
  MarketplaceProductGroupRequest,
  MarketplaceComment,
  MarketplaceContentDetail,
  MarketplaceContentItem,
  PublicContentFeedItem,
  PublicContentFeedPage,
  MarketplaceCreatorPublicProfile,
  MarketplaceCreatorSummary,
  MarketplaceProductDetail,
  MarketplaceProductRequest,
  MarketplaceProductSummary,
  MarketplacePurchase,
  MarketplacePurchaseResponse,
  ProductInitData,
  ProductReview,
  ProductReviewComposerStatus,
  ProductReviewRequest,
  ProductReviewSummary,
  ProductOwnership,
  OwnedProductRaw,
  PurchaseAccessMode,
  PurchaseAccessResponse,
  ReactionCounts,
  ReactionType,
  ReportUpdateRequest,
  ReportReason,
  ReportStatus,
  SocialTargetType,
} from '@/types/marketplace';

type RawRecord = Record<string, unknown>;

function mapTaggedUsers(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((entry) => entry && typeof entry === 'object')
    .map((entry) => {
      const row = entry as RawRecord;
      return {
        id: String(row.id ?? ''),
        fullName: String(row.fullName ?? 'User'),
        avatarUrl: row.avatarUrl != null ? String(row.avatarUrl) : null,
      };
    });
}

function mapContentCreator(raw: unknown): {
  id: string;
  fullName: string;
  username?: string | null;
  avatarUrl: string | null;
  appRole?: string | null;
  specialite?: string | null;
  specialties?: string[];
} {
  if (!raw || typeof raw !== 'object') {
    return { id: '', fullName: 'Creator', avatarUrl: null };
  }
  const row = raw as RawRecord;
  return {
    id: String(row.id ?? ''),
    fullName: String(row.fullName ?? 'Creator'),
    username: row.username != null ? String(row.username) : null,
    avatarUrl: row.avatarUrl != null ? String(row.avatarUrl) : null,
    appRole: row.appRole != null ? String(row.appRole) : null,
    specialite: row.specialite != null ? String(row.specialite) : null,
    specialties: Array.isArray(row.specialties) ? row.specialties.map((item) => String(item)) : [],
  };
}

export function mapPublicContentFeedItem(raw: RawRecord): PublicContentFeedItem {
  return {
    id: String(raw.id ?? ''),
    title: raw.title != null ? String(raw.title) : null,
    genre: raw.genre != null ? String(raw.genre) : null,
    description: raw.description != null ? String(raw.description) : null,
    mediaUrl: raw.mediaUrl != null ? String(raw.mediaUrl) : null,
    mediaType: raw.mediaType != null ? (String(raw.mediaType) as 'FILE' | 'GIF') : null,
    textColor: raw.textColor != null ? String(raw.textColor) : null,
    moodLabel: raw.moodLabel != null ? String(raw.moodLabel) : null,
    moodEmoji: raw.moodEmoji != null ? String(raw.moodEmoji) : null,
    taggedUsers: mapTaggedUsers(raw.taggedUsers),
    priceInfo: raw.priceInfo != null ? String(raw.priceInfo) : null,
    toolsUsed: Array.isArray(raw.toolsUsed) ? raw.toolsUsed.map((t) => String(t)) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    isPublic: Boolean(raw.isPublic),
    commentsEnabled: raw.commentsEnabled !== false,
    pinned: Boolean(raw.pinned),
    views: typeof raw.views === 'number' ? raw.views : Number(raw.views ?? 0),
    likes: typeof raw.likes === 'number' ? raw.likes : Number(raw.likes ?? 0),
    createdAt: String(raw.createdAt ?? new Date().toISOString()),
    creator: mapContentCreator(raw.creator),
  };
}

function mapContentItem(raw: RawRecord): MarketplaceContentItem {
  const role = raw.role != null ? String(raw.role).trim() : '';
  const category = raw.category != null ? String(raw.category).trim() : '';
  return {
    id: String(raw.id ?? ''),
    title: String(raw.title ?? ''),
    genre: raw.genre != null ? String(raw.genre) : null,
    role: role || null,
    category: category || null,
    description: raw.description != null ? String(raw.description) : null,
    mediaUrl: raw.mediaUrl != null ? String(raw.mediaUrl) : null,
    mediaType: raw.mediaType != null ? (String(raw.mediaType) as 'FILE' | 'GIF') : null,
    textColor: raw.textColor != null ? String(raw.textColor) : null,
    moodLabel: raw.moodLabel != null ? String(raw.moodLabel) : null,
    moodEmoji: raw.moodEmoji != null ? String(raw.moodEmoji) : null,
    taggedUsers: mapTaggedUsers(raw.taggedUsers),
    priceInfo: raw.priceInfo != null ? String(raw.priceInfo) : null,
    toolsUsed: Array.isArray(raw.toolsUsed) ? raw.toolsUsed.map((t) => String(t)) : [],
    tags: Array.isArray(raw.tags) ? raw.tags.map((t) => String(t)) : [],
    creatorId: raw.creator != null && typeof raw.creator === 'object'
      ? String((raw.creator as RawRecord).id ?? '')
      : null,
    linkUrl:
      raw.linkUrl != null
        ? String(raw.linkUrl)
        : raw.link != null
          ? String(raw.link)
          : raw.priceInfo != null && /^https?:\/\//i.test(String(raw.priceInfo))
            ? String(raw.priceInfo)
            : null,
  };
}

export function normalizeContentItem(raw: RawRecord): MarketplaceContentItem {
  return mapContentItem(raw);
}

export function normalizeCreatorSummary(raw: RawRecord): MarketplaceCreatorSummary {
  const userId = raw.userId != null ? String(raw.userId) : raw.id != null ? String(raw.id) : undefined;
  const resolvedAvatar = resolveStorageMediaUrl(raw.avatarUrl != null ? String(raw.avatarUrl) : null);
  return {
    id: userId,
    userId,
    fullName: String(raw.fullName ?? 'Creator'),
    username: raw.username != null ? String(raw.username) : null,
    avatarUrl: resolvedAvatar || null,
    specialite:
      (raw.specialite ?? raw.niche) != null ? String(raw.specialite ?? raw.niche) : null,
    specialties: Array.isArray(raw.specialties) ? raw.specialties.map((item) => String(item)) : [],
    specialtyTags: Array.isArray(raw.specialtyTags) ? raw.specialtyTags.map((item) => String(item)) : [],
    bio: raw.bio != null ? String(raw.bio) : null,
    isVerified: Boolean(raw.isVerified),
    isAvailable: raw.isAvailable == null ? true : Boolean(raw.isAvailable),
    availabilityLabel: raw.availabilityLabel != null ? String(raw.availabilityLabel) : null,
    portfolioCount: typeof raw.portfolioCount === 'number' ? raw.portfolioCount : Number(raw.portfolioCount ?? 0),
    productCount: typeof raw.productCount === 'number' ? raw.productCount : Number(raw.productCount ?? 0),
    serviceCount: typeof raw.serviceCount === 'number'
      ? raw.serviceCount
      : Number(
          raw.serviceCount ??
            (Array.isArray(raw.profileServices) ? raw.profileServices.length : 0)
        ),
    averageRating: raw.averageRating != null ? Number(raw.averageRating) : null,
    followerCount: typeof raw.followerCount === 'number' ? raw.followerCount : Number(raw.followerCount ?? 0),
    isFollowing: Boolean(raw.isFollowing),
    nationality: raw.nationality != null ? String(raw.nationality) : null,
    locationCity: raw.locationCity != null ? String(raw.locationCity) : null,
    locationCountry: raw.locationCountry != null ? String(raw.locationCountry) : null,
    yearsOfExperience:
      raw.yearsOfExperience != null && !Number.isNaN(Number(raw.yearsOfExperience))
        ? Number(raw.yearsOfExperience)
        : null,
    distanceKm: raw.distanceKm != null ? Number(raw.distanceKm) : null,
    appRole: raw.appRole != null ? String(raw.appRole) : null,
  };
}

const PROFILE_STRENGTH_LEVELS = new Set(['beginner', 'intermediate', 'advanced', 'expert']);

function mapProfileStrengthTool(raw: unknown): import('@/types/ecosystem').ProfileStrengthTool | null {
  if (typeof raw === 'string') {
    const name = raw.trim();
    return name ? { name, description: null } : null;
  }
  if (!raw || typeof raw !== 'object') return null;
  const record = raw as RawRecord;
  const name = String(record.name ?? record.value ?? '').trim();
  if (!name) return null;
  const description =
    typeof record.description === 'string' && record.description.trim()
      ? record.description.trim()
      : null;
  const category =
    typeof record.category === 'string' && record.category.trim() ? record.category.trim() : null;
  const rawLevel = typeof record.level === 'string' ? record.level.trim().toLowerCase() : '';
  const level = PROFILE_STRENGTH_LEVELS.has(rawLevel)
    ? (rawLevel as import('@/types/ecosystem').ProfileStrengthToolLevel)
    : null;
  const useCases = Array.isArray(record.useCases)
    ? record.useCases
        .map((item) => (typeof item === 'string' ? item.trim() : ''))
        .filter(Boolean)
    : undefined;
  const experienceYears =
    typeof record.experienceYears === 'number' && Number.isFinite(record.experienceYears)
      ? Math.max(0, Math.round(record.experienceYears))
      : null;
  const experienceLabel =
    typeof record.experienceLabel === 'string' && record.experienceLabel.trim()
      ? record.experienceLabel.trim()
      : null;
  const currentlyUsed = typeof record.currentlyUsed === 'boolean' ? record.currentlyUsed : null;
  const iconUrl =
    typeof record.iconUrl === 'string' && record.iconUrl.trim() ? record.iconUrl.trim() : null;
  return {
    name,
    description,
    category,
    level,
    useCases,
    experienceYears,
    experienceLabel,
    currentlyUsed,
    iconUrl,
  };
}

function mapProfileServiceItem(raw: RawRecord, index: number) {
  const tasks = Array.isArray(raw.tasks)
    ? raw.tasks
        .map((task) => (task != null ? String(task).trim() : ''))
        .filter(Boolean)
    : [];
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag) => (tag != null ? String(tag).trim() : '')).filter(Boolean)
    : [];
  return {
    id: raw.id != null ? String(raw.id) : `service-${index}`,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    title: raw.title != null ? String(raw.title) : '',
    description: raw.description != null ? String(raw.description) : '',
    basePriceCents: raw.basePriceCents != null ? Number(raw.basePriceCents) : null,
    deadline: raw.deadline != null ? String(raw.deadline) : null,
    tasks,
    specialty: raw.specialty != null ? String(raw.specialty) : null,
    pricingType: raw.pricingType != null ? String(raw.pricingType) : null,
    coverImageUrl: raw.coverImageUrl != null ? String(raw.coverImageUrl) : null,
    status: raw.status != null ? String(raw.status) : 'ACTIVE',
    tags,
    currency: raw.currency != null ? String(raw.currency) : 'EUR',
    deliveryValue: raw.deliveryValue != null ? Number(raw.deliveryValue) : null,
    deliveryUnit: raw.deliveryUnit != null ? String(raw.deliveryUnit) : null,
  };
}

function mapFaqItem(raw: RawRecord, index: number) {
  return {
    id: raw.id != null ? String(raw.id) : `faq-${index}`,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    question: raw.question != null ? String(raw.question) : '',
    answer: raw.answer != null ? String(raw.answer) : '',
  };
}

const TEAM_SOCIAL_PLATFORMS = new Set([
  'FACEBOOK',
  'X',
  'TWITTER',
  'LINKEDIN',
  'INSTAGRAM',
  'YOUTUBE',
  'GITHUB',
  'WEBSITE',
  'EMAIL',
  'OTHER',
]);

function mapTeamSocialLink(
  raw: RawRecord,
  index: number,
  memberIndex: number
): import('@/types/ecosystem').ProfileTeamSocialLink | null {
  const url = raw.url != null ? String(raw.url).trim() : '';
  if (!url) return null;
  const platformRaw = raw.platform != null ? String(raw.platform).toUpperCase() : 'OTHER';
  const platform = TEAM_SOCIAL_PLATFORMS.has(platformRaw)
    ? (platformRaw as import('@/types/ecosystem').TeamSocialPlatform)
    : 'OTHER';
  return {
    id: raw.id != null ? String(raw.id) : `team-social-${memberIndex}-${index}`,
    platform,
    label: raw.label != null ? String(raw.label) : null,
    url,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
  };
}

function mapTeamMember(
  raw: RawRecord,
  index: number
): import('@/types/ecosystem').ProfileTeamMember {
  const socialLinks = Array.isArray(raw.socialLinks)
    ? raw.socialLinks
        .map((item, linkIndex) =>
          item && typeof item === 'object'
            ? mapTeamSocialLink(item as RawRecord, linkIndex, index)
            : null
        )
        .filter((item): item is import('@/types/ecosystem').ProfileTeamSocialLink => Boolean(item))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  return {
    id: raw.id != null ? String(raw.id) : `team-${index}`,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    name: raw.name != null ? String(raw.name) : '',
    responsibility: raw.responsibility != null ? String(raw.responsibility) : '',
    imageUrl: resolveStorageMediaUrl(raw.imageUrl != null ? String(raw.imageUrl) : null) || null,
    socialLinks,
  };
}

function mapGalleryItem(
  raw: RawRecord,
  index: number
): import('@/types/ecosystem').ProfileGalleryItem {
  const mediaUrl = resolveStorageMediaUrl(raw.mediaUrl != null ? String(raw.mediaUrl) : '');
  const mediaTypeRaw = raw.mediaType != null ? String(raw.mediaType).toUpperCase() : null;
  const mediaType =
    mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;
  return {
    id: raw.id != null ? String(raw.id) : `gallery-${index}`,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    title: raw.title != null ? String(raw.title) : '',
    mediaUrl,
    mediaType,
  };
}

function mapAboutUs(raw: unknown): import('@/types/ecosystem').ProfileAboutUs | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as RawRecord;
  const founderRaw =
    record.founder && typeof record.founder === 'object' && !Array.isArray(record.founder)
      ? (record.founder as RawRecord)
      : null;
  const tasks = Array.isArray(record.tasks)
    ? record.tasks.map((item) => String(item ?? '').trim()).filter(Boolean).slice(0, 12)
    : [];
  const imageUrls = Array.isArray(record.imageUrls)
    ? record.imageUrls
        .map((item) => (item != null ? String(item).trim() : ''))
        .filter(Boolean)
        .slice(0, 2)
    : [];
  const title = record.title != null ? String(record.title).trim() : '';
  const description = record.description != null ? String(record.description).trim() : '';
  const quote = record.quote != null ? String(record.quote).trim() : '';
  const founderName = founderRaw?.name != null ? String(founderRaw.name).trim() : '';
  const founderFunction = founderRaw?.function != null ? String(founderRaw.function).trim() : '';
  const founderLogo = founderRaw?.logoUrl != null ? String(founderRaw.logoUrl).trim() : '';
  if (
    !title &&
    !description &&
    tasks.length === 0 &&
    imageUrls.length === 0 &&
    !quote &&
    !founderName &&
    !founderFunction &&
    !founderLogo
  ) {
    return null;
  }
  return {
    title: title || null,
    description: description || null,
    tasks,
    imageUrls,
    quote: quote || null,
    founder: {
      logoUrl: founderLogo || null,
      name: founderName || null,
      function: founderFunction || null,
    },
  };
}

function mapProfileLink(raw: RawRecord, index: number) {
  return {
    id: raw.id != null ? String(raw.id) : `link-${index}`,
    type: raw.type != null ? String(raw.type) : 'CUSTOM',
    label: raw.label != null ? String(raw.label) : '',
    url: raw.url != null ? String(raw.url) : '',
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    platform: raw.platform != null ? String(raw.platform) : null,
  };
}

export function normalizeCreatorProfile(raw: RawRecord): MarketplaceCreatorPublicProfile {
  const recentPosts = Array.isArray(raw.recentPosts)
    ? raw.recentPosts.map((item) => mapContentItem(item as RawRecord))
    : [];
  const portfolio = Array.isArray(raw.portfolio)
    ? raw.portfolio.map((item) => mapContentItem(item as RawRecord))
    : Array.isArray(raw.contents)
      ? raw.contents.map((item) => mapContentItem(item as RawRecord))
      : recentPosts;

  const portfolioPosts = Array.isArray(raw.portfolioPosts)
    ? raw.portfolioPosts.map((item) => mapContentItem(item as RawRecord))
    : [];

  const portfolioWorks = Array.isArray(raw.portfolioWorks)
    ? raw.portfolioWorks
        .map((item) => {
          if (!item || typeof item !== 'object') return null;
          const row = item as RawRecord;
          const id = row.id != null ? String(row.id) : '';
          const title = row.title != null ? String(row.title) : '';
          const imageUrl = row.imageUrl != null ? String(row.imageUrl) : '';
          if (!id || !title || !imageUrl) return null;
          return {
            id,
            sortOrder: typeof row.sortOrder === 'number' ? row.sortOrder : 0,
            role: row.role != null ? String(row.role) : null,
            category: row.category != null ? String(row.category) : null,
            title,
            description: row.description != null ? String(row.description) : null,
            stack: Array.isArray(row.stack) ? row.stack.map((t) => String(t)) : [],
            imageUrl,
            link: row.link != null ? String(row.link) : null,
          };
        })
        .filter((item): item is NonNullable<typeof item> => Boolean(item))
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  const portfolioPostsFromWorks: MarketplaceContentItem[] = portfolioWorks.map((work) => ({
    id: work.id,
    title: work.title,
    genre: work.category?.trim() || work.role,
    role: work.role?.trim() || null,
    category: work.category?.trim() || null,
    description: work.description,
    mediaUrl: work.imageUrl,
    mediaType: 'FILE',
    toolsUsed: work.stack,
    tags: [],
    linkUrl: work.link,
  }));

  const resolvedPortfolioPosts =
    portfolioPostsFromWorks.length > 0 ? portfolioPostsFromWorks : portfolioPosts;

  let socialLinks: Record<string, string> | null = null;
  if (Array.isArray(raw.socialLinks)) {
    socialLinks = {};
    for (const entry of raw.socialLinks) {
      if (!entry || typeof entry !== 'object') continue;
      const link = entry as RawRecord;
      const platform = String(link.platform ?? link.name ?? 'Link');
      const url = link.url != null ? String(link.url) : '';
      if (url) socialLinks[platform] = url;
    }
  } else if (raw.socialLinks && typeof raw.socialLinks === 'object') {
    socialLinks = raw.socialLinks as Record<string, string>;
  }

  const userId = raw.userId != null ? String(raw.userId) : String(raw.id ?? '');

  return {
    id: userId,
    fullName: String(raw.fullName ?? 'Creator'),
    username: raw.username != null ? String(raw.username) : null,
    avatarUrl: raw.avatarUrl != null ? String(raw.avatarUrl) : null,
    specialite:
      (raw.specialite ?? raw.niche) != null ? String(raw.specialite ?? raw.niche) : null,
    specialties: Array.isArray(raw.specialties) ? raw.specialties.map((item) => String(item)) : [],
    specialtyTags: Array.isArray(raw.specialtyTags) ? raw.specialtyTags.map((item) => String(item)) : [],
    bio: raw.bio != null ? String(raw.bio) : null,
    isVerified: Boolean(raw.isVerified),
    portfolioCount: typeof raw.portfolioCount === 'number' ? raw.portfolioCount : Number(raw.portfolioCount ?? 0),
    contentCount: typeof raw.contentCount === 'number' ? raw.contentCount : Number(raw.contentCount ?? 0),
    productCount: typeof raw.productCount === 'number' ? raw.productCount : Number(raw.productCount ?? 0),
    serviceCount: typeof raw.serviceCount === 'number' ? raw.serviceCount : Number(raw.serviceCount ?? 0),
    averageRating: raw.averageRating != null ? Number(raw.averageRating) : null,
    socialLinks,
    studioHeaderLayout: raw.studioHeaderLayout != null ? String(raw.studioHeaderLayout) : 'BANNER',
    studioHeaderContentStyle:
      raw.studioHeaderContentStyle != null ? String(raw.studioHeaderContentStyle) : 'DEFAULT',
    studioTabNavAlign: raw.studioTabNavAlign != null ? String(raw.studioTabNavAlign) : 'LEFT',
    locationCity: raw.locationCity != null ? String(raw.locationCity) : null,
    locationCountry: raw.locationCountry != null ? String(raw.locationCountry) : null,
    locationLat:
      raw.locationLat != null && Number.isFinite(Number(raw.locationLat))
        ? Number(raw.locationLat)
        : null,
    locationLng:
      raw.locationLng != null && Number.isFinite(Number(raw.locationLng))
        ? Number(raw.locationLng)
        : null,
    portfolio,
    recentPosts: portfolio,
    followerCount: typeof raw.followerCount === 'number' ? raw.followerCount : Number(raw.followerCount ?? 0),
    isFollowing: Boolean(raw.isFollowing),
    phone: raw.phone != null ? String(raw.phone) : null,
    websiteUrl: raw.websiteUrl != null ? String(raw.websiteUrl) : null,
    contactEmail: (() => {
      const legacy = raw.contactEmail != null ? String(raw.contactEmail) : null;
      const fromList = Array.isArray(raw.contactEmails)
        ? raw.contactEmails
            .map((item) => {
              if (!item || typeof item !== 'object') return '';
              return String((item as { value?: unknown }).value ?? '').trim();
            })
            .find(Boolean)
        : undefined;
      return fromList || legacy;
    })(),
    contactPhone: (() => {
      const legacy =
        raw.contactPhone != null
          ? String(raw.contactPhone)
          : raw.phone != null
            ? String(raw.phone)
            : null;
      const fromList = Array.isArray(raw.contactPhones)
        ? raw.contactPhones
            .map((item) => {
              if (!item || typeof item !== 'object') return '';
              return String((item as { value?: unknown }).value ?? '').trim();
            })
            .find(Boolean)
        : undefined;
      return fromList || legacy;
    })(),
    availabilityHours: raw.availabilityHours != null ? String(raw.availabilityHours) : null,
    isAvailable: raw.isAvailable == null ? true : Boolean(raw.isAvailable),
    availabilityLabel: raw.availabilityLabel != null ? String(raw.availabilityLabel) : null,
    contactAddress: (() => {
      const legacy = raw.contactAddress != null ? String(raw.contactAddress) : null;
      const fromList = Array.isArray(raw.contactAddresses)
        ? raw.contactAddresses
            .map((item) => {
              if (!item || typeof item !== 'object') return '';
              return String((item as { value?: unknown }).value ?? '').trim();
            })
            .find(Boolean)
        : undefined;
      return fromList || legacy;
    })(),
    contactAddresses: Array.isArray(raw.contactAddresses)
      ? raw.contactAddresses
          .map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            const entry = item as Record<string, unknown>;
            const value = entry.value != null ? String(entry.value).trim() : '';
            if (!value) return null;
            return {
              id: entry.id != null ? String(entry.id) : `address-${index}`,
              sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : index,
              value,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : undefined,
    contactPhones: Array.isArray(raw.contactPhones)
      ? raw.contactPhones
          .map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            const entry = item as Record<string, unknown>;
            const value = entry.value != null ? String(entry.value).trim() : '';
            if (!value) return null;
            return {
              id: entry.id != null ? String(entry.id) : `phone-${index}`,
              sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : index,
              value,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : undefined,
    contactEmails: Array.isArray(raw.contactEmails)
      ? raw.contactEmails
          .map((item, index) => {
            if (!item || typeof item !== 'object') return null;
            const entry = item as Record<string, unknown>;
            const value = entry.value != null ? String(entry.value).trim() : '';
            if (!value) return null;
            return {
              id: entry.id != null ? String(entry.id) : `email-${index}`,
              sortOrder: typeof entry.sortOrder === 'number' ? entry.sortOrder : index,
              value,
            };
          })
          .filter((item): item is NonNullable<typeof item> => Boolean(item))
      : undefined,
    membersOnlyContactAvailable: Boolean(raw.membersOnlyContactAvailable),
    languages: raw.languages != null ? String(raw.languages) : null,
    ctaLabel: raw.ctaLabel != null ? String(raw.ctaLabel) : null,
    ctaUrl: raw.ctaUrl != null ? String(raw.ctaUrl) : null,
    timezoneId: raw.timezoneId != null ? String(raw.timezoneId) : null,
    whyMeBlocks: Array.isArray(raw.whyMeBlocks)
      ? raw.whyMeBlocks.map((item, index) => mapProfileMediaBlock(item as RawRecord, index))
      : [],
    experienceBlocks: Array.isArray(raw.experienceBlocks)
      ? raw.experienceBlocks.map((item, index) => mapProfileMediaBlock(item as RawRecord, index))
      : [],
    yearsOfExperience: raw.yearsOfExperience != null ? Number(raw.yearsOfExperience) : null,
    strengthsToolsMastered: Array.isArray(raw.strengthsToolsMastered)
      ? raw.strengthsToolsMastered
          .map((item) => mapProfileStrengthTool(item))
          .filter((item): item is import('@/types/ecosystem').ProfileStrengthTool => Boolean(item))
      : [],
    profileVisits:
      typeof raw.profileVisits === 'number' ? raw.profileVisits : Number(raw.profileVisits ?? 0),
    gender: normalizeCreatorGender(raw.gender ?? raw.pronouns),
    nationality: raw.nationality != null ? String(raw.nationality) : null,
    appRole: raw.appRole != null ? String(raw.appRole) : null,
    spokenLanguages: dedupeSpokenLanguages(
      Array.isArray(raw.spokenLanguages)
        ? raw.spokenLanguages.map((item) => String(item)).filter(Boolean)
        : [],
    ),
    profileServices: Array.isArray(raw.profileServices)
      ? raw.profileServices
          .map((item, index) => mapProfileServiceItem(item as RawRecord, index))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    faqItems: Array.isArray(raw.faqItems)
      ? raw.faqItems
          .map((item, index) => mapFaqItem(item as RawRecord, index))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    teamMembers: Array.isArray(raw.teamMembers)
      ? raw.teamMembers
          .map((item, index) => mapTeamMember(item as RawRecord, index))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    galleryItems: Array.isArray(raw.galleryItems)
      ? raw.galleryItems
          .map((item, index) => mapGalleryItem(item as RawRecord, index))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    aboutUs: mapAboutUs(raw.aboutUs),
    profileLinks: Array.isArray(raw.profileLinks)
      ? raw.profileLinks
          .map((item, index) => mapProfileLink(item as RawRecord, index))
          .sort((a, b) => a.sortOrder - b.sortOrder)
      : [],
    memberSince: raw.memberSince != null ? String(raw.memberSince) : null,
    responseTimeLabel: raw.responseTimeLabel != null ? String(raw.responseTimeLabel) : null,
    responseTimeSampleCount:
      raw.responseTimeSampleCount != null ? Number(raw.responseTimeSampleCount) : null,
    portfolioPosts: resolvedPortfolioPosts,
    portfolioWorks,
    portfolioSettings:
      raw.portfolioSettings != null &&
      typeof raw.portfolioSettings === 'object' &&
      !Array.isArray(raw.portfolioSettings)
        ? (raw.portfolioSettings as Record<string, unknown>)
        : null,
    shopName: raw.shopName != null ? String(raw.shopName).trim() || null : null,
    shopSellingFocus:
      raw.shopSellingFocus != null ? String(raw.shopSellingFocus).trim() || null : null,
    shopDescription:
      raw.shopDescription != null ? String(raw.shopDescription).trim() || null : null,
    shopCoverUrl: raw.shopCoverUrl != null ? String(raw.shopCoverUrl).trim() || null : null,
  };
}

function mapExperienceProofLink(
  raw: RawRecord,
  index: number,
  blockIndex: number
): import('@/types/ecosystem').ExperienceProofLink | null {
  const url = raw.url != null ? String(raw.url).trim() : '';
  const label = raw.label != null ? String(raw.label).trim() : '';
  if (!url || !label) return null;
  const platformRaw = raw.platform != null ? String(raw.platform).toUpperCase() : null;
  const platform: import('@/types/ecosystem').ExperienceProofPlatform | null =
    platformRaw === 'GITHUB' ||
    platformRaw === 'FACEBOOK' ||
    platformRaw === 'LINKEDIN' ||
    platformRaw === 'INSTAGRAM' ||
    platformRaw === 'YOUTUBE' ||
    platformRaw === 'WEBSITE' ||
    platformRaw === 'OTHER'
      ? platformRaw
      : null;
  return {
    id: raw.id != null ? String(raw.id) : `proof-${blockIndex}-${index}`,
    label,
    url,
    platform,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
  };
}

function mapProfileMediaBlock(raw: RawRecord, index: number): import('@/types/ecosystem').ProfileMediaBlock {
  const mediaUrl = raw.mediaUrl != null ? String(raw.mediaUrl) : null;
  const mediaTypeRaw = raw.mediaType != null ? String(raw.mediaType).toUpperCase() : null;
  const mediaType = mediaTypeRaw === 'VIDEO' ? 'VIDEO' : mediaTypeRaw === 'IMAGE' ? 'IMAGE' : null;
  const statusRaw = raw.status != null ? String(raw.status).toUpperCase() : null;
  const status: import('@/types/ecosystem').ExperienceBlockStatus | null =
    statusRaw === 'ONGOING' || statusRaw === 'FINISHED' ? statusRaw : null;
  const employmentRaw =
    raw.employmentType != null ? String(raw.employmentType).toUpperCase() : null;
  const employmentType: import('@/types/ecosystem').ExperienceEmploymentType | null =
    employmentRaw === 'FULL_TIME' ||
    employmentRaw === 'PART_TIME' ||
    employmentRaw === 'CONTRACT' ||
    employmentRaw === 'FREELANCE' ||
    employmentRaw === 'INTERNSHIP'
      ? employmentRaw
      : null;
  const links = Array.isArray(raw.links)
    ? raw.links
        .map((item, linkIndex) =>
          item && typeof item === 'object'
            ? mapExperienceProofLink(item as RawRecord, linkIndex, index)
            : null
        )
        .filter((link): link is NonNullable<typeof link> => link != null)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    : [];
  return {
    id: raw.id != null ? String(raw.id) : `block-${index}`,
    sortOrder: typeof raw.sortOrder === 'number' ? raw.sortOrder : index,
    title: raw.title != null ? String(raw.title).trim() || null : null,
    organization: raw.organization != null ? String(raw.organization).trim() || null : null,
    text: raw.text != null ? String(raw.text) : '',
    mediaUrl,
    mediaType: mediaUrl ? (mediaType as 'IMAGE' | 'VIDEO' | null) : null,
    period: raw.period != null ? String(raw.period).trim() || null : null,
    subtitles: Array.isArray(raw.subtitles)
      ? raw.subtitles.map((item) => String(item).trim()).filter(Boolean)
      : [],
    status,
    tasks: Array.isArray(raw.tasks)
      ? raw.tasks.map((item) => String(item).trim()).filter(Boolean)
      : [],
    tools: Array.isArray(raw.tools)
      ? raw.tools
          .map((item) => {
            if (typeof item === 'string') {
              const name = item.trim();
              return name ? { name, iconUrl: null as string | null } : null;
            }
            if (!item || typeof item !== 'object') return null;
            const record = item as RawRecord;
            const name = String(record.name ?? record.value ?? '').trim();
            if (!name) return null;
            const iconUrl =
              typeof record.iconUrl === 'string' && record.iconUrl.trim()
                ? record.iconUrl.trim()
                : null;
            return { name, iconUrl };
          })
          .filter((item): item is { name: string; iconUrl: string | null } => item != null)
      : [],
    links,
    remarks: raw.remarks != null ? String(raw.remarks).trim() || null : null,
    location: raw.location != null ? String(raw.location).trim() || null : null,
    employmentType,
  };
}

export const MARKETPLACE_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

type ServerFetchOptions = {
  refreshToken?: string;
  revalidate?: number;
};

/** Server-side fetch with optional refresh_token cookie for authenticated marketplace endpoints. */
export async function serverMarketplaceFetch<T>(
  path: string,
  options?: ServerFetchOptions
): Promise<T | null> {
  const headers: HeadersInit = {};
  if (options?.refreshToken) {
    headers.Cookie = `refresh_token=${options.refreshToken}`;
  }

  try {
    const res = await fetch(`${MARKETPLACE_API_BASE}${path}`, {
      headers,
      ...(options?.refreshToken
        ? { cache: 'no-store' as const }
        : { next: { revalidate: options?.revalidate ?? 60 } }),
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// --- Portfolio content (public) ---

export async function getPublicContent(id: string): Promise<MarketplaceContentDetail | null> {
  return serverMarketplaceFetch<MarketplaceContentDetail>(
    `/api/marketplace/contents/${encodeURIComponent(id)}`
  );
}

export async function listPublicContents(
  params?: { genre?: string; q?: string; creatorId?: string; page?: number; size?: number }
): Promise<PagedResponse<MarketplaceContentItem>> {
  const res = await api.get<SpringPageRaw<Record<string, unknown>>>('/api/marketplace/contents', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      ...(params?.genre ? { genre: params.genre } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.creatorId ? { creatorId: params.creatorId } : {}),
    },
  });
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map((row) => mapContentItem(row)),
  };
}

export async function listPublicContentFeed(
  params?: { genre?: string; q?: string; creatorId?: string; page?: number; size?: number }
): Promise<PublicContentFeedPage> {
  const res = await api.get<SpringPageRaw<Record<string, unknown>>>('/api/marketplace/contents', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 20,
      ...(params?.genre ? { genre: params.genre } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.creatorId ? { creatorId: params.creatorId } : {}),
    },
  });
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map((row) => mapPublicContentFeedItem(row)),
  };
}

export async function recordContentView(id: string): Promise<void> {
  await api.post(`/api/marketplace/contents/${encodeURIComponent(id)}/view`);
}

export async function recordCreatorProfileView(
  creatorId: string,
  visitorKey: string
): Promise<{ recorded: boolean; profileVisits: number }> {
  const res = await api.post<{ recorded: boolean; profileVisits: number }>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/view`,
    { visitorKey }
  );
  return {
    recorded: Boolean(res.data.recorded),
    profileVisits: Number(res.data.profileVisits ?? 0),
  };
}

// --- Creator portfolio content ---

export async function getCreatorContentById(id: string): Promise<CreatorContentItemDto> {
  const res = await api.get<CreatorContentItemDto>(
    `/api/creator/content/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function uploadContentMedia(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ url: string }>('/api/creator/content/uploads/media', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

// --- Creator products ---

export async function listCreatorProducts(
  page = 0,
  size = 20
): Promise<PagedResponse<MarketplaceProductSummary>> {
  const res = await api.get<SpringPageRaw<MarketplaceProductSummary>>('/api/creator/products', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function getCreatorProduct(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.get<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function createProduct(body: MarketplaceProductRequest): Promise<MarketplaceProductDetail> {
  const res = await api.post<MarketplaceProductDetail>('/api/creator/products', body);
  return res.data;
}

export async function updateProduct(
  id: string,
  body: MarketplaceProductRequest
): Promise<MarketplaceProductDetail> {
  const res = await api.put<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}`,
    body
  );
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/api/creator/products/${encodeURIComponent(id)}`);
}

export async function publishProduct(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/publish`
  );
  return res.data;
}

export async function unpublishProduct(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/unpublish`
  );
  return res.data;
}

export async function pinProduct(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/pin`
  );
  return res.data;
}

export async function unpinProduct(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/unpin`
  );
  return res.data;
}

export async function markProductBestseller(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/bestseller`
  );
  return res.data;
}

export async function unmarkProductBestseller(id: string): Promise<MarketplaceProductDetail> {
  const res = await api.patch<MarketplaceProductDetail>(
    `/api/creator/products/${encodeURIComponent(id)}/unbestseller`
  );
  return res.data;
}

export async function uploadProductThumbnail(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ url: string }>('/api/creator/marketplace/uploads/thumbnail', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

export async function uploadShopCover(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await api.post<{ url: string }>('/api/creator/marketplace/uploads/shop-cover', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data.url;
}

export function normalizeMarketplaceProduct(
  raw: MarketplaceProductSummary & Partial<Pick<MarketplaceProductDetail, 'whyProductBlocks'>>
): MarketplaceProductSummary {
  const legacy = raw as MarketplaceProductSummary & { niche?: string | null };
  const tags = Array.isArray(raw.tags)
    ? raw.tags.map((tag) => String(tag).trim()).filter((tag) => tag.length > 0)
    : [];

  const whyProductBlocks =
    raw.whyProductBlocks != null
      ? serializeProductWhyBlocks(parseProductWhyBlocks(raw.whyProductBlocks))
      : undefined;

  return {
    ...raw,
    genre: raw.genre?.trim() || null,
    specialite: (legacy.specialite ?? legacy.niche)?.trim() || null,
    tags,
    isBestseller: Boolean(raw.isBestseller),
    isPinned: Boolean(raw.isPinned),
    galleryImageUrls: Array.isArray((raw as MarketplaceProductDetail).galleryImageUrls)
      ? ((raw as MarketplaceProductDetail).galleryImageUrls ?? [])
          .map((url) => String(url).trim())
          .filter((url) => url.length > 0)
      : [],
    ...(whyProductBlocks !== undefined ? { whyProductBlocks } : {}),
  };
}

export function collectProductLabels(product: Pick<MarketplaceProductSummary, 'genre' | 'specialite' | 'tags'>) {
  const genre = product.genre?.trim() || product.specialite?.trim() || null;
  const tags: string[] = [];
  const seen = new Set<string>();

  if (genre) {
    seen.add(genre.toLowerCase());
  }

  for (const raw of product.tags ?? []) {
    const tag = String(raw).trim();
    if (!tag) continue;
    const key = tag.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(tag);
  }

  return { genre, tags: tags.slice(0, 3) };
}

// --- Public product catalog ---

export async function listPublicProducts(
  params?: {
    genre?: string;
    q?: string;
    creatorId?: string;
    type?: string;
    format?: 'virtual' | 'physical';
    minPriceCents?: number;
    maxPriceCents?: number;
    sort?: string;
    page?: number;
    size?: number;
    favoritesOnly?: boolean;
  }
): Promise<PagedResponse<MarketplaceProductSummary>> {
  const res = await api.get<SpringPageRaw<MarketplaceProductSummary>>('/api/marketplace/products', {
    params: {
      page: params?.page ?? 0,
      size: params?.size ?? 10,
      ...(params?.genre ? { genre: params.genre } : {}),
      ...(params?.q ? { q: params.q } : {}),
      ...(params?.creatorId ? { creatorId: params.creatorId } : {}),
      ...(params?.type ? { type: params.type } : {}),
      ...(params?.format ? { format: params.format } : {}),
      ...(params?.minPriceCents != null ? { minPriceCents: params.minPriceCents } : {}),
      ...(params?.maxPriceCents != null ? { maxPriceCents: params.maxPriceCents } : {}),
      ...(params?.sort ? { sort: params.sort } : {}),
      ...(params?.favoritesOnly ? { favoritesOnly: true } : {}),
    },
  });
  const page = normalizeSpringPage(res.data);
  return {
    ...page,
    content: page.content.map((item) => normalizeMarketplaceProduct(item)),
  };
}

export async function getPublicProduct(id: string): Promise<MarketplaceProductDetail | null> {
  return serverMarketplaceFetch<MarketplaceProductDetail>(
    `/api/marketplace/products/${encodeURIComponent(id)}`
  );
}

export async function listSimilarProducts(
  productId: string,
  size = 6
): Promise<MarketplaceProductSummary[]> {
  const res = await api.get<MarketplaceProductSummary[]>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/similar`,
    { params: { size } }
  );
  return res.data.map((item) => normalizeMarketplaceProduct(item));
}

export async function recordProductView(productId: string): Promise<boolean> {
  const res = await api.post<{ recorded: boolean }>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/view`
  );
  return Boolean(res.data.recorded);
}

export async function getProductReviewSummary(productId: string): Promise<ProductReviewSummary> {
  const res = await api.get<ProductReviewSummary>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/reviews/summary`
  );
  return {
    ...res.data,
    averageRating: res.data.averageRating ?? null,
    reviewCount: res.data.reviewCount ?? 0,
    rating5Count: res.data.rating5Count ?? 0,
    rating4Count: res.data.rating4Count ?? 0,
    rating3Count: res.data.rating3Count ?? 0,
    rating2Count: res.data.rating2Count ?? 0,
    rating1Count: res.data.rating1Count ?? 0,
  };
}

export async function listProductReviews(
  productId: string,
  page = 0,
  size = 20
): Promise<PagedResponse<ProductReview>> {
  const res = await api.get<SpringPageRaw<ProductReview>>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/reviews`,
    { params: { page, size } }
  );
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map(normalizeProductReview),
  };
}

export async function getMyProductReviewStatus(
  productId: string
): Promise<ProductReviewComposerStatus | null> {
  try {
    const res = await api.get<ProductReviewComposerStatus>(
      `/api/marketplace/products/${encodeURIComponent(productId)}/reviews/me`
    );
    return {
      ...res.data,
      latestReview: res.data.latestReview
        ? normalizeProductReview(res.data.latestReview)
        : null,
      reviewsPostedToday: res.data.reviewsPostedToday ?? 0,
      dailyReviewLimit: res.data.dailyReviewLimit ?? 3,
      canPostReviewToday: res.data.canPostReviewToday ?? true,
    };
  } catch {
    return null;
  }
}

export async function submitProductReview(
  productId: string,
  body: ProductReviewRequest
): Promise<ProductReview> {
  const res = await api.post<ProductReview>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/reviews`,
    body
  );
  return normalizeProductReview(res.data);
}

export async function deleteProductReview(reviewId: string): Promise<void> {
  await api.delete(`/api/marketplace/products/reviews/${encodeURIComponent(reviewId)}`);
}

export async function voteProductReviewHelpful(
  reviewId: string,
  helpful: boolean
): Promise<ProductReview> {
  const res = await api.post<ProductReview>(
    `/api/marketplace/products/reviews/${encodeURIComponent(reviewId)}/helpful`,
    { helpful }
  );
  return normalizeProductReview(res.data);
}

function normalizeProductReview(review: ProductReview): ProductReview {
  return {
    ...review,
    helpfulYesCount: review.helpfulYesCount ?? 0,
    helpfulNoCount: review.helpfulNoCount ?? 0,
    userHelpfulVote: review.userHelpfulVote ?? null,
  };
}

export function formatVideoDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const seconds = s % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// --- Purchases ---

export async function simulateProductPurchase(productId: string): Promise<MarketplacePurchaseResponse> {
  const res = await api.post<MarketplacePurchaseResponse>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/purchase`
  );
  return res.data;
}

function normalizePurchase(raw: OwnedProductRaw): MarketplacePurchase {
  return {
    id: raw.purchaseId,
    productId: raw.productId,
    productTitle: raw.productTitle,
    productType: raw.productType,
    thumbnailUrl: raw.thumbnailUrl,
    purchasedAt: raw.purchasedAt,
    creatorId: raw.creatorId,
    creatorName: raw.creatorName,
    pricePaidCents: raw.pricePaidCents,
    currency: raw.currency,
    fileFormat: raw.fileFormat,
    genre: raw.genre,
    deliveryMode: raw.deliveryMode,
    downloadCount: raw.downloadCount,
    maxDownloads: raw.maxDownloads,
  };
}

export async function getProductOwnership(productId: string): Promise<ProductOwnership> {
  const res = await api.get<ProductOwnership>(
    `/api/marketplace/products/${encodeURIComponent(productId)}/ownership`
  );
  return res.data;
}

export async function getProductInit(productId: string): Promise<ProductInitData> {
  const res = await api.get<{
    product: MarketplaceProductDetail;
    reviewSummary: ProductReviewSummary;
    reactionCounts: ReactionCounts;
    ownership: ProductOwnership | null;
  }>(`/api/marketplace/products/${encodeURIComponent(productId)}/init`);
  const { product, reviewSummary, reactionCounts, ownership } = res.data;
  return {
    product: normalizeMarketplaceProduct(product) as MarketplaceProductDetail,
    reviewSummary: {
      ...reviewSummary,
      averageRating: reviewSummary.averageRating ?? null,
      reviewCount: reviewSummary.reviewCount ?? 0,
      rating5Count: reviewSummary.rating5Count ?? 0,
      rating4Count: reviewSummary.rating4Count ?? 0,
      rating3Count: reviewSummary.rating3Count ?? 0,
      rating2Count: reviewSummary.rating2Count ?? 0,
      rating1Count: reviewSummary.rating1Count ?? 0,
    },
    reactionCounts,
    ownership: ownership?.owned ? ownership : null,
  };
}

export async function listMyPurchases(
  page = 0,
  size = 20
): Promise<PagedResponse<MarketplacePurchase>> {
  const res = await api.get<SpringPageRaw<OwnedProductRaw>>('/api/marketplace/purchases/me', {
    params: { page, size },
  });
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map(normalizePurchase),
  };
}

export async function getPurchaseAccess(
  purchaseId: string,
  mode: PurchaseAccessMode = 'stream'
): Promise<PurchaseAccessResponse> {
  const res = await api.get<PurchaseAccessResponse>(
    `/api/marketplace/purchases/${encodeURIComponent(purchaseId)}/access`,
    { params: { mode } }
  );
  return res.data;
}

// --- Bundles (creator) ---

export async function listCreatorBundles(
  page = 0,
  size = 20
): Promise<PagedResponse<MarketplaceBundleSummary>> {
  const res = await api.get<SpringPageRaw<MarketplaceBundleSummary>>('/api/creator/bundles', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function getCreatorBundle(id: string): Promise<MarketplaceBundleDetail> {
  const res = await api.get<MarketplaceBundleDetail>(
    `/api/creator/bundles/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function createBundle(body: MarketplaceBundleRequest): Promise<MarketplaceBundleDetail> {
  const res = await api.post<MarketplaceBundleDetail>('/api/creator/bundles', body);
  return res.data;
}

export async function simulateBundlePurchase(bundleId: string): Promise<MarketplacePurchaseResponse> {
  const res = await api.post<MarketplacePurchaseResponse>(
    `/api/marketplace/bundles/${encodeURIComponent(bundleId)}/purchase`
  );
  return res.data;
}

// --- Product groups (creator, organizational) ---

export async function listCreatorProductGroups(
  page = 0,
  size = 50
): Promise<PagedResponse<MarketplaceProductGroup>> {
  const res = await api.get<SpringPageRaw<MarketplaceProductGroup>>('/api/creator/product-groups', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function listPublicCreatorProductGroups(
  creatorId: string,
  page = 0,
  size = 50
): Promise<PagedResponse<MarketplaceProductGroup>> {
  const res = await api.get<SpringPageRaw<MarketplaceProductGroup>>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/product-groups`,
    { params: { page, size } }
  );
  return normalizeSpringPage(res.data);
}

export async function getCreatorProductGroup(id: string): Promise<MarketplaceProductGroup> {
  const res = await api.get<MarketplaceProductGroup>(
    `/api/creator/product-groups/${encodeURIComponent(id)}`
  );
  return res.data;
}

export async function createProductGroup(
  body: MarketplaceProductGroupRequest
): Promise<MarketplaceProductGroup> {
  const res = await api.post<MarketplaceProductGroup>('/api/creator/product-groups', body);
  return res.data;
}

export async function updateProductGroup(
  id: string,
  body: MarketplaceProductGroupRequest
): Promise<MarketplaceProductGroup> {
  const res = await api.put<MarketplaceProductGroup>(
    `/api/creator/product-groups/${encodeURIComponent(id)}`,
    body
  );
  return res.data;
}

export async function deleteProductGroup(id: string): Promise<void> {
  await api.delete(`/api/creator/product-groups/${encodeURIComponent(id)}`);
}

// --- Social ---

export async function setReaction(
  targetType: SocialTargetType,
  targetId: string,
  type: ReactionType
): Promise<void> {
  await api.post('/api/marketplace/social/reactions', { targetType, targetId, type });
}

export async function removeReaction(targetType: SocialTargetType, targetId: string): Promise<void> {
  await api.delete('/api/marketplace/social/reactions', {
    params: { targetType, targetId },
  });
}

export async function getReactionCounts(
  targetType: SocialTargetType,
  targetId: string
): Promise<ReactionCounts> {
  const res = await api.get<ReactionCounts>('/api/marketplace/social/reactions/counts', {
    params: { targetType, targetId },
  });
  return res.data;
}

export async function addFavorite(targetType: SocialTargetType, targetId: string): Promise<void> {
  await api.post('/api/marketplace/social/favorites', { targetType, targetId });
}

export async function removeFavorite(targetType: SocialTargetType, targetId: string): Promise<void> {
  await api.delete('/api/marketplace/social/favorites', {
    params: { targetType, targetId },
  });
}

export async function listMyLikedTargetIds(
  targetType: SocialTargetType
): Promise<string[]> {
  const res = await api.get<string[]>('/api/marketplace/social/reactions/me/ids', {
    params: { targetType },
  });
  return res.data;
}

export async function listMyFavoriteTargetIds(
  targetType: SocialTargetType
): Promise<string[]> {
  const res = await api.get<string[]>('/api/marketplace/favorites/me/ids', {
    params: { targetType },
  });
  return res.data;
}

export async function listMyFavorites(
  page = 0,
  size = 20
): Promise<PagedResponse<FavoriteItem>> {
  const res = await api.get<SpringPageRaw<FavoriteItem>>('/api/marketplace/favorites/me', {
    params: { page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function listComments(
  targetType: SocialTargetType,
  targetId: string,
  page = 0,
  size = 20,
  includeHidden = false
): Promise<PagedResponse<MarketplaceComment>> {
  const res = await api.get<SpringPageRaw<MarketplaceComment>>('/api/marketplace/social/comments', {
    params: { targetType, targetId, page, size, includeHidden },
  });
  return normalizeSpringPage(res.data);
}

export async function postComment(
  targetType: SocialTargetType,
  targetId: string,
  comment: string,
  parentId?: string
): Promise<MarketplaceComment> {
  const res = await api.post<MarketplaceComment>('/api/marketplace/social/comments', {
    targetType,
    targetId,
    comment,
    ...(parentId ? { parentId } : {}),
  });
  return res.data;
}

export async function deleteComment(commentId: string): Promise<void> {
  await api.delete(`/api/marketplace/social/comments/${encodeURIComponent(commentId)}`);
}

export async function hideComment(commentId: string): Promise<void> {
  await api.post(`/api/marketplace/social/comments/${encodeURIComponent(commentId)}/hide`);
}

export async function unhideComment(commentId: string): Promise<void> {
  await api.post(`/api/marketplace/social/comments/${encodeURIComponent(commentId)}/unhide`);
}

export async function reportContent(
  targetType: SocialTargetType,
  targetId: string,
  reason: ReportReason,
  details?: string
): Promise<void> {
  await api.post('/api/marketplace/social/reports', {
    targetType,
    targetId,
    reason,
    ...(details ? { details } : {}),
  });
}

export async function recordShare(
  targetType: SocialTargetType,
  targetId: string,
  platform: string
): Promise<void> {
  await api.post('/api/marketplace/social/shares', { targetType, targetId, platform });
}

export interface CreatorFollowStats {
  followerCount: number;
  isFollowing: boolean;
}

export async function getCreatorFollowStats(creatorId: string): Promise<CreatorFollowStats> {
  const res = await api.get<CreatorFollowStats>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/follow-stats`
  );
  return res.data;
}

export type PublicCreatorFollowerPreview = {
  id: string;
  followerUserId: string;
  followerFullName: string | null;
  followerAvatarUrl: string | null;
};

/** Recent followers for public profile previews (search cards, etc.). */
export async function listPublicCreatorFollowers(
  creatorId: string,
  page = 0,
  size = 3
): Promise<PublicCreatorFollowerPreview[]> {
  const res = await api.get<SpringPageRaw<Record<string, unknown>>>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/followers`,
    { params: { page, size } }
  );
  const content = Array.isArray(res.data?.content) ? res.data.content : [];
  return content.map((row) => ({
    id: String(row.id ?? ''),
    followerUserId: String(row.followerUserId ?? ''),
    followerFullName: (row.followerFullName as string | null | undefined) ?? null,
    followerAvatarUrl: (row.followerAvatarUrl as string | null | undefined) ?? null,
  }));
}

export async function followCreator(creatorId: string): Promise<CreatorFollowStats | null> {
  const res = await api.post<CreatorFollowStats>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/follow`,
    {}
  );
  if (!res.data || typeof res.data.followerCount !== 'number') return null;
  return {
    followerCount: Number(res.data.followerCount),
    isFollowing: Boolean(res.data.isFollowing ?? true),
  };
}

export async function unfollowCreator(creatorId: string): Promise<CreatorFollowStats | null> {
  const res = await api.delete<CreatorFollowStats>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/follow`
  );
  if (!res.data || typeof res.data.followerCount !== 'number') return null;
  return {
    followerCount: Number(res.data.followerCount),
    isFollowing: Boolean(res.data.isFollowing ?? false),
  };
}

export async function getCreatorReputation(creatorId: string): Promise<CreatorReputationDto> {
  const res = await api.get<CreatorReputationDto>(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/reputation`
  );
  const data = res.data;
  return {
    ...data,
    ratingDistribution: data.ratingDistribution ?? {},
    completedMissionsCount:
      typeof data.completedMissionsCount === 'number'
        ? data.completedMissionsCount
        : Number(data.reviewCount ?? 0),
    responseRatePercent:
      data.responseRatePercent == null ? null : Number(data.responseRatePercent),
    inboundConversationCount: Number(data.inboundConversationCount ?? 0),
    typicallyRepliesWithinLabel:
      data.typicallyRepliesWithinLabel != null ? String(data.typicallyRepliesWithinLabel) : null,
  };
}

export async function submitCreatorReview(
  creatorId: string,
  body: { rating: number; comment?: string; wouldRecommend: boolean }
): Promise<void> {
  await api.post(`/api/marketplace/creators/${encodeURIComponent(creatorId)}/reviews`, body);
}

export type CreatorContactMessageRequest = {
  name: string;
  email: string;
  subject?: string;
  message: string;
};

export async function sendCreatorContactMessage(
  creatorId: string,
  body: CreatorContactMessageRequest
): Promise<void> {
  await api.post(
    `/api/marketplace/creators/${encodeURIComponent(creatorId)}/contact-messages`,
    body
  );
}

export async function listFollowingCreators(
  page = 0,
  size = 20
): Promise<PagedResponse<MarketplaceCreatorSummary>> {
  const res = await api.get<SpringPageRaw<Record<string, unknown>>>('/api/marketplace/following/creators', {
    params: { page, size },
  });
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map((row) => normalizeCreatorSummary(row)),
  };
}

export async function searchMarketplaceCreators(
  query: string,
  page = 0,
  size = 20,
  filters?: {
    nationality?: string;
    minYearsExperience?: number;
    lat?: number;
    lng?: number;
    accuracyM?: number;
    sort?: string;
  }
): Promise<PagedResponse<MarketplaceCreatorSummary>> {
  const res = await api.get<SpringPageRaw<Record<string, unknown>>>('/api/marketplace/creators/search', {
    params: {
      q: query.trim(),
      page,
      size,
      ...(filters?.nationality ? { nationality: filters.nationality } : {}),
      ...(filters?.minYearsExperience != null
        ? { minYearsExperience: filters.minYearsExperience }
        : {}),
      ...(filters?.lat != null && filters?.lng != null
        ? {
            lat: filters.lat,
            lng: filters.lng,
            ...(filters.accuracyM != null ? { accuracyM: filters.accuracyM } : {}),
            ...(filters?.sort ? { sort: filters.sort } : {}),
          }
        : {}),
    },
  });
  const pageData = normalizeSpringPage(res.data);
  return {
    ...pageData,
    content: pageData.content.map((row) => normalizeCreatorSummary(row)),
  };
}

export async function listAdminReports(
  status: ReportStatus = 'PENDING',
  page = 0,
  size = 20
): Promise<PagedResponse<ContentReport>> {
  const res = await api.get<SpringPageRaw<ContentReport>>('/api/admin/reports', {
    params: { status, page, size },
  });
  return normalizeSpringPage(res.data);
}

export async function updateAdminReport(
  reportId: string,
  body: ReportUpdateRequest
): Promise<ContentReport> {
  const res = await api.patch<ContentReport>(
    `/api/admin/reports/${encodeURIComponent(reportId)}`,
    body
  );
  return res.data;
}

export async function listPublicProductsServer(
  params?: { genre?: string; q?: string; creatorId?: string; page?: number; size?: number }
): Promise<PagedResponse<MarketplaceProductSummary>> {
  const search = new URLSearchParams();
  search.set('page', String(params?.page ?? 0));
  search.set('size', String(params?.size ?? 12));
  if (params?.genre) search.set('genre', params.genre);
  if (params?.q) search.set('q', params.q);
  if (params?.creatorId) search.set('creatorId', params.creatorId);

  const raw = await serverMarketplaceFetch<SpringPageRaw<MarketplaceProductSummary>>(
    `/api/marketplace/products?${search.toString()}`
  );
  if (!raw) {
    return { content: [], page: 0, size: params?.size ?? 12, totalElements: 0, totalPages: 0, last: true };
  }
  const page = normalizeSpringPage(raw);
  return {
    ...page,
    content: page.content.map((item) => normalizeMarketplaceProduct(item)),
  };
}

export function isFreeProduct(priceCents: number): boolean {
  return priceCents === 0;
}

export function formatPrice(priceCents: number, currency = 'EUR'): string {
  if (isFreeProduct(priceCents)) return 'Free';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(priceCents / 100);
}

export const PRODUCT_TYPE_LABELS: Record<string, string> = {
  EBOOK: 'E-book',
  PDF: 'PDF',
  VIDEO: 'Video',
  AUDIO: 'Audio',
  TEMPLATE: 'Template',
  COURSE: 'Course',
  PRESET: 'Preset',
  SOFTWARE: 'Software',
  IMAGE_PACK: 'Image pack',
  FONT: 'Font',
  PHYSICAL: 'Physical',
  OTHER: 'Other',
};
