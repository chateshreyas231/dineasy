/**
 * OpenTable Adapter
 * Searches OpenTable for available reservations
 * 
 * For MVP: Uses Puppeteer to scrape OpenTable's search results
 * In production: Could use OpenTable's API if available
 */

import puppeteer, { Browser, Page } from 'puppeteer';
import { QueryIntent, RestaurantOption } from '../types';
import { PlatformAdapter, createRestaurantOption, safeAdapterCall } from './baseAdapter';

export class OpenTableAdapter implements PlatformAdapter {
  platformName = 'OpenTable';
  private browser: Browser | null = null;

  /**
   * Search OpenTable for available reservations
   * TODO: Implement full Puppeteer scraping
   * For MVP, returns sample data based on query
   */
  async searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]> {
    return safeAdapterCall(async () => {
      // For MVP, return sample data
      // TODO: Implement Puppeteer scraping
      // const results = await this.scrapeOpenTable(intent);
      // return results;
      
      return this.getSampleData(intent);
    }, this.platformName);
  }

  /**
   * Scrapes OpenTable using Puppeteer (to be implemented)
   */
  private async scrapeOpenTable(intent: QueryIntent): Promise<RestaurantOption[]> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
    }

    const page = await this.browser.newPage();
    const results: RestaurantOption[] = [];

    try {
      // Construct OpenTable search URL
      const searchUrl = this.buildSearchUrl(intent);
      await page.goto(searchUrl, { waitUntil: 'networkidle2' });

      // Wait for results to load
      await page.waitForSelector('.restaurant-row, .restaurant-card', { timeout: 10000 });

      // Extract restaurant data from page
      // TODO: Update selectors based on actual OpenTable HTML structure
      const restaurants = await page.evaluate(() => {
        const items: any[] = [];
        // This is a placeholder - actual selectors need to be determined
        // by inspecting OpenTable's HTML structure
        document.querySelectorAll('.restaurant-row').forEach((el) => {
          const name = el.querySelector('.restaurant-name')?.textContent?.trim();
          const rating = el.querySelector('.rating')?.textContent?.trim();
          const link = el.querySelector('a')?.href;
          if (name) {
            items.push({ name, rating, link });
          }
        });
        return items;
      });

      // Convert to RestaurantOption format
      for (const restaurant of restaurants) {
        results.push(createRestaurantOption(
          restaurant.name,
          this.platformName,
          intent.dateTime,
          intent.partySize,
          intent.location,
          {
            rating: this.parseRating(restaurant.rating),
            bookingLink: restaurant.link || this.buildBookingLink(restaurant.name, intent)
          }
        ));
      }
    } catch (error) {
      console.error('Error scraping OpenTable:', error);
    } finally {
      await page.close();
    }

    return results;
  }

  /**
   * Builds OpenTable search URL from query intent
   */
  private buildSearchUrl(intent: QueryIntent): string {
    const baseUrl = 'https://www.opentable.com/s';
    const params = new URLSearchParams({
      city: intent.location,
      dateTime: intent.dateTime,
      partySize: intent.partySize.toString()
    });
    if (intent.cuisine) {
      params.append('cuisine', intent.cuisine.toLowerCase());
    }
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Builds OpenTable booking link
   * OpenTable uses restaurant IDs (RID) in URLs
   */
  private buildBookingLink(restaurantName: string, intent: QueryIntent): string {
    // For MVP, construct a generic OpenTable search link
    // In production, we'd need the actual restaurant RID
    const date = new Date(intent.dateTime).toISOString().split('T')[0];
    const time = new Date(intent.dateTime).toTimeString().slice(0, 5);
    return `https://www.opentable.com/restaurant/search?city=${encodeURIComponent(intent.location)}&dateTime=${date}&partySize=${intent.partySize}&time=${time}`;
  }

  /**
   * Parses rating string to number
   */
  private parseRating(ratingStr?: string): number | undefined {
    if (!ratingStr) return undefined;
    const match = ratingStr.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : undefined;
  }

  /**
   * Returns sample data for MVP testing
   */
  private getSampleData(intent: QueryIntent): RestaurantOption[] {
    const sampleRestaurants = [
      {
        name: 'Sushi Nakazawa',
        rating: 4.8,
        cuisine: 'Sushi',
        vibeTags: ['fine dining', 'romantic'],
        priceRange: '$$$$'
      },
      {
        name: 'The Capital Grille',
        rating: 4.6,
        cuisine: 'Steakhouse',
        vibeTags: ['upscale', 'business'],
        priceRange: '$$$'
      },
      {
        name: 'Girl & The Goat',
        rating: 4.7,
        cuisine: 'American',
        vibeTags: ['casual', 'trendy'],
        priceRange: '$$'
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
          bookingLink: `https://www.opentable.com/r/${r.name.toLowerCase().replace(/\s+/g, '-')}-${intent.location.toLowerCase().replace(/\s+/g, '-')}?dateTime=${new Date(intent.dateTime).toISOString()}&partySize=${intent.partySize}`
        }
      ));
  }

  /**
   * Cleanup browser instance
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}


