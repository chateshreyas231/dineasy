/**
 * TypeScript type definitions for the reservation agent
 */

/**
 * Structured query intent parsed from natural language
 */
export interface QueryIntent {
  partySize: number;
  dateTime: string; // ISO timestamp
  cuisine?: string;
  location: string;
  occasion?: string; // e.g., "dinner", "brunch", "lunch"
  vibe?: string[]; // e.g., ["romantic", "casual"]
}

/**
 * Normalized restaurant option from any platform
 */
export interface RestaurantOption {
  name: string;
  platform: string; // e.g., "OpenTable", "Resy"
  dateTime: string; // ISO date-time of available slot
  partySize: number;
  cuisine?: string;
  location: string;
  rating?: number;
  vibeTags?: string[];
  bookingLink?: string;
  restaurantId?: string; // Platform-specific ID
  distance?: number; // Distance in miles/km (if available)
  priceRange?: string; // e.g., "$$", "$$$"
  description?: string;
}

/**
 * Search API response
 */
export interface SearchResponse {
  results: RestaurantOption[];
  query: string;
  parsedIntent: QueryIntent;
  timestamp: string;
}

/**
 * Booking request payload
 */
export interface BookingRequest {
  platform: string;
  restaurantId?: string;
  restaurantName: string;
  dateTime: string;
  partySize: number;
  userContact: {
    name: string;
    email: string;
    phone?: string;
  };
  bookingLink?: string;
}

/**
 * Booking response
 */
export interface BookingResponse {
  success: boolean;
  message: string;
  redirectUrl?: string;
  reservationId?: string;
}



