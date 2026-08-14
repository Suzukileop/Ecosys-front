/** Aligné sur PagedResponse Spring / wrapper frontend */
export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

/** Réponse brute Spring Data Page (avant normalisation) */
export interface SpringPageRaw<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
  last?: boolean;
}

// --- Legacy service request (certains endpoints peuvent encore renvoyer ce format) ---
export type ServiceRequestStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'PROPOSED'
  | 'VALIDATED'
  | 'REJECTED'
  | 'COMPLETED';

export interface ServiceRequestDto {
  id: string;
  clientId: string;
  type: string;
  status: ServiceRequestStatus;
  uniqueCode: string;
  createdAt: string;
}

// --- Refonte écosystème / niche (contrats prompt) ---

export type NicheStatus =
  | 'PENDING'
  | 'PROPOSED'
  | 'VALIDATED'
  | 'PAID'
  | 'ACTIVE'
  | 'REJECTED'
  | 'CANCELLED';

export type NextStep =
  | 'BOT_CHAT'
  | 'WAITING_AGENT'
  | 'VALIDATE_MODEL'
  | 'PAYMENT'
  | 'SCHEDULER'
  | 'ACTIVE';

export type RefType = 'MCT' | 'URL' | 'MP4';

export type EcosystemPlatform = 'INSTAGRAM' | 'TIKTOK' | 'YOUTUBE' | 'FACEBOOK' | 'TWITTER';

export type PaymentStatus = 'UNPAID' | 'PENDING_PAYMENT' | 'PAID' | 'FAILED' | 'REFUNDED' | string;

/** Détail / liste niche — aligné NicheRequestResponse (prompt) */
export interface NicheRequestResponse {
  id: string;
  uniqueCode: string;
  nicheTheme: string;
  description: string;
  language: string;
  nbPostsPerWeek: number;
  platforms: EcosystemPlatform[];
  refType: RefType | null;
  refMctCode: string | null;
  refExternalUrl: string | null;
  refSourcePlatform?: EcosystemPlatform | null;
  refFileUrl: string | null;
  monthlyAmountCents: number;
  monthlyAmountFormatted: string;
  status: NicheStatus | string;
  paymentStatus?: PaymentStatus | null;
  botConfirmed: boolean;
  demoContentUrl: string | null;
  agentNotes: string | null;
  createdAt: string;
  updatedAt?: string | null;
  activatedAt?: string | null;
  nextStep: NextStep | string;
  /** Renvoyé après validation acceptée + création session VPI */
  checkoutUrl?: string | null;
  rejectionReason?: string | null;
  deadline?: string | null;
  agentId?: string | null;
  clientEmail?: string | null;
  clientFullName?: string | null;
}

export interface NicheRequestFormData {
  nicheTheme: string;
  description: string;
  language: string;
  nbPostsPerWeek: number;
  platforms: EcosystemPlatform[];
  refType?: RefType | null;
  refMctCode?: string | null;
  refExternalUrl?: string | null;
  refSourcePlatform?: EcosystemPlatform | null;
}

export interface BotMessageBody {
  message: string;
}

export interface BotResponseDto {
  botMessage: string;
  botConfirmed: boolean;
  nextStep: string;
  /** Réponse IA avec marqueur de fin — le dossier n’avance qu’après confirmNicheAfterBot. */
  readyToConfirm?: boolean;
}

export interface ValidateModelBody {
  accepted: boolean;
  rejectionReason?: string;
}

/** Aligné backend : 0 = dimanche … 6 = samedi (même échelle que `publication_days` historique). */
export const ECOSYSTEM_DAY_LABELS: Record<number, string> = {
  0: 'Dim',
  1: 'Lun',
  2: 'Mar',
  3: 'Mer',
  4: 'Jeu',
  5: 'Ven',
  6: 'Sam',
};

export interface PublicationSlotDto {
  dayOfWeek: number;
  time: string;
}

export interface ScheduledConfigDto {
  nicheRequestId: string;
  publicationSlots: PublicationSlotDto[];
}

export interface AgentProposeBody {
  demoContentUrl: string;
  agentNotes?: string;
}

export interface TariffConfigResponse {
  tarifUnitaireCents: number;
  formatted?: string;
}

