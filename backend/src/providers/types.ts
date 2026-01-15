/**
 * Provider types and interfaces
 */

export type ProviderName = 'deeplink' | 'yelp_reservations' | 'opentable_partner';

export interface AvailabilitySlot {
  datetime: Date;
  verified: boolean;
  provider: ProviderName;
  bookingUrl?: string;
  metadata?: Record<string, any>;
}

export interface ProviderResult {
  success: boolean;
  bookingId?: string;
  redirectUrl?: string;
  confirmation?: Record<string, any>;
  error?: string;
}

export interface BookingRequest {
  placeId: string;
  restaurantName: string;
  restaurantAddress?: string;
  lat?: number;
  lng?: number;
  datetime: Date;
  partySize: number;
  userContact: {
    name: string;
    email: string;
    phone?: string;
  };
}

export interface AvailabilityRequest {
  placeId: string;
  datetime: Date;
  partySize: number;
}

export interface BookingProvider {
  /**
   * Get availability for a restaurant
   */
  getAvailability(request: AvailabilityRequest): Promise<AvailabilitySlot[]>;

  /**
   * Book a table
   */
  book(request: BookingRequest): Promise<ProviderResult>;

  /**
   * Cancel a booking (optional)
   */
  cancel?(bookingId: string, providerBookingId: string): Promise<ProviderResult>;

  /**
   * Check if provider is enabled/configured
   */
  isEnabled(): boolean;
}
