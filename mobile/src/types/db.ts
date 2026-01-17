/**
 * TypeScript types matching exact Supabase table names
 */

export interface Profile {
  id: string;
  role: 'diner' | 'restaurant';
  full_name: string | null;
  phone: string | null;
  extra: any | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;
}

export interface Restaurant {
  id: string;
  owner_user_id: string;
  place_id: string | null;
  name: string;
  phone: string | null;
  status: 'open' | 'busy' | 'closed';
  settings: any | null;
  // Platform information
  platforms: string[] | null;
  platform_details: Record<string, any> | null;
  // Google Places data
  address: string | null;
  lat: number | null;
  lng: number | null;
  rating: number | null;
  price_level: number | null;
  website: string | null;
  photo_url: string | null;
  google_maps_url: string | null;
  cuisine: string | null;
  types: string[] | null;
  opening_hours: any | null;
  created_at: string;
  updated_at: string;
}

export interface BookingRequest {
  id: string;
  diner_id: string;
  restaurant_id: string | null;
  place_id: string | null;
  party_size: number;
  time_window_start: string | null;
  time_window_end: string | null;
  accepted_time: string | null;
  alternates: any | null;
  preferences_snapshot: any | null;
  restaurant_message: string | null;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'ALTERNATES' | 'EXPIRED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
}

export interface WatchlistJob {
  id: string;
  diner_id: string;
  restaurant_id: string | null;
  place_id: string | null;
  restaurant_name: string;
  party_size: number;
  time_window_start: string;
  time_window_end: string;
  mode: 'notify_only' | 'auto_request_partner' | 'auto_call';
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  preferences_snapshot: any | null;
  last_checked_at: string | null;
  next_check_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SearchEvent {
  id: string;
  diner_id: string;
  place_id: string | null;
  restaurant_id: string | null;
  query_text: string;
  intent: any;
  created_at: string;
}
