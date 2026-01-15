import fetch from 'node-fetch';

const YELP_API_KEY = process.env.YELP_API_KEY;

export interface YelpEnrichment {
  yelpBusinessId?: string;
  yelpRating?: number;
  yelpUrl?: string;
}

export async function enrichWithYelp(
  name: string,
  lat: number,
  lng: number
): Promise<YelpEnrichment> {
  if (!YELP_API_KEY) {
    return {};
  }

  try {
    // Yelp Fusion Business Search
    const url = `https://api.yelp.com/v3/businesses/search?term=${encodeURIComponent(name)}&latitude=${lat}&longitude=${lng}&limit=1&categories=restaurants`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });

    if (!response.ok) {
      console.warn('Yelp API error:', response.status, response.statusText);
      return {};
    }

    const data = await response.json() as any;
    const business = data.businesses?.[0];

    if (!business) {
      return {};
    }

    // Match by name similarity (simple check)
    const nameSimilarity = business.name.toLowerCase().includes(name.toLowerCase()) ||
                          name.toLowerCase().includes(business.name.toLowerCase());

    if (!nameSimilarity) {
      return {};
    }

    return {
      yelpBusinessId: business.id,
      yelpRating: business.rating,
      yelpUrl: business.url,
    };
  } catch (error) {
    console.warn('Yelp enrichment error:', error);
    return {};
  }
}
