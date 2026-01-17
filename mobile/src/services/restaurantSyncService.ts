/**
 * Restaurant Sync Service
 * Handles syncing restaurants from Google Places to the database
 * with platform detection and data enrichment
 */

import { restaurantApi } from '../utils/api';
import { supabase } from '../lib/supabase';

export interface SyncOptions {
  placeId?: string;
  query?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  limit?: number;
  ownerUserId?: string;
}

export interface SyncResult {
  success: boolean;
  restaurant?: any;
  message?: string;
  error?: string;
}

export interface BulkSyncResult {
  total: number;
  synced: number;
  updated: number;
  failed: number;
  errors: Array<{ restaurant: string; error: string }>;
}

export interface SyncProgress {
  current: number;
  total: number;
  restaurantName: string;
  status: 'syncing' | 'success' | 'error';
  error?: string;
}

/**
 * Syncs a single restaurant by place ID
 */
export async function syncRestaurant(
  placeId: string,
  ownerUserId?: string
): Promise<SyncResult> {
  try {
    // Get current user if ownerUserId not provided
    let userId = ownerUserId;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    const response = await restaurantApi.sync(placeId, userId);

    if (response.error) {
      return {
        success: false,
        error: response.error,
      };
    }

    return {
      success: true,
      restaurant: response.data?.restaurant,
      message: response.data?.message || 'Restaurant synced successfully',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to sync restaurant',
    };
  }
}

/**
 * Syncs multiple restaurants from a Google Places search
 * Returns progress updates via callback
 */
export async function syncRestaurantsFromSearch(
  options: SyncOptions,
  onProgress?: (progress: SyncProgress) => void
): Promise<BulkSyncResult> {
  const result: BulkSyncResult = {
    total: 0,
    synced: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Search for restaurants
    const searchResponse = await restaurantApi.search(
      options.query || 'restaurant',
      options.lat,
      options.lng,
      options.radius || 5000
    );

    if (searchResponse.error || !searchResponse.data) {
      throw new Error(searchResponse.error || 'Failed to search restaurants');
    }

    const restaurants = (searchResponse.data as any).results || [];
    result.total = Math.min(restaurants.length, options.limit || restaurants.length);

    // Sync each restaurant
    for (let i = 0; i < result.total; i++) {
      const restaurant = restaurants[i];
      const placeId = restaurant.placeId || restaurant.place_id;

      if (!placeId) {
        result.failed++;
        result.errors.push({
          restaurant: restaurant.name || 'Unknown',
          error: 'Missing place_id',
        });
        continue;
      }

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: result.total,
          restaurantName: restaurant.name || 'Unknown',
          status: 'syncing',
        });
      }

      // Sync restaurant
      const syncResult = await syncRestaurant(placeId, options.ownerUserId);

      if (syncResult.success) {
        // Check if it was an update or new sync
        // The backend returns 'updated' in the message, but we can't easily detect this
        // So we'll count all successful syncs as synced
        result.synced++;
      } else {
        result.failed++;
        result.errors.push({
          restaurant: restaurant.name || 'Unknown',
          error: syncResult.error || 'Unknown error',
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: result.total,
            restaurantName: restaurant.name || 'Unknown',
            status: 'error',
            error: syncResult.error,
          });
        }
      }

      // Add delay to avoid rate limiting
      if (i < result.total - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return result;
  } catch (error) {
    result.errors.push({
      restaurant: 'Search',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return result;
  }
}

/**
 * Syncs restaurants from the database
 * Fetches restaurants that need updating and syncs them
 */
export async function syncRestaurantsFromDatabase(
  options: SyncOptions,
  onProgress?: (progress: SyncProgress) => void
): Promise<BulkSyncResult> {
  const result: BulkSyncResult = {
    total: 0,
    synced: 0,
    updated: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Fetch restaurants from database
    const { data: restaurants, error } = await supabase
      .from('restaurants')
      .select('place_id, name')
      .not('place_id', 'is', null)
      .limit(options.limit || 100);

    if (error) {
      throw new Error(error.message);
    }

    if (!restaurants || restaurants.length === 0) {
      return result;
    }

    result.total = restaurants.length;

    // Sync each restaurant
    for (let i = 0; i < result.total; i++) {
      const restaurant = restaurants[i];

      if (!restaurant.place_id) {
        result.failed++;
        result.errors.push({
          restaurant: restaurant.name || 'Unknown',
          error: 'Missing place_id',
        });
        continue;
      }

      // Report progress
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: result.total,
          restaurantName: restaurant.name || 'Unknown',
          status: 'syncing',
        });
      }

      // Sync restaurant
      const syncResult = await syncRestaurant(restaurant.place_id, options.ownerUserId);

      if (syncResult.success) {
        result.updated++;
        
        if (onProgress) {
          onProgress({
            current: i + 1,
            total: result.total,
            restaurantName: restaurant.name || 'Unknown',
            status: 'success',
          });
        }
      } else {
        result.failed++;
        result.errors.push({
          restaurant: restaurant.name || 'Unknown',
          error: syncResult.error || 'Unknown error',
        });

        if (onProgress) {
          onProgress({
            current: i + 1,
            total: result.total,
            restaurantName: restaurant.name || 'Unknown',
            status: 'error',
            error: syncResult.error,
          });
        }
      }

      // Add delay to avoid rate limiting
      if (i < result.total - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return result;
  } catch (error) {
    result.errors.push({
      restaurant: 'Database Query',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return result;
  }
}

/**
 * Syncs a restaurant from search results
 * Useful when user selects a restaurant from search
 */
export async function syncRestaurantFromSearchResult(
  restaurant: any
): Promise<SyncResult> {
  const placeId = restaurant.placeId || restaurant.place_id;
  
  if (!placeId) {
    return {
      success: false,
      error: 'Restaurant missing place_id',
    };
  }

  return syncRestaurant(placeId);
}
