import express from 'express';
import { z } from 'zod';
import { searchRestaurants, getPlaceDetails } from '../services/googlePlaces';
import { enrichWithYelp } from '../services/yelpEnrichment';
import { getCache, setCache } from '../utils/cache';

const router = express.Router();

// Validation schemas
const searchSchema = z.object({
  query: z.string().min(1),
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  radiusMeters: z.coerce.number().optional(),
});

// GET /api/restaurants/search
router.get('/search', async (req, res) => {
  try {
    const { query, lat, lng, radiusMeters } = searchSchema.parse(req.query);

    // Check cache
    const cacheKey = `restaurants:search:${query}:${lat}:${lng}:${radiusMeters}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Search Google Places
    const places = await searchRestaurants(query, lat, lng, radiusMeters);

    // Enrich with Yelp if API key available
    const enrichedPlaces = await Promise.all(
      places.map(async (place) => {
        const yelpData = await enrichWithYelp(place.name, place.lat, place.lng);
        return {
          ...place,
          ...yelpData,
        };
      })
    );

    const result = {
      results: enrichedPlaces,
      query,
      count: enrichedPlaces.length,
    };

    // Cache for 10 minutes
    await setCache(cacheKey, result, 600);

    res.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Restaurant search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/restaurants/:placeId
router.get('/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;

    // Check cache
    const cacheKey = `restaurants:detail:${placeId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json(cached);
    }

    // Get place details
    const details = await getPlaceDetails(placeId);

    // Enrich with Yelp
    const yelpData = await enrichWithYelp(details.name, details.lat, details.lng);
    const enriched = {
      ...details,
      ...yelpData,
    };

    // Cache for 1 hour
    await setCache(cacheKey, enriched, 3600);

    res.json(enriched);
  } catch (error) {
    console.error('Restaurant detail error:', error);
    res.status(500).json({ error: 'Failed to get restaurant details' });
  }
});

export { router as restaurantRoutes };
