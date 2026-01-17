/**
 * Supabase Data Service
 * Fetches data directly from Supabase tables
 * Use this to load data that's already in your Supabase database
 */

import { supabase } from '../lib/supabase';
import { Restaurant } from '../types';

export interface SupabaseRestaurant {
  id: string;
  owner_user_id: string | null;
  place_id: string;
  name: string;
  phone?: string | null;
  status: 'open' | 'busy' | 'closed';
  settings: any | null;
  platforms?: string[] | null;
  platform_details?: Record<string, any> | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  rating?: number | null;
  price_level?: number | null;
  website?: string | null;
  photo_url?: string | null;
  google_maps_url?: string | null;
  cuisine?: string | null;
  types?: string[] | null;
  opening_hours?: any | null;
  created_at?: string;
  updated_at?: string;
}

export interface FetchRestaurantsOptions {
  limit?: number;
  offset?: number;
  ownerUserId?: string;
  placeId?: string;
  hasPlatforms?: boolean;
  city?: string;
  cuisine?: string;
}

/**
 * Fetches restaurants directly from Supabase
 */
export async function fetchRestaurantsFromSupabase(
  options: FetchRestaurantsOptions = {}
): Promise<SupabaseRestaurant[]> {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return [];
  }

  try {
    let query = supabase
      .from('restaurants')
      .select('*');

    // Apply filters
    if (options.ownerUserId) {
      query = query.eq('owner_user_id', options.ownerUserId);
    }

    if (options.placeId) {
      query = query.eq('place_id', options.placeId);
    }

    if (options.hasPlatforms) {
      query = query.not('platforms', 'is', null);
    }

    if (options.city) {
      // Assuming address contains city name
      query = query.ilike('address', `%${options.city}%`);
    }

    if (options.cuisine) {
      query = query.eq('cuisine', options.cuisine);
    }

    // Apply pagination
    if (options.limit) {
      query = query.limit(options.limit);
    }

    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 100) - 1);
    }

    // Order by most recently updated
    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching restaurants from Supabase:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return [];
    }

    console.log(`Successfully fetched ${data?.length || 0} restaurants from Supabase`);
    return (data || []) as SupabaseRestaurant[];
  } catch (error) {
    console.error('Error fetching restaurants from Supabase:', error);
    return [];
  }
}

/**
 * Fetches a single restaurant by place_id
 */
export async function fetchRestaurantByPlaceId(
  placeId: string
): Promise<SupabaseRestaurant | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('place_id', placeId)
      .single();

    if (error) {
      console.error('Error fetching restaurant:', error);
      return null;
    }

    return data as SupabaseRestaurant;
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    return null;
  }
}

/**
 * Fetches bookings from Supabase
 */
export async function fetchBookingsFromSupabase(options: {
  userId?: string;
  placeId?: string;
  upcoming?: boolean;
  limit?: number;
} = {}): Promise<any[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('bookings')
      .select('*');

    if (options.userId) {
      query = query.eq('user_id', options.userId);
    }

    if (options.placeId) {
      query = query.eq('place_id', options.placeId);
    }

    if (options.upcoming !== undefined) {
      const now = new Date().toISOString();
      if (options.upcoming) {
        query = query.gte('datetime', now);
      } else {
        query = query.lt('datetime', now);
      }
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('datetime', { ascending: options.upcoming !== false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
}

/**
 * Fetches platform data cache from Supabase
 */
export async function fetchPlatformCacheFromSupabase(options: {
  placeId?: string;
  platform?: string;
  includeExpired?: boolean;
  limit?: number;
} = {}): Promise<any[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('platform_data_cache')
      .select('*');

    if (options.placeId) {
      query = query.eq('place_id', options.placeId);
    }

    if (options.platform) {
      query = query.eq('platform', options.platform);
    }

    if (!options.includeExpired) {
      const now = new Date().toISOString();
      query = query.gt('expires_at', now);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('cached_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching platform cache:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching platform cache:', error);
    return [];
  }
}

/**
 * Fetches booking requests from Supabase
 */
export async function fetchBookingRequestsFromSupabase(options: {
  dinerId?: string;
  restaurantId?: string;
  status?: string;
  limit?: number;
} = {}): Promise<any[]> {
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('booking_requests')
      .select('*');

    if (options.dinerId) {
      query = query.eq('diner_id', options.dinerId);
    }

    if (options.restaurantId) {
      query = query.eq('restaurant_id', options.restaurantId);
    }

    if (options.status) {
      query = query.eq('status', options.status);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching booking requests:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    return [];
  }
}

/**
 * Loads all data from Supabase for the current user
 * Useful for initial app load or data refresh
 */
export interface AllSupabaseData {
  restaurants: SupabaseRestaurant[];
  bookings: any[];
  platformCache: any[];
  bookingRequests: any[];
}

export async function loadAllDataFromSupabase(options: {
  userId?: string;
  includeExpiredCache?: boolean;
  restaurantLimit?: number;
  bookingLimit?: number;
} = {}): Promise<AllSupabaseData> {
  if (!supabase) {
    return {
      restaurants: [],
      bookings: [],
      platformCache: [],
      bookingRequests: [],
    };
  }

  try {
    // Get current user if not provided
    let userId = options.userId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    // Fetch all data in parallel
    const [restaurants, bookings, platformCache, bookingRequests] = await Promise.all([
      fetchRestaurantsFromSupabase({
        limit: options.restaurantLimit || 100,
      }),
      fetchBookingsFromSupabase({
        userId,
        limit: options.bookingLimit || 50,
      }),
      fetchPlatformCacheFromSupabase({
        includeExpired: options.includeExpiredCache || false,
        limit: 100,
      }),
      fetchBookingRequestsFromSupabase({
        dinerId: userId,
        limit: 50,
      }),
    ]);

    return {
      restaurants,
      bookings,
      platformCache,
      bookingRequests,
    };
  } catch (error) {
    console.error('Error loading all data from Supabase:', error);
    return {
      restaurants: [],
      bookings: [],
      platformCache: [],
      bookingRequests: [],
    };
  }
}

/**
 * Converts Supabase restaurant to app Restaurant type
 */
export function convertSupabaseRestaurantToApp(
  supabaseRestaurant: SupabaseRestaurant
): Restaurant {
  return {
    id: supabaseRestaurant.id,
    name: supabaseRestaurant.name,
    cuisine: supabaseRestaurant.cuisine || 'Restaurant',
    rating: supabaseRestaurant.rating || 0,
    priceLevel: supabaseRestaurant.price_level || 2,
    location: supabaseRestaurant.address || '',
    imageUrl: supabaseRestaurant.photo_url || undefined,
    bookingLink: supabaseRestaurant.google_maps_url || undefined,
    platforms: supabaseRestaurant.platforms || [],
    platformDetails: supabaseRestaurant.platform_details || {},
    placeId: supabaseRestaurant.place_id,
    highlights: supabaseRestaurant.types || [],
  };
}
