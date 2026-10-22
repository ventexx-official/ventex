/**
 * TypeScript types corresponding to supabase/schema.sql
 */

export type ProductStatus = 'draft' | 'live' | 'removed';
export type ProductType = 'software' | 'hardware';
export type InquiryStatus = 'new' | 'replied' | 'closed';

export interface Product {
  id: string;
  seller_id: string;
  pitch_id: string | null;
  status: ProductStatus;
  removed_reason: string | null;
  name: string;
  description: string | null;
  product_type: ProductType;
  category: string | null;
  price: number | null;
  currency: string;
  image_urls: string[];
  product_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductInquiry {
  id: string;
  product_id: string;
  buyer_id: string;
  seller_id: string;
  message: string;
  contact_email: string | null;
  contact_phone: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  company: string | null;
  bio?: string | null;
  country?: string | null;
  city?: string | null;
}
