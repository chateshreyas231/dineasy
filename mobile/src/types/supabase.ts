/**
 * Supabase Database Types
 * Core types matching the database schema
 */

export interface Profile {
  id: string;
  role: 'diner' | 'restaurant';
  full_name: string | null;
  name?: string | null; // Alias for full_name for backward compatibility
  phone: string | null;
  extra: any | null;
  push_token?: string | null;
  created_at?: string;
}

export interface Restaurant {
  id: string;
  owner_user_id: string;
  place_id: string;
  name: string;
  phone?: string | null;
  status: 'open' | 'busy' | 'closed';
  settings: any | null;
}

export interface ReservationRequest {
  id: string;
  diner_user_id: string;
  restaurant_id: string;
  place_id: string;
  party_size: number;
  time_window_start: string;
  time_window_end: string;
  notes?: string | null;
  preferences_snapshot?: any | null;
  status: string;
  accepted_time?: string | null;
  alternates?: any | null;
  restaurant_message?: string | null;
  created_at: string;
}

export interface WatchlistJob {
  id: string;
  diner_user_id: string;
  place_id: string;
  restaurant_name: string;
  party_size: number;
  time_window_start: string;
  time_window_end: string;
  preferences_snapshot?: any | null;
  mode: string;
  status: string;
  last_checked_at?: string | null;
  next_check_at?: string | null;
  created_at: string;
}

export interface SearchEvent {
  id: string;
  diner_user_id: string;
  place_id: string;
  restaurant_name: string;
  query_text?: string | null;
  query_intent?: any | null;
  created_at: string;
}
