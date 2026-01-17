/**
 * Restaurant Data Functions
 */

import { restaurantApi } from '../utils/api';
import { Restaurant } from '../types';
import { syncRestaurant, syncRestaurantsFromSearch, syncRestaurantsFromDatabase, syncRestaurantFromSearchResult } from '../services/restaurantSyncService';
import {
  getPlatformAvailability,
  getRestaurantPlatforms,
  storePlatformBooking,
  fetchPlatformAvailability,
} from '../services/platformDataService';
import {
  fetchRestaurantsFromSupabase,
  fetchRestaurantByPlaceId,
  convertSupabaseRestaurantToApp,
  fetchBookingsFromSupabase,
  fetchPlatformCacheFromSupabase,
  fetchBookingRequestsFromSupabase,
  loadAllDataFromSupabase,
} from '../services/supabaseDataService';

// Export sync functions
export { syncRestaurant, syncRestaurantsFromSearch, syncRestaurantsFromDatabase, syncRestaurantFromSearchResult };

// Export platform data functions
export {
  getPlatformAvailability,
  getRestaurantPlatforms,
  storePlatformBooking,
  fetchPlatformAvailability,
};

// Re-export Supabase data functions for convenience
export {
  fetchRestaurantsFromSupabase,
  fetchRestaurantByPlaceId,
  fetchBookingsFromSupabase,
  fetchPlatformCacheFromSupabase,
  fetchBookingRequestsFromSupabase,
  loadAllDataFromSupabase,
  convertSupabaseRestaurantToApp,
};

export interface ListRestaurantsFilters {
  city?: string;
  location?: string;
  cuisine?: string;
  venueType?: string;
  vibes?: string[];
  partySize?: number;
  q?: string;
}

/**
 * Lists restaurants from backend API (Google Places search)
 * Use listRestaurantsFromSupabase to fetch from Supabase directly
 */
export const listRestaurants = async (filters?: ListRestaurantsFilters): Promise<Restaurant[]> => {
  try {
    // Build query from filters
    let queryParts: string[] = [];
    
    // Start with base restaurant query
    if (filters?.q) {
      queryParts.push(filters.q);
    } else {
      // Build query from filters
      if (filters?.venueType) {
        queryParts.push(filters.venueType);
      } else {
        queryParts.push('restaurant');
      }
      
      if (filters?.cuisine) {
        queryParts.push(filters.cuisine);
      }
      
      // Add vibe filters
      if (filters?.vibes && filters.vibes.length > 0) {
        queryParts.push(...filters.vibes);
      }
    }
    
    // Add location
    if (filters?.location) {
      queryParts.push(filters.location);
    } else if (filters?.city) {
      queryParts.push(filters.city);
    }
    
    const query = queryParts.join(' ');

    const response = await restaurantApi.search(query);
    if (response.data && typeof response.data === 'object' && 'results' in response.data && Array.isArray((response.data as any).results)) {
      // Transform API results to Restaurant format
      const responseData = response.data as { results: any[] };
      let results = responseData.results.map((r: any) => ({
        id: r.placeId || r.id,
        name: r.name,
        cuisine: r.types?.[0]?.replace('_', ' ') || filters?.cuisine || 'Restaurant',
        rating: r.rating || 0,
        priceLevel: r.priceLevel || r.price_level || 2,
        location: r.address || r.location || '',
        distance: r.distance,
        imageUrl: r.photoUrl || r.imageUrl,
        highlights: r.types?.slice(0, 3) || [],
        bookingLink: r.bookingLink || r.googleMapsUrl,
        platform: r.platform, // Keep for backward compatibility
        platforms: r.platforms || (r.platform ? [r.platform] : []), // Support both single and array
        platformDetails: r.platformDetails,
        placeId: r.placeId,
      }));
      
      // Apply client-side filtering for vibes if needed
      if (filters?.vibes && filters.vibes.length > 0) {
        // Filter by checking if restaurant types match any of the vibe keywords
        const vibeKeywords = filters.vibes.map(v => v.toLowerCase());
        results = results.filter((r: Restaurant) => {
          const restaurantText = `${r.name} ${r.cuisine} ${r.highlights?.join(' ') || ''}`.toLowerCase();
          return vibeKeywords.some(vibe => restaurantText.includes(vibe));
        });
      }
      
      return results;
    }
    return [];
  } catch (error) {
    console.error('Error listing restaurants:', error);
    return [];
  }
};

/**
 * Lists restaurants directly from Supabase
 * Use this to load restaurants that are already in your database
 */
export const listRestaurantsFromSupabase = async (options: {
  limit?: number;
  offset?: number;
  ownerUserId?: string;
  placeId?: string;
  hasPlatforms?: boolean;
  city?: string;
  cuisine?: string;
} = {}): Promise<Restaurant[]> => {
  try {
    const supabaseRestaurants = await fetchRestaurantsFromSupabase(options);
    return supabaseRestaurants.map(convertSupabaseRestaurantToApp);
  } catch (error) {
    console.error('Error listing restaurants from Supabase:', error);
    return [];
  }
};

/**
 * Gets a single restaurant from Supabase by place_id
 */
export const getRestaurantFromSupabase = async (placeId: string): Promise<Restaurant | null> => {
  try {
    const supabaseRestaurant = await fetchRestaurantByPlaceId(placeId);
    if (!supabaseRestaurant) {
      return null;
    }
    return convertSupabaseRestaurantToApp(supabaseRestaurant);
  } catch (error) {
    console.error('Error getting restaurant from Supabase:', error);
    return null;
  }
};
