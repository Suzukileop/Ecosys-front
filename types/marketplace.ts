import type {
  ContactEntry,
  FaqItem,
  PagedResponse,
  ProfileGalleryItem,
  ProfileLink,
  ProfileMediaBlock,
  ProfileServiceItem,
  ProfileStrengthTool,
  ProfileTeamMember,
} from '@/types/ecosystem';

export interface MarketplaceCreatorSummary {
  /** Prefer `id`; backend may expose `userId` instead. */
  id?: string;
  userId?: string;
  fullName: string;
  avatarUrl: string | null;
  specialite: string | null;
  bio?: string | null;
  isVerified: boolean;
  isAvailable?: boolean;
  portfolioCount?: number;
  productCount?: number;
  averageRating: number | null;
  followerCount?: number;
  isFollowing?: boolean;
}

export type MarketplaceCreatorsPage = PagedResponse<MarketplaceCreatorSummary>;

export interface MarketplaceContentItem {
  id: string;
  title: string;
  genre: string | null;
  description?: string | null;
  mediaUrl?: string | null;
  mediaType?: 'FILE' | 'GIF' | null;
  textColor?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: { id: string; fullName: string; avatarUrl?: string | null }[];
  priceInfo?: string | null;
  toolsUsed?: string[];
  tags?: string[];
  creatorId?: string | null;
}

export interface MarketplaceCreatorPublicProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  coverUrl?: string | null;
  coverObjectPositionY?: number | null;
  specialite: string | null;
  bio: string | null;
  isVerified: boolean;
  isAvailable?: boolean;
  portfolioCount: number;
  /** Total non-deleted content posts by this creator (includes archived). */
  contentCount?: number;
  productCount?: number;
  averageRating: number | null;
  /** Backend field: recent public portfolio posts */
  recentPosts?: MarketplaceContentItem[];
  /** Only present when the backend exposes links for an authenticated user. */
  socialLinks?: Record<string, string> | null;
  studioHeaderLayout?: string | null;
  studioHeaderContentStyle?: string | null;
  studioTabNavAlign?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  portfolio?: MarketplaceContentItem[];
  contents?: MarketplaceContentItem[];
  followerCount?: number;
  isFollowing?: boolean;
  phone?: string | null;
  websiteUrl?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  availabilityHours?: string | null;
  contactAddress?: string | null;
  contactAddresses?: ContactEntry[];
  contactPhones?: ContactEntry[];
  contactEmails?: ContactEntry[];
  membersOnlyContactAvailable?: boolean;
  languages?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  timezoneId?: string | null;
  whyMeBlocks?: ProfileMediaBlock[];
  experienceBlocks?: ProfileMediaBlock[];
  yearsOfExperience?: number | null;
  strengthsToolsMastered?: ProfileStrengthTool[];
  profileVisits?: number;
  gender?: string | null;
  spokenLanguages?: string[];
  profileServices?: ProfileServiceItem[];
  faqItems?: FaqItem[];
  teamMembers?: ProfileTeamMember[];
  galleryItems?: ProfileGalleryItem[];
  profileLinks?: ProfileLink[];
  memberSince?: string | null;
  responseTimeLabel?: string | null;
  responseTimeSampleCount?: number | null;
  portfolioPosts?: MarketplaceContentItem[];
  /** Public portfolio presentation settings (theme, layout, motion, etc.). */
  portfolioSettings?: Record<string, unknown> | null;
}

