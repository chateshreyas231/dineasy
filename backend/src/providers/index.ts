/**
 * Provider registry and factory
 */

import { BookingProvider, ProviderName } from './types';
import { DeeplinkProvider } from './deeplinkProvider';
import { YelpReservationsProvider } from './yelpReservationsProvider';
import { OpentablePartnerProvider } from './opentablePartnerProvider';

const providers = new Map<ProviderName, BookingProvider>([
  ['deeplink', new DeeplinkProvider()],
  ['yelp_reservations', new YelpReservationsProvider()],
  ['opentable_partner', new OpentablePartnerProvider()],
]);

export function getProvider(name: ProviderName): BookingProvider | undefined {
  return providers.get(name);
}

export function getEnabledProviders(): ProviderName[] {
  return Array.from(providers.entries())
    .filter(([_, provider]) => provider.isEnabled())
    .map(([name]) => name);
}

export function getAllProviders(): Map<ProviderName, BookingProvider> {
  return providers;
}
