/**
 * Reservation Service
 * Orchestrates multi-platform search, aggregation, and ranking
 */

import { QueryIntent, RestaurantOption } from '../types';
import { OpenTableAdapter } from '../adapters/openTableAdapter';
import { ResyAdapter } from '../adapters/resyAdapter';
import { YelpAdapter } from '../adapters/yelpAdapter';
import { TockAdapter } from '../adapters/tockAdapter';
import { GoogleReserveAdapter } from '../adapters/googleReserveAdapter';

export class ReservationService {
  private adapters = [
    new OpenTableAdapter(),
    new ResyAdapter(),
    new YelpAdapter(),
    new TockAdapter(),
    new GoogleReserveAdapter()
  ];

  /**
   * Search across all platforms and return ranked results
   */
  async searchReservations(intent: QueryIntent): Promise<RestaurantOption[]> {
    // Run all adapter searches in parallel with timeout
    const searchPromises = this.adapters.map(adapter =>
      Promise.race([
        adapter.searchAvailability(intent),
        new Promise<RestaurantOption[]>((resolve) =>
          setTimeout(() => resolve([]), 10000) // 10 second timeout per adapter
        )
      ])
    );

    const resultsArrays = await Promise.all(searchPromises);
    
    // Flatten all results
    let allResults = resultsArrays.flat();
    
    // Deduplicate by restaurant name and location
    allResults = this.deduplicateResults(allResults);
    
    // Filter to match intent (cuisine, time window)
    allResults = this.filterByIntent(allResults, intent);
    
    // Rank results
    allResults = this.rankResults(allResults, intent);
    
    // Return top 5 results
    return allResults.slice(0, 5);
  }

  /**
   * Deduplicates results by restaurant name and location
   * If same restaurant appears from multiple platforms, merge the data
   */
  private deduplicateResults(results: RestaurantOption[]): RestaurantOption[] {
    const seen = new Map<string, RestaurantOption>();
    
    for (const result of results) {
      const key = `${result.name.toLowerCase()}-${result.location.toLowerCase()}`;
      const existing = seen.get(key);
      
      if (existing) {
        // Merge: prefer higher rating, combine platforms, keep best booking link
        if (result.rating && (!existing.rating || result.rating > existing.rating)) {
          existing.rating = result.rating;
        }
        if (result.bookingLink && !existing.bookingLink) {
          existing.bookingLink = result.bookingLink;
        }
        // Combine platforms if different
        if (result.platform !== existing.platform) {
          existing.platform = `${existing.platform}, ${result.platform}`;
        }
      } else {
        seen.set(key, { ...result });
      }
    }
    
    return Array.from(seen.values());
  }

  /**
   * Filters results to match query intent
   */
  private filterByIntent(results: RestaurantOption[], intent: QueryIntent): RestaurantOption[] {
    return results.filter(result => {
      // Filter by cuisine if specified
      if (intent.cuisine && result.cuisine) {
        const cuisineMatch = result.cuisine.toLowerCase().includes(intent.cuisine.toLowerCase()) ||
                           intent.cuisine.toLowerCase().includes(result.cuisine.toLowerCase());
        if (!cuisineMatch) {
          return false;
        }
      }
      
      // Filter by time window (allow ±30 minutes)
      const requestedTime = new Date(intent.dateTime).getTime();
      const resultTime = new Date(result.dateTime).getTime();
      const timeDiff = Math.abs(resultTime - requestedTime);
      const thirtyMinutes = 30 * 60 * 1000;
      
      if (timeDiff > thirtyMinutes) {
        return false;
      }
      
      return true;
    });
  }

  /**
   * Ranks results based on multiple factors:
   * - Proximity to requested location
   * - Rating
   * - Vibe match
   * - Cuisine match
   */
  private rankResults(results: RestaurantOption[], intent: QueryIntent): RestaurantOption[] {
    return results.map(result => {
      let score = 0;
      
      // Proximity score (simplified - assumes all results are in requested location)
      // In production, would calculate actual distance
      if (result.location.toLowerCase().includes(intent.location.toLowerCase()) ||
          intent.location.toLowerCase().includes(result.location.toLowerCase())) {
        score += 30;
      } else {
        score += 10; // Partial match
      }
      
      // Rating score (0-40 points)
      if (result.rating) {
        score += result.rating * 8; // 4.5 stars = 36 points
      }
      
      // Cuisine match score (0-20 points)
      if (intent.cuisine && result.cuisine) {
        if (result.cuisine.toLowerCase() === intent.cuisine.toLowerCase()) {
          score += 20;
        } else if (result.cuisine.toLowerCase().includes(intent.cuisine.toLowerCase()) ||
                   intent.cuisine.toLowerCase().includes(result.cuisine.toLowerCase())) {
          score += 10;
        }
      }
      
      // Vibe match score (0-10 points)
      if (intent.vibe && result.vibeTags) {
        const matchingVibes = intent.vibe.filter(vibe =>
          result.vibeTags!.some(tag => tag.toLowerCase().includes(vibe.toLowerCase()))
        );
        score += matchingVibes.length * 5;
      }
      
      // Time proximity bonus (0-10 points)
      const requestedTime = new Date(intent.dateTime).getTime();
      const resultTime = new Date(result.dateTime).getTime();
      const timeDiff = Math.abs(resultTime - requestedTime);
      const thirtyMinutes = 30 * 60 * 1000;
      if (timeDiff < thirtyMinutes) {
        score += 10 - (timeDiff / (thirtyMinutes / 10));
      }
      
      return { ...result, score };
    }).sort((a, b) => {
      // Sort by score descending
      const scoreA = (a as any).score || 0;
      const scoreB = (b as any).score || 0;
      return scoreB - scoreA;
    }).map(result => {
      // Remove score from final result
      const { score, ...rest } = result as any;
      return rest;
    });
  }
}



