export interface ConsentModel {
  id: string;
  websiteId: string;
  consentGiven: boolean;
  categories: string; // JSON string
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
