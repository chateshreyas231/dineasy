/**
 * TypeScript types for frontend
 * Should match backend types
 */

export interface QueryIntent {
  partySize: number
  dateTime: string
  cuisine?: string
  location: string
  occasion?: string
  vibe?: string[]
}

export interface RestaurantOption {
  name: string
  platform: string
  dateTime: string
  partySize: number
  cuisine?: string
  location: string
  rating?: number
  vibeTags?: string[]
  bookingLink?: string
  restaurantId?: string
  distance?: number
  priceRange?: string
  description?: string
}

export interface SearchResponse {
  results: RestaurantOption[]
  query: string
  parsedIntent: QueryIntent
  timestamp: string
}


