/**
 * OpenTable Partner Provider
 * Scaffold only - requires partner API access
 */

import { BookingProvider, AvailabilitySlot, ProviderResult, BookingRequest, AvailabilityRequest } from './types';

export class OpentablePartnerProvider implements BookingProvider {
  private enabled: boolean;

  constructor() {
    this.enabled = process.env.OPENTABLE_ENABLED === 'true';
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async getAvailability(request: AvailabilityRequest): Promise<AvailabilitySlot[]> {
    if (!this.isEnabled()) {
      return [];
    }

    // Scaffold - not implemented
    // Requires OpenTable Partner API credentials
    return [];
  }

  async book(request: BookingRequest): Promise<ProviderResult> {
    if (!this.isEnabled()) {
      return {
        success: false,
        error: 'OpenTable provider not enabled',
      };
    }

    // Scaffold - not implemented
    return {
      success: false,
      error: 'OpenTable Partner API not configured - requires partner credentials',
    };
  }
}
