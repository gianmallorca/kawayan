export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface User {
  id: number;
  email: string;
  displayName: string;
  permissions: string[];
}

export interface CompanyDetails {
  nameMain: string;
  nameBaybayin: string;
  tagline: string;
  logoUrl?: string;
  primaryColor: string;
  email: string;
  phone: string;
  street: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  country: string;
  postalCode: string;
  fullAddress: string;
  latitude?: number | null;
  longitude?: number | null;
  website: string;
  socialLinks: Record<string, string>;
  coverImageUrl?: string;
  aboutImageUrl?: string;
  establishedYear?: number;
  shortDescription: string;
  fullDescription: string;
  updatedAt: string;
}

export interface PageSection {
  page: string;
  sectionKey: string;
  contentJson: string;
  updatedAt: string;
}

export interface ServiceItem {
  id: number;
  title: string;
  description: string;
  price?: number | null;
  iconUrl?: string;
  imageUrl?: string;
}

export interface ArticleListItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  imageUrl?: string;
  fullName: string;
  publishedAt?: string | null;
}

export interface ArticleDetail extends ArticleListItem {
  content: string;
  imageDescription: string;
}

export interface ArticleAdmin extends ArticleDetail {
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCompanyResult {
  company: CompanyDetails;
  geocodeWarning?: string | null;
}

export interface ReverseGeocodeResult {
  street: string;
  barangay: string;
  city: string;
  province: string;
  region: string;
  country: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  displayName: string;
}

export type UpdateCompanyPayload = CompanyDetails & {
  mapLocationPinned?: boolean;
};

export interface Inquiry {
  id: number;
  senderName: string;
  senderEmail: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface MediaFile {
  id: number;
  fileName: string;
  url: string;
  uploadedAt: string;
}
