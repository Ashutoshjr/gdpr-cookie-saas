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
  categories: CookieCategoryModel[];
}

export interface CreateWebsiteRequest {
  name: string;
  domain: string;
}