export interface RefUploadResponse {
  refFileUrl: string;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface DemoUploadResponse {
  demoContentUrl: string;
}

/** Messages chat bot niche (GET history) — champs optionnels pour tolérance backend */
export interface EcosystemBotMessage {
  id: string;
  content: string;
  sentAt: string;
  senderType?: 'BOT' | 'HUMAN' | 'SYSTEM' | string;
  role?: string;
}

// --- Ancienne page détail service (compat minimale) ---
export interface NicheRequestDto {
  id: string;
  clientId: string;
  agentId: string | null;
  nicheTheme: string;
  description: string;
  refModelId: string | null;
  status: string;
  proposedModelId: string | null;
  notes: string | null;
  deadline: string | null;
  createdAt: string;
}

export interface ServiceRequestDetailDto {
  roomId: string;
  serviceRequest: ServiceRequestDto;
  nicheRequest: NicheRequestDto | null;
}

export interface ValidateNicheResponse {
  nextStep?: string | null;
  nicheCode?: string | null;
  accepted?: boolean;
}

export interface ProposeModelBody {
  proposedModelId: string;
  notes?: string;
}

export interface ChatMessageDto {
  id: string;
  roomId: string;
  /** Null pour messages système / bot sans User JPA */
  senderId: string | null;
  senderName: string;
  content: string;
  sentAt: string;
  isRead: boolean | null;
  /** HUMAN | BOT | AGENT — renvoyé par l’API */
  senderType?: string | null;
}

export interface NotificationDto {
  id: string;
  type: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: string;
  refId?: string | null;
  refSecondaryId?: string | null;
}

export interface CreatorReviewItem {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  wouldRecommend: boolean;
  createdAt: string;
}

export interface CreatorReputationDto {
  averageRating: number | null;
  reviewCount: number;
  recommendPercent: number;
  trustBadges: string[];
  recentReviews: CreatorReviewItem[];
  ratingDistribution?: Partial<Record<1 | 2 | 3 | 4 | 5, number>>;
}

export interface ExperienceProofLink {
  id: string;
  label: string;
  url: string;
  platform?: ExperienceProofPlatform | null;
  sortOrder: number;
}

export type ExperienceBlockStatus = 'ONGOING' | 'FINISHED';

export type ExperienceEmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'FREELANCE'
  | 'INTERNSHIP';

export type ExperienceProofPlatform =
  | 'GITHUB'
  | 'FACEBOOK'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'WEBSITE'
  | 'OTHER';

export interface ProfileMediaBlock {
  id: string;
  sortOrder: number;
  /** Job title (experience blocks). */
  title?: string | null;
  /** Employer / context label, e.g. Freelance, Studio créatif. */
  organization?: string | null;
  text: string;
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
  /** Date range, e.g. 2021 — present */
  period?: string | null;
  /** Skill / topic tags shown as pills on experience blocks. */
  subtitles?: string[];
  /** Ongoing vs finished role/project. */
  status?: ExperienceBlockStatus | null;
  /** Bullet list of responsibilities / tasks. */
  tasks?: string[];
  /** Tools / software used on this role (catalog name and optional custom logo URL). */
  tools?: Array<string | { name?: string; value?: string; iconUrl?: string | null }>;
  /** Proof links (GitHub, Facebook, case study, etc.). */
  links?: ExperienceProofLink[];
  /** Short remark / caveat. */
  remarks?: string | null;
  /** City or remote. */
  location?: string | null;
  /** Employment / engagement type. */
  employmentType?: ExperienceEmploymentType | null;
}

export interface ProfileServiceItem {
  id: string;
  sortOrder: number;
  title: string;
  description: string;
  basePriceCents: number | null;
  deadline: string | null;
  /** Included deliverables / tasks for this service offer. */
  tasks?: string[];
  /** Optional merchandising flag used by pricing-oriented portfolio layouts. */
  popular?: boolean;
}

export type ProfileStrengthToolLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

/** Skill / tool listed under Creator Studio → Skills & tools. */
export interface ProfileStrengthTool {
  name: string;
  /** Optional card blurb; empty/null → auto-generated portfolio description. */
  description?: string | null;
  category?: string | null;
  level?: ProfileStrengthToolLevel | null;
  useCases?: string[];
  experienceYears?: number | null;
  experienceLabel?: string | null;
  currentlyUsed?: boolean | null;
  /** Optional uploaded logo for custom tools. */
  iconUrl?: string | null;
}

export interface FaqItem {
  id: string;
  sortOrder: number;
  question: string;
  answer: string;
}

/** Multi-value contact row (address / phone / email). */
export interface ContactEntry {
  id: string;
  sortOrder: number;
  value: string;
}

export interface ProfileGalleryItem {
  id: string;
  sortOrder: number;
  title: string;
  mediaUrl: string;
  mediaType?: 'IMAGE' | 'VIDEO' | null;
}

export type TeamSocialPlatform =
  | 'FACEBOOK'
  | 'X'
  | 'TWITTER'
  | 'LINKEDIN'
  | 'INSTAGRAM'
  | 'YOUTUBE'
  | 'GITHUB'
  | 'WEBSITE'
  | 'EMAIL'
  | 'OTHER';

export interface ProfileTeamSocialLink {
  id: string;
  platform: TeamSocialPlatform;
  label?: string | null;
  url: string;
  sortOrder: number;
}

export interface ProfileTeamMember {
  id: string;
  sortOrder: number;
  name: string;
  /** Role / responsibility on the team. */
  responsibility: string;
  imageUrl?: string | null;
  socialLinks?: ProfileTeamSocialLink[];
}

export type ProfileLinkType = 'WEBSITE' | 'CTA' | 'CUSTOM' | 'SOCIAL';

export interface ProfileLink {
  id: string;
  type: ProfileLinkType | string;
  label: string;
  url: string;
  sortOrder: number;
  platform?: string | null;
}

export interface CreatorProfileDto {
  id: string;
  userId?: string;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio: string | null;
  specialite: string | null;
  websiteUrl: string | null;
  socialLinks: Record<string, string> | string | null;
  isVerified?: boolean | null;
  portfolioCount?: number;
  languages?: string | null;
  ctaLabel?: string | null;
  ctaUrl?: string | null;
  locationCity?: string | null;
  locationCountry?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  timezoneId?: string | null;
  contactAddress?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  /** Multi-value contact entries (primary stays in legacy scalar fields). */
  contactAddresses?: ContactEntry[];
  contactPhones?: ContactEntry[];
  contactEmails?: ContactEntry[];
  availabilityHours?: string | null;
  isAvailable?: boolean;
  contactVisibility?: string | null;
  studioHeaderLayout?: string | null;
  studioHeaderContentStyle?: string | null;
  studioTabNavAlign?: string | null;
  /** Custom content-tab headline (null/empty = default). */
  studioContentHeadline?: string | null;
  /** Public boutique / shop name for all products (Explore search + display). */
  shopName?: string | null;
  /** Short answer to "Que vendez-vous ?" */
  shopSellingFocus?: string | null;
  shopDescription?: string | null;
  shopCoverUrl?: string | null;
  whyMeBlocks?: ProfileMediaBlock[];
  experienceBlocks?: ProfileMediaBlock[];
  yearsOfExperience?: number | null;
  strengthsToolsMastered?: ProfileStrengthTool[];
  reputation?: CreatorReputationDto | null;
  profileVisits?: number;
  gender?: string | null;
  /** App UX role: GENERAL_MEMBER | SERVICE_PROVIDER | FREELANCER_STUDENT | JOB_SEEKER | RH_RECRUITER */
  appRole?: string | null;
  spokenLanguages?: string[];
  profileServices?: ProfileServiceItem[];
  faqItems?: FaqItem[];
  teamMembers?: ProfileTeamMember[];
  galleryItems?: ProfileGalleryItem[];
  profileLinks?: ProfileLink[];
  memberSince?: string | null;
  responseTimeLabel?: string | null;
  /** Manual preset: WITHIN_1_HOUR | FEW_HOURS | WITHIN_DAY | WITHIN_2_3_DAYS */
  typicalResponseTime?: string | null;
  responseTimeSampleCount?: number | null;
}

export interface CreatorProfileUpdateBody {
  bio?: string;
  specialite?: string;
  websiteUrl?: string;
  socialLinks?: Record<string, string>;
  languages?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  gender?: string;
  /** App UX role: GENERAL_MEMBER | SERVICE_PROVIDER | FREELANCER_STUDENT | JOB_SEEKER | RH_RECRUITER */
  appRole?: string;
  spokenLanguages?: string[];
  profileServices?: ProfileServiceItem[];
  faqItems?: FaqItem[];
  teamMembers?: ProfileTeamMember[];
  galleryItems?: ProfileGalleryItem[];
  profileLinks?: ProfileLink[];
  locationCity?: string;
  locationCountry?: string;
  locationLat?: number;
  locationLng?: number;
  timezoneId?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  contactAddresses?: ContactEntry[];
  contactPhones?: ContactEntry[];
  contactEmails?: ContactEntry[];
  availabilityHours?: string;
  isAvailable?: boolean;
  contactVisibility?: string;
  typicalResponseTime?: string;
  studioHeaderLayout?: string;
  studioHeaderContentStyle?: string;
  studioTabNavAlign?: string;
  studioContentHeadline?: string | null;
  shopName?: string | null;
  shopSellingFocus?: string | null;
  shopDescription?: string | null;
  shopCoverUrl?: string | null;
  whyMeBlocks?: ProfileMediaBlock[];
  experienceBlocks?: ProfileMediaBlock[];
  yearsOfExperience?: number | null;
  strengthsToolsMastered?: ProfileStrengthTool[];
}

export const SOCIAL_PLATFORMS = [
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'TWITTER', label: 'X (Twitter)' },
  { value: 'LINKEDIN', label: 'LinkedIn' },
  { value: 'GITHUB', label: 'GitHub' },
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'OTHER', label: 'Other' },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]['value'];
