/**
 * Yelp Adapter
 * Searches Yelp for restaurants with reservation options
 * 
 * For MVP: Uses Yelp Fusion API if available, otherwise returns sample data
 * TODO: Implement full Yelp API integration with reservation detection
 */

import { QueryIntent, RestaurantOption } from '../types';
import { PlatformAdapter, createRestaurantOption, safeAdapterCall } from './baseAdapter';

export class YelpAdapter implements PlatformAdapter {
  platformName = 'Yelp';
  private apiKey?: string;

  constructor() {
    this.apiKey = process.env.YELP_API_KEY;
  }

  /**
   * Search Yelp for restaurants with reservation options
   */
  async searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]> {
    return safeAdapterCall(async () => {
      if (this.apiKey) {
        // TODO: Implement Yelp Fusion API call
        // return await this.searchYelpAPI(intent);
      }
      
      // For MVP, return sample data
      return this.getSampleData(intent);
    }, this.platformName);
  }

  /**
   * Searches Yelp using Fusion API (to be implemented)
   */
  private async searchYelpAPI(intent: QueryIntent): Promise<RestaurantOption[]> {
    // TODO: Implement Yelp Fusion API integration
    // const response = await fetch(`https://api.yelp.com/v3/businesses/search?location=${intent.location}&term=${intent.cuisine || 'restaurant'}`, {
    //   headers: { 'Authorization': `Bearer ${this.apiKey}` }
    // });
    // const data = await response.json();
    // Process and return results
    return [];
  }

  /**
   * Returns sample data for MVP testing
   */
  private getSampleData(intent: QueryIntent): RestaurantOption[] {
    const sampleRestaurants = [
      {
        name: 'Sushi-San',
        rating: 4.6,
        cuisine: 'Sushi',
        vibeTags: ['casual', 'trendy'],
        priceRange: '$$'
      },
      {
        name: 'Monteverde',
        rating: 4.7,
        cuisine: 'Italian',
        vibeTags: ['romantic', 'upscale'],
        priceRange: '$$$'
      }
    ];

    return sampleRestaurants
      .filter(r => !intent.cuisine || r.cuisine.toLowerCase().includes(intent.cuisine.toLowerCase()))
      .map(r => createRestaurantOption(
        r.name,
        this.platformName,
        intent.dateTime,
        intent.partySize,
        intent.location,
        {
          cuisine: r.cuisine,
          rating: r.rating,
          vibeTags: r.vibeTags,
          priceRange: r.priceRange,
          bookingLink: `https://www.yelp.com/reservations/${r.name.toLowerCase().replace(/\s+/g, '-')}-${intent.location.toLowerCase().replace(/\s+/g, '-')}`
        }
      ));
  }
}


