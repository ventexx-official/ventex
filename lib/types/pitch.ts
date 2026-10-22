import { ProductStatus, ProductType, InquiryStatus, PublicProfile } from './marketplace';

export type PitchStatus = 'draft' | 'live' | 'removed';
export type PitchStage = 'idea' | 'prototype' | 'mvp' | 'early_revenue' | 'growth';

export interface Pitch {
  id: string;
  founder_id: string;
  status: PitchStatus;
  removed_reason: string | null;
  title: string;
  tagline: string | null;
  industry: string | null;
  stage: PitchStage | null;
  problem: string | null;
  solution: string | null;
  target_customer: string | null;
  market_size: string | null;
  business_model: string | null;
  traction: string | null;
  competitors: string | null;
  team: string | null;
  use_of_funds: string | null;
  is_raising: boolean;
  amount_seeking: number | null;
  currency: string;
  logo_url: string | null;
  website_url: string | null;
  pitch_deck_path: string | null;
  demo_video_url: string | null;
  country: string | null;
  city: string | null;
  current_version: number;
  last_saved_at: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PitchVersion {
  id: string;
  pitch_id: string;
  version_number: number;
  snapshot: any;
  created_by: string | null;
  created_at: string;
}

export interface PitchScore {
  id: string;
  pitch_id: string;
  overall: number;
  pitch_quality: number | null;
  longevity: number | null;
  sustainability: number | null;
  market_potential: number | null;
  feasibility: number | null;
  summary: string | null;
  strengths: any;
  improvements: any;
  scored_version: number | null;
  model: string | null;
  computed_at: string;
}

export interface PitchRating {
  id: string;
  pitch_id: string;
  user_id: string;
  stars: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  pitch_id: string;
  user_id: string;
  body: string;
  created_at: string;
}

export interface FundingInterest {
  id: string;
  pitch_id: string;
  investor_id: string;
  message: string | null;
  created_at: string;
}

export * from './marketplace';
