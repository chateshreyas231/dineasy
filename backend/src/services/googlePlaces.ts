import fetch from 'node-fetch';

const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.warn('⚠️  GOOGLE_MAPS_API_KEY not set. Restaurant search will not work.');
}

export interface GooglePlace {
  placeId: string;
  name: string;
  rating?: number;
  priceLevel?: number;
  photoUrl?: string;
  address: string;
  lat: number;
  lng: number;
  openingHours?: {
    openNow?: boolean;
    weekdayText?: string[];
  };
  types: string[];
  website?: string;
  phone?: string;
  googleMapsUrl?: string;
}

export interface GooglePlaceDetail extends GooglePlace {
  formattedAddress?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  reviews?: Array<{
    authorName: string;
    rating: number;
    text: string;
    time: number;
  }>;
  photos?: Array<{
    photoReference: string;
    width: number;
    height: number;
  }>;
}

async function getPlacePhotoUrl(photoReference: string, maxWidth = 400): Promise<string> {
  if (!GOOGLE_MAPS_API_KEY) return '';
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${GOOGLE_MAPS_API_KEY}`;
}

export async function searchRestaurants(
  query: string,
  lat?: number,
  lng?: number,
  radiusMeters = 5000
): Promise<GooglePlace[]> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  let url: string;
  if (lat && lng) {
    // Use Nearby Search
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=restaurant&keyword=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_API_KEY}`;
  } else {
    // Use Text Search
    url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&type=restaurant&key=${GOOGLE_MAPS_API_KEY}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const places: GooglePlace[] = await Promise.all(
      (data.results || []).map(async (result: any) => {
        const photoUrl = result.photos?.[0]
          ? await getPlacePhotoUrl(result.photos[0].photo_reference)
          : undefined;

        return {
          placeId: result.place_id,
          name: result.name,
          rating: result.rating,
          priceLevel: result.price_level,
          photoUrl,
          address: result.vicinity || result.formatted_address || '',
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          openingHours: result.opening_hours
            ? {
                openNow: result.opening_hours.open_now,
                weekdayText: result.opening_hours.weekday_text,
              }
            : undefined,
          types: result.types || [],
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
        };
      })
    );

    return places;
  } catch (error) {
    console.error('Google Places search error:', error);
    throw error;
  }
}

export async function getPlaceDetails(placeId: string): Promise<GooglePlaceDetail> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key not configured');
  }

  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=place_id,name,rating,price_level,formatted_address,formatted_phone_number,international_phone_number,geometry,opening_hours,types,website,photos,reviews&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await fetch(url);
    const data = await response.json() as any;

    if (data.status !== 'OK') {
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const result = data.result;
    const photoUrl = result.photos?.[0]
      ? await getPlacePhotoUrl(result.photos[0].photo_reference, 800)
      : undefined;

    return {
      placeId: result.place_id,
      name: result.name,
      rating: result.rating,
      priceLevel: result.price_level,
      photoUrl,
      address: result.vicinity || result.formatted_address || '',
      formattedAddress: result.formatted_address,
      lat: result.geometry.location.lat,
      lng: result.geometry.location.lng,
      openingHours: result.opening_hours
        ? {
            openNow: result.opening_hours.open_now,
            weekdayText: result.opening_hours.weekday_text,
          }
        : undefined,
      types: result.types || [],
      website: result.website,
      phone: result.formatted_phone_number,
      googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${result.place_id}`,
      reviews: result.reviews?.map((r: any) => ({
        authorName: r.author_name,
        rating: r.rating,
        text: r.text,
        time: r.time,
      })),
      photos: result.photos?.map((p: any) => ({
        photoReference: p.photo_reference,
        width: p.width,
        height: p.height,
      })),
    };
  } catch (error) {
    console.error('Google Places details error:', error);
    throw error;
  }
}
