/**
 * Base adapter interface and utilities
 * All platform adapters should implement the searchAvailability method
 */

import { QueryIntent, RestaurantOption } from '../types';

/**
 * Base interface for all platform adapters
 */
export interface PlatformAdapter {
  /**
   * Search for available reservations on this platform
   * @param intent - Parsed query intent
   * @returns Array of available restaurant options
   */
  searchAvailability(intent: QueryIntent): Promise<RestaurantOption[]>;
  
  /**
   * Platform name (e.g., "OpenTable", "Resy")
   */
  platformName: string;
}

/**
 * Helper to create a normalized RestaurantOption
 */
export function createRestaurantOption(
  name: string,
  platform: string,
  dateTime: string,
  partySize: number,
  location: string,
  options: Partial<RestaurantOption> = {}
): RestaurantOption {
  return {
    name,
    platform,
    dateTime,
    partySize,
    location,
    ...options
  };
}

/**
 * Error handler for adapters - logs error and returns empty array
 * This ensures one platform failure doesn't break the entire search
 */
export async function safeAdapterCall<T>(
  adapterCall: () => Promise<T>,
  platformName: string
): Promise<T> {
  try {
    return await adapterCall();
  } catch (error) {
    console.error(`[${platformName}] Error in adapter:`, error);
    // Return empty array as fallback (assuming T is RestaurantOption[])
    return [] as unknown as T;
  }
}


