/**
 * Platform Data Service
 * Fetches availability and booking data from reservation platforms
 * and stores/retrieves it from Supabase
 */

import { bookingApi } from '../utils/api';
import { supabase } from '../lib/supabase';

export interface AvailabilitySlot {
  datetime: string;
  partySize: number;
  verified: boolean;
  provider: string;
  bookingUrl?: string;
  metadata?: Record<string, any>;
}

export interface PlatformAvailability {
  placeId: string;
  restaurantName: string;
  requestedDate: string;
  partySize: number;
  providerOptions: Array<{
    name: string;
    enabled: boolean;
    verified: boolean;
  }>;
  slots: AvailabilitySlot[];
  cachedAt?: string;
}

export interface PlatformDataCache {
  place_id: string;
  platform: string;
  availability_data: any;
  cached_at: string;
  expires_at: string;
}

/**
 * Fetches availability from platforms via backend API
 */
export async function fetchPlatformAvailability(
  placeId: string,
  datetime: string,
  partySize: number
): Promise<PlatformAvailability | null> {
  try {
    const response = await bookingApi.getAvailability(placeId, datetime, partySize);

    if (response.error || !response.data) {
      console.error('Failed to fetch availability:', response.error);
      return null;
    }

    const data = response.data as any;
    
    return {
      placeId: data.placeId || placeId,
      restaurantName: data.restaurantName || '',
      requestedDate: data.requestedDate || datetime,
      partySize: data.partySize || partySize,
      providerOptions: data.providerOptions || [],
      slots: data.slots || [],
      cachedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching platform availability:', error);
    return null;
  }
}

/**
 * Stores platform availability data in Supabase cache
 */
export async function cachePlatformAvailability(
  placeId: string,
  platform: string,
  availabilityData: any,
  expiresInMinutes: number = 15
): Promise<boolean> {
  if (!supabase) {
    console.warn('Supabase not initialized');
    return false;
  }

  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + expiresInMinutes * 60 * 1000);

    const { error } = await supabase
      .from('platform_data_cache')
      .upsert({
        place_id: placeId,
        platform: platform,
        availability_data: availabilityData,
        cached_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'place_id,platform',
      });

    if (error) {
      console.error('Error caching platform data:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error caching platform availability:', error);
    return false;
  }
}

/**
 * Retrieves cached platform availability from Supabase
 */
export async function getCachedPlatformAvailability(
  placeId: string,
  platform: string
): Promise<PlatformAvailability | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('platform_data_cache')
      .select('*')
      .eq('place_id', placeId)
      .eq('platform', platform)
      .gt('expires_at', new Date().toISOString())
      .order('cached_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return data.availability_data as PlatformAvailability;
  } catch (error) {
    console.error('Error retrieving cached availability:', error);
    return null;
  }
}

/**
 * Fetches availability with caching
 * First checks cache, then fetches from API if needed
 */
export async function getPlatformAvailability(
  placeId: string,
  datetime: string,
  partySize: number,
  useCache: boolean = true
): Promise<PlatformAvailability | null> {
  // Try cache first if enabled
  if (useCache) {
    // Check cache for all platforms and aggregate results
    const platforms = ['opentable', 'resy', 'tock', 'yelp_reservations', 'google_reserve'];
    const cachedResults: PlatformAvailability[] = [];
    const cachedPlatforms = new Set<string>();

    for (const platform of platforms) {
      const cached = await getCachedPlatformAvailability(placeId, platform);
      if (cached) {
        cachedResults.push(cached);
        cachedPlatforms.add(platform);
        console.log(`Found cached availability for ${platform}`);
      }
    }

    // If we have cached data, aggregate it
    if (cachedResults.length > 0) {
      const aggregated: PlatformAvailability = {
        placeId: cachedResults[0].placeId,
        restaurantName: cachedResults[0].restaurantName,
        requestedDate: cachedResults[0].requestedDate,
        partySize: cachedResults[0].partySize,
        providerOptions: cachedResults[0].providerOptions,
        slots: cachedResults.flatMap(result => result.slots),
        cachedAt: cachedResults[0].cachedAt,
      };

      // Deduplicate slots by datetime and provider
      const uniqueSlots = aggregated.slots.filter((slot, index, self) =>
        index === self.findIndex(s => 
          s.datetime === slot.datetime && s.provider === slot.provider
        )
      );
      aggregated.slots = uniqueSlots;

      // Return cached data if we have any valid cache
      // Fresh data will be fetched if needed (when cache expires or is missing)
      console.log(`Using cached availability from ${cachedPlatforms.size} platform(s)`);
      return aggregated;
    }
  }

  // Fetch fresh data from API
  const availability = await fetchPlatformAvailability(placeId, datetime, partySize);

  if (availability) {
    // Cache the data for each platform that has slots
    const platforms = new Set(
      availability.slots.map(slot => slot.provider)
    );

    for (const platform of platforms) {
      const platformSlots = availability.slots.filter(s => s.provider === platform);
      await cachePlatformAvailability(placeId, platform, {
        ...availability,
        slots: platformSlots,
      });
    }
  }

  return availability;
}

