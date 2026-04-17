export interface CookieCategoryModel {
  id: string;
  name: string;
  description: string;
  isRequired: boolean;
}

export interface WebsiteModel {
  id: string;
  name: string;
  domain: string;
  apiKey: string;
  createdAt: string;
  primaryColor: string;
  bannerTitle: string;
  bannerDescription: string;
  bannerPosition: string;
  language: string;
  geoRestrictionEnabled: boolean;
  privacyPolicyUrl: string;
  categories: CookieCategoryModel[];
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
