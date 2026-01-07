/**
 * Tock Adapter
 * Searches Tock (exploretock.com) for available reservations
 * 
 * For MVP: Returns sample data
 * TODO: Implement Puppeteer scraping for Tock
 */

import { QueryIntent, RestaurantOption } from '../types';
import { PlatformAdapter, createRestaurantOption, safeAdapterCall } from './baseAdapter';

export class TockAdapter implements PlatformAdapter {
  platformName = 'Tock';

  /**
   * Search Tock for available reservations
   * TODO: Implement Puppeteer scraping
   */
  async searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]> {
    return safeAdapterCall(async () => {
      // For MVP, return sample data
      // TODO: Implement Tock scraping
      return this.getSampleData(intent);
    }, this.platformName);
  }

  /**
   * Returns sample data for MVP testing
   */
  private getSampleData(intent: QueryIntent): RestaurantOption[] {
    const sampleRestaurants = [
      {
        name: 'Next',
        rating: 4.8,
        cuisine: 'Fine Dining',
        vibeTags: ['upscale', 'special occasion'],
        priceRange: '$$$$'
      },
      {
        name: 'Roister',
        rating: 4.6,
        cuisine: 'American',
        vibeTags: ['casual', 'trendy'],
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
          bookingLink: `https://www.exploretock.com/${r.name.toLowerCase().replace(/\s+/g, '-')}`
        }
      ));
  }
}


