/**
 * Platform Detection Utility
 * Detects reservation platforms from restaurant websites and URLs
 */

export interface PlatformDetectionResult {
  platforms: string[];
  details: Record<string, any>;
}

/**
 * Detects reservation platforms from a website URL
 */
export function detectPlatformsFromWebsite(website?: string): PlatformDetectionResult {
  const platforms: string[] = [];
  const details: Record<string, any> = {};

  if (!website) {
    return { platforms, details };
  }

  const url = website.toLowerCase();

  // OpenTable detection
  if (url.includes('opentable.com') || url.includes('opentable.co.uk')) {
    platforms.push('opentable');
    // Try to extract restaurant ID from URL
    const opentableMatch = url.match(/opentable\.(com|co\.uk)\/restaurant\/(?:profile\/)?(\d+)/);
    if (opentableMatch) {
      details.opentable = {
        restaurant_id: opentableMatch[2],
        url: website,
      };
    } else {
      details.opentable = { url: website };
    }
  }

  // Resy detection
  if (url.includes('resy.com')) {
    platforms.push('resy');
    // Try to extract venue ID or slug from URL
    const resyMatch = url.match(/resy\.com\/cities\/[^/]+\/([^/?]+)/);
    if (resyMatch) {
      details.resy = {
        venue_slug: resyMatch[1],
        url: website,
      };
    } else {
      details.resy = { url: website };
    }
  }

  // Tock detection
  if (url.includes('exploretock.com') || url.includes('tock.com')) {
    platforms.push('tock');
    const tockMatch = url.match(/(?:explore)?tock\.com\/([^/?]+)/);
    if (tockMatch) {
      details.tock = {
        venue_slug: tockMatch[1],
        url: website,
      };
    } else {
      details.tock = { url: website };
    }
  }

  // Toast detection (restaurant POS/reservation system)
  if (url.includes('toasttab.com') || url.includes('toastpos.com')) {
    platforms.push('toast');
    details.toast = { url: website };
  }

  // 7Rooms detection
  if (url.includes('7rooms.com') || url.includes('7shifts.com')) {
    platforms.push('sevenrooms');
    details.sevenrooms = { url: website };
  }

  // Yelp Reservations detection
  if (url.includes('yelp.com') && (url.includes('/reservations') || url.includes('/book'))) {
    platforms.push('yelp_reservations');
    const yelpMatch = url.match(/yelp\.com\/biz\/([^/?]+)/);
    if (yelpMatch) {
      details.yelp_reservations = {
        business_id: yelpMatch[1],
        url: website,
      };
    } else {
      details.yelp_reservations = { url: website };
    }
  }

  // Google Reserve detection
  if (url.includes('google.com') && (url.includes('/reserve') || url.includes('/booking'))) {
    platforms.push('google_reserve');
    details.google_reserve = { url: website };
  }

  return { platforms, details };
}

/**
 * Detects platforms from multiple sources (website, Google Maps URL, etc.)
 */
export function detectPlatforms(
  website?: string,
  googleMapsUrl?: string,
  types?: string[]
): PlatformDetectionResult {
  // Start with website detection
  const result = detectPlatformsFromWebsite(website);

  // If Google Maps URL suggests reservations, add Google Reserve
  if (googleMapsUrl && googleMapsUrl.includes('google.com/maps')) {
    // Check if restaurant types suggest it might have reservations
    const hasReservationTypes = types?.some(type => 
      type.includes('restaurant') || 
      type.includes('food') ||
      type.includes('meal')
    );
    
    if (hasReservationTypes && !result.platforms.includes('google_reserve')) {
      // Don't auto-add Google Reserve, but could be detected via other means
    }
  }

  return result;
}

/**
 * Extracts cuisine type from Google Places types array
 */
export function extractCuisineFromTypes(types?: string[]): string | null {
  if (!types || types.length === 0) {
    return null;
  }

  // Filter out generic types
  const cuisineTypes = types.filter(type => 
    !type.includes('establishment') &&
    !type.includes('point_of_interest') &&
    !type.includes('food') &&
    !type.includes('restaurant') &&
    type !== 'lodging' &&
    type !== 'store'
  );

  if (cuisineTypes.length > 0) {
    // Return the first specific cuisine type, formatted nicely
    return cuisineTypes[0]
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return null;
}
