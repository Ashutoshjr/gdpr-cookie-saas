// ─── Auth ──────────────────────────────────────────────────────────────────

export interface AuthUser {
  userId: string;
  email: string;
  fullName: string;
  token: string;
  expiresAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface UserProfileDto {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  plan: string;
}

export interface UsageSummary {
  plan: string;
  websitesUsed: number;
  websitesLimit: number;   // -1 = unlimited
  consentsThisMonth: number;
  consentsLimit: number;   // -1 = unlimited
  websiteLimitReached: boolean;
  consentLimitReached: boolean;
}

// ─── Websites ──────────────────────────────────────────────────────────────

export interface CookieCategory {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
}

export interface WebsiteDto {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  createdAt: string;
  primaryColor: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerPosition: 'bottom' | 'top';
  language: string;
  geoRestrictionEnabled: boolean;
  privacyPolicyUrl: string;
  categories: CookieCategory[];
}

export interface CreateWebsiteRequest {
  name: string;
  domain: string;
}

export interface UpdateWebsiteInfoRequest {
  name: string;
  domain: string;
}

export interface UpdateBannerAppearanceRequest {
  primaryColor: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerPosition: string;
  language: string;
  geoRestrictionEnabled: boolean;
  privacyPolicyUrl: string;
}

// ─── Consents ──────────────────────────────────────────────────────────────

export interface ConsentRecord {
  id: string;
  websiteId: string;
  consentGiven: boolean;
  categories: string;   // JSON string: {"analytics": true, "marketing": false}
  timestamp: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface ConsentSummary {
  totalConsents: number;
  acceptedAll: number;
  rejectedAll: number;
  customized: number;
  thisMonth: number;
  acceptRate: number;
  rejectRate: number;
  customizeRate: number;
}

export interface DailyConsent {
  date: string;    // "YYYY-MM-DD"
  total: number;
  accepted: number;
  rejected: number;
}

export interface CategoryRate {
  category: string;
  acceptedCount: number;
  totalCount: number;
  acceptRate: number;
}

// ─── Config (SDK) ──────────────────────────────────────────────────────────

export interface ConfigCategoryDto {
  name: string;
  description: string;
  isRequired: boolean;
}

export interface ConfigResponse {
  websiteId: string;
  websiteName: string;
  domain: string;
  version: number;
  primaryColor: string;
  position: string;
  bannerTitle: string;
  bannerDescription: string;
  language: string;
  geoRestrictionEnabled: boolean;
  privacyPolicyUrl: string;
  categories: ConfigCategoryDto[];
}

// ─── Translations ──────────────────────────────────────────────────────────

export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl' | 'pl';

export interface BannerTranslations {
  acceptAll: string;
  rejectAll: string;
  customize: string;
  savePreferences: string;
  required: string;
  modalTitle: string;
  manage: string;
  description: string;
}