/**
 * Gets restaurant platform information from Supabase
 */
export async function getRestaurantPlatforms(placeId: string): Promise<{
  platforms: string[];
  platformDetails: Record<string, any>;
} | null> {
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('platforms, platform_details')
      .eq('place_id', placeId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      platforms: (data.platforms as string[]) || [],
      platformDetails: (data.platform_details as Record<string, any>) || {},
    };
  } catch (error) {
    console.error('Error getting restaurant platforms:', error);
    return null;
  }
}

/**
 * Stores platform booking data in Supabase
 * Useful for tracking bookings made through platforms
 */
export async function storePlatformBooking(
  placeId: string,
  platform: string,
  bookingData: {
    datetime: string;
    partySize: number;
    bookingId?: string;
    confirmationUrl?: string;
    metadata?: Record<string, any>;
  }
): Promise<boolean> {
  if (!supabase) {
    return false;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('User not authenticated');
      return false;
    }

    // Store in bookings table or a platform_bookings table
    // For now, we'll use the existing bookings table
    const { error } = await supabase
      .from('bookings')
      .insert({
        user_id: user.id,
        place_id: placeId,
        restaurant_name: bookingData.metadata?.restaurantName || '',
        datetime: bookingData.datetime,
        party_size: bookingData.partySize,
        provider: platform,
        status: 'CONFIRMED',
        booking_url: bookingData.confirmationUrl,
        provider_booking_id: bookingData.bookingId,
        confirmation: bookingData.metadata,
      });

    if (error) {
      console.error('Error storing platform booking:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error storing platform booking:', error);
    return false;
  }
}

/**
 * Gets all cached platform data for a restaurant
 */
export async function getAllCachedPlatformData(placeId: string): Promise<PlatformDataCache[]> {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('platform_data_cache')
      .select('*')
      .eq('place_id', placeId)
      .gt('expires_at', new Date().toISOString())
      .order('cached_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data as PlatformDataCache[];
  } catch (error) {
    console.error('Error getting cached platform data:', error);
    return [];
  }
}

/**
 * Clears expired cache entries
 */
export async function clearExpiredCache(placeId?: string): Promise<number> {
  if (!supabase) {
    return 0;
  }

  try {
    // First, get the count of expired entries
    let countQuery = supabase
      .from('platform_data_cache')
      .select('id', { count: 'exact', head: true })
      .lt('expires_at', new Date().toISOString());

    if (placeId) {
      countQuery = countQuery.eq('place_id', placeId);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      console.error('Error counting expired cache:', countError);
      return 0;
    }

    // Then delete the expired entries
    let deleteQuery = supabase
      .from('platform_data_cache')
      .delete()
      .lt('expires_at', new Date().toISOString());

    if (placeId) {
      deleteQuery = deleteQuery.eq('place_id', placeId);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Error clearing expired cache:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error clearing expired cache:', error);
    return 0;
  }
}
