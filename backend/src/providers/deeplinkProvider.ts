/**
 * Deeplink Provider
 * Always enabled fallback provider that uses restaurant website or Google Maps
 */

import { BookingProvider, AvailabilitySlot, ProviderResult, BookingRequest, AvailabilityRequest } from './types';

export class DeeplinkProvider implements BookingProvider {
  isEnabled(): boolean {
    return true; // Always enabled
  }

  async getAvailability(request: AvailabilityRequest): Promise<AvailabilitySlot[]> {
    // Return suggested slots around requested time
    // These are NOT verified - clearly labeled as suggestions
    const requestedTime = new Date(request.datetime);
    const slots: AvailabilitySlot[] = [];

    // Generate suggested slots: -30min, requested, +30min, +1hr
    const offsets = [-30, 0, 30, 60];
    
    for (const offsetMinutes of offsets) {
      const slotTime = new Date(requestedTime);
      slotTime.setMinutes(slotTime.getMinutes() + offsetMinutes);
      
      slots.push({
        datetime: slotTime,
        verified: false, // Always false for deeplink
        provider: 'deeplink',
        metadata: {
          suggested: true,
          note: 'Suggested time - availability not verified',
        },
      });
    }

    return slots;
  }

  async book(request: BookingRequest): Promise<ProviderResult> {
    // For deeplink, we create a booking with PENDING_EXTERNAL status
    // and return a redirect URL (website or Google Maps)
    
    // Try to construct booking URL from restaurant info
    // In real implementation, this would use restaurant website or Google Maps booking
    const redirectUrl = request.lat && request.lng
      ? `https://www.google.com/maps/search/?api=1&query=${request.lat},${request.lng}&query_place_id=${request.placeId}`
      : `https://www.google.com/search?q=${encodeURIComponent(request.restaurantName + ' ' + request.restaurantAddress)}`;

    return {
      success: true,
      redirectUrl,
      metadata: {
        mode: 'REDIRECT',
        note: 'Please complete booking on external platform',
      },
    };
  }
}