export interface MarketplaceContentCreator {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface MarketplaceContentDetail {
  id: string;
  title: string | null;
  genre: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType?: 'FILE' | 'GIF' | null;
  textColor?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: { id: string; fullName: string; avatarUrl?: string | null }[];
  priceInfo: string | null;
  toolsUsed: string[];
  tags?: string[];
  isPublic: boolean;
  views: number;
  likes: number;
  createdAt: string;
  creator: MarketplaceContentCreator;
}

/** Full public post for home / news feed cards */
export interface PublicContentFeedItem {
  id: string;
  title: string | null;
  genre: string | null;
  description: string | null;
  mediaUrl: string | null;
  mediaType?: 'FILE' | 'GIF' | null;
  textColor?: string | null;
  moodLabel?: string | null;
  moodEmoji?: string | null;
  taggedUsers?: { id: string; fullName: string; avatarUrl?: string | null }[];
  priceInfo: string | null;
  toolsUsed: string[];
  tags?: string[];
  isPublic: boolean;
  commentsEnabled?: boolean;
  pinned?: boolean;
  views: number;
  likes: number;
  createdAt: string;
  creator: MarketplaceContentCreator;
}

export type PublicContentFeedPage = PagedResponse<PublicContentFeedItem>;

// --- Digital products (paid marketplace) ---

export type ProductType =
  | 'EBOOK'
  | 'PDF'
  | 'VIDEO'
  | 'AUDIO'
  | 'TEMPLATE'
  | 'COURSE'
  | 'PRESET'
  | 'SOFTWARE'
  | 'IMAGE_PACK'
  | 'FONT'
  | 'OTHER';

export type DemoType = 'NONE' | 'IMAGE' | 'VIDEO' | 'FILE_EXTRACT';

export interface ProductWhyBlock {
  id: string;
  sortOrder: number;
  mediaUrl: string;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  opinions: string[];
}

export type DeliveryMode = 'STREAM_ONLY' | 'DOWNLOAD' | 'BOTH';

export type LicenseType = 'PERSONAL' | 'COMMERCIAL' | 'EXTENDED';

export interface MarketplaceProductSummary {
  id: string;
  type: ProductType;
  title: string;
  description: string | null;
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency: string;
  genre: string | null;
  specialite: string | null;
  thumbnailUrl: string | null;
  creatorId: string;
  creatorName: string | null;
  creatorAvatarUrl: string | null;
  isPublished: boolean;
  hasMainFile?: boolean;
  views: number;
  likes: number;
  salesCount?: number;
  averageRating?: number | null;
  reviewCount?: number;
  videoDurationSeconds?: number | null;
  videoResolution?: string | null;
  isBestseller?: boolean;
  tags?: string[];
  licenseType?: LicenseType;
  createdAt: string;
  updatedAt?: string;
}

export interface MarketplaceProductDetail extends MarketplaceProductSummary {
  demoType: DemoType;
  demoUrl: string | null;
  demoDescription: string | null;
  demoSubtitles?: string[];
  whyProductBlocks?: ProductWhyBlock[];
  deliveryMode: DeliveryMode;
  licenseType: LicenseType;
  compatibleTools: string[];
  fileFormat: string | null;
  fileSizeMb: number | null;
  language: string | null;
  version: string | null;
  tags: string[];
  bundleId: string | null;
  hasMainFile: boolean;
}

export type MarketplaceProductsPage = PagedResponse<MarketplaceProductSummary>;

export interface MarketplaceProductRequest {
  type: ProductType;
  title: string;
  description: string;
  priceCents: number;
  compareAtPriceCents?: number | null;
  currency?: string;
  genre?: string;
  specialite?: string;
  thumbnailUrl?: string;
  demoType?: DemoType;
  demoUrl?: string;
  demoDescription?: string;
  demoSubtitles?: string[];
  whyProductBlocks?: ProductWhyBlock[];
  mainFileR2Key?: string;
  deliveryMode?: DeliveryMode;
  licenseType?: LicenseType;
  compatibleTools?: string[];
  fileFormat?: string;
  fileSizeMb?: number;
  language?: string;
  version?: string;
  tags?: string[];
  videoDurationSeconds?: number | null;
  videoResolution?: string | null;
  isBestseller?: boolean;
  isPublished?: boolean;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  helpfulYesCount: number;
  helpfulNoCount: number;
  userHelpfulVote: boolean | null;
}

export interface ProductReviewRequest {
  rating: number;
  comment?: string;
}

export interface ProductReviewSummary {
  averageRating: number | null;
  reviewCount: number;
  rating5Count: number;
  rating4Count: number;
  rating3Count: number;
  rating2Count: number;
  rating1Count: number;
}

export interface ProductReviewComposerStatus {
  latestReview: ProductReview | null;
  reviewsPostedToday: number;
  dailyReviewLimit: number;
  canPostReviewToday: boolean;
}

export interface MarketplaceBundleSummary {
  id: string;
  title: string;
  description: string | null;
  priceCents: number;
  currency: string;
  discountPercent: number | null;
  productCount: number;
  isPublished: boolean;
  createdAt: string;
}

export interface MarketplaceBundleDetail extends MarketplaceBundleSummary {
  products: MarketplaceProductSummary[];
}

export interface MarketplaceBundleRequest {
  title: string;
  description?: string;
  priceCents: number;
  currency?: string;
  discountPercent?: number;
  productIds: string[];
  isPublished?: boolean;
}

/** Raw shape from GET /api/marketplace/purchases/me */
export interface OwnedProductRaw {
  purchaseId: string;
  productId: string;
  productTitle: string;
  productType: ProductType;
  thumbnailUrl: string | null;
  purchasedAt: string;
  downloadCount: number;
  maxDownloads: number | null;
  creatorId: string;
  creatorName: string;
  pricePaidCents: number;
  currency: string;
  fileFormat: string | null;
  genre: string | null;
  deliveryMode: DeliveryMode;
}

export interface ProductOwnership {
  owned: boolean;
  purchaseId: string | null;
  downloadCount: number;
  maxDownloads: number | null;
}

export interface MarketplacePurchase {
  id: string;
  productId: string;
  productTitle: string;
  productType: ProductType;
  thumbnailUrl: string | null;
  purchasedAt: string;
  creatorId: string;
  creatorName: string;
  pricePaidCents: number;
  currency: string;
  fileFormat: string | null;
  genre: string | null;
  deliveryMode: DeliveryMode;
  downloadCount: number;
  maxDownloads: number | null;
}

export type PurchaseAccessMode = 'stream' | 'download';

export interface PurchaseAccessResponse {
  url: string;
  accessMode: 'STREAM' | 'DOWNLOAD';
  expiresInMinutes: number;
  filename?: string | null;
}

// --- Social ---

export type SocialTargetType = 'POST' | 'PRODUCT' | 'COMMENT';

export type ReactionType = 'LIKE' | 'DISLIKE';

export type ReportReason = 'SPAM' | 'HARASSMENT' | 'INAPPROPRIATE' | 'COPYRIGHT' | 'OTHER';

export type ReportStatus = 'PENDING' | 'REVIEWED' | 'ACTIONED';

export interface ReactionCounts {
  likes: number;
  dislikes: number;
  userReaction: ReactionType | null;
  favorited: boolean;
}

/** Aggregated response from GET /api/marketplace/products/{id}/init */
export interface ProductInitData {
  product: MarketplaceProductDetail;
  reviewSummary: ProductReviewSummary;
  reactionCounts: ReactionCounts;
  /** null when not authenticated or product not owned */
  ownership: ProductOwnership | null;
}

export interface MarketplaceComment {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  comment: string;
  parentId: string | null;
  createdAt: string;
  likes?: number;
  dislikes?: number;
  userReaction?: ReactionType | null;
  hidden?: boolean;
  replies?: MarketplaceComment[];
}

export interface FavoriteItem {
  targetType: SocialTargetType;
  targetId: string;
  title: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  targetType: SocialTargetType;
  targetId: string;
  reporterId: string;
  reporterName: string | null;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  createdAt: string;
}

export interface ReportUpdateRequest {
  status: ReportStatus;
  adminNotes?: string;
}

export type MarketplacePurchasesPage = PagedResponse<MarketplacePurchase>;

export interface MarketplacePurchaseResponse {
  id: string;
  productId: string | null;
  bundleId: string | null;
  pricePaidCents: number;
  currency: string;
  paymentStatus: string;
  purchasedAt: string;
  downloadCount: number;
}
