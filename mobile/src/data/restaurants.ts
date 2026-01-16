/**
 * Restaurant Data Functions
 */

import { restaurantApi } from '../utils/api';
import { Restaurant } from '../types';

export interface ListRestaurantsFilters {
  city?: string;
  cuisine?: string;
  q?: string;
}

export const listRestaurants = async (filters?: ListRestaurantsFilters): Promise<Restaurant[]> => {
  try {
    // Build query from filters
    let query = 'restaurant';
    if (filters?.q) {
      query = filters.q;
    } else if (filters?.cuisine) {
      query = `${filters.cuisine} restaurant`;
    }
    if (filters?.city) {
      query = `${query} ${filters.city}`;
    }

    const response = await restaurantApi.search(query);
    if (response.data?.results) {
      // Transform API results to Restaurant format
      return response.data.results.map((r: any) => ({
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
        platform: r.platform,
      }));
    }
    return [];
  } catch (error) {
    console.error('Error listing restaurants:', error);
    return [];
  }
};
