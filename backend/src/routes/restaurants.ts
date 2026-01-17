import express from 'express';
import { z } from 'zod';
import { searchRestaurants, getPlaceDetails } from '../services/googlePlaces';
import { enrichWithYelp } from '../services/yelpEnrichment';
import { getCache, setCache } from '../utils/cache';
import { prisma } from '../utils/db';
import { detectPlatforms, extractCuisineFromTypes } from '../utils/platformDetection';

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

// POST /api/restaurants/sync
// Syncs a restaurant from Google Places to the database
router.post('/sync', async (req, res) => {
  try {
    const syncSchema = z.object({
      placeId: z.string().min(1),
      ownerUserId: z.string().uuid().optional(), // Optional - if not provided, won't set owner
    });

    const { placeId, ownerUserId } = syncSchema.parse(req.body);

    // Get place details from Google Places
    const placeDetails = await getPlaceDetails(placeId);

    // Enrich with Yelp
    const yelpData = await enrichWithYelp(placeDetails.name, placeDetails.lat, placeDetails.lng);

    // Detect platforms from website
    const platformDetection = detectPlatforms(
      placeDetails.website,
      placeDetails.googleMapsUrl,
      placeDetails.types
    );

    // Extract cuisine from types
    const cuisine = extractCuisineFromTypes(placeDetails.types);

    // Extract city from address (simple extraction)
    const city = placeDetails.formattedAddress
      ? placeDetails.formattedAddress.split(',').slice(-3, -1).join(',').trim() || null
      : null;

    // Prepare restaurant data
    const restaurantData = {
      place_id: placeDetails.placeId,
      name: placeDetails.name,
      address: placeDetails.formattedAddress || placeDetails.address,
      city: city,
      lat: placeDetails.lat,
      lng: placeDetails.lng,
      rating: placeDetails.rating || null,
      price_level: placeDetails.priceLevel || null,
      phone: placeDetails.phone || null,
      website: placeDetails.website || null,
      photo_url: placeDetails.photoUrl || null,
      google_maps_url: placeDetails.googleMapsUrl || null,
      cuisine: cuisine,
      types: placeDetails.types || [],
      opening_hours: placeDetails.openingHours || null,
      platforms: platformDetection.platforms.length > 0 ? platformDetection.platforms : null,
      platform_details: Object.keys(platformDetection.details).length > 0 ? platformDetection.details : null,
      status: 'open' as const,
    };

    // Use raw SQL to upsert (works with both PostgreSQL and SQLite)
    // For PostgreSQL (Supabase), use ON CONFLICT
    // For SQLite, we'll check if it's PostgreSQL first
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

    // Prepare JSONB values
    const typesJson = JSON.stringify(restaurantData.types);
    const openingHoursJson = restaurantData.opening_hours ? JSON.stringify(restaurantData.opening_hours) : null;
    const platformsJson = restaurantData.platforms ? JSON.stringify(restaurantData.platforms) : null;
    const platformDetailsJson = restaurantData.platform_details ? JSON.stringify(restaurantData.platform_details) : null;

    if (isPostgres) {
      // PostgreSQL/Supabase upsert
      // Build column list and values dynamically based on ownerUserId
      if (ownerUserId) {
        await prisma.$executeRawUnsafe(`
          INSERT INTO restaurants (
            place_id, name, address, city, lat, lng, rating, price_level,
            phone, website, photo_url, google_maps_url, cuisine, types,
            opening_hours, platforms, platform_details, status, owner_user_id,
            created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18, $19,
            NOW(), NOW()
          )
          ON CONFLICT (place_id) WHERE place_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            city = EXCLUDED.city,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            rating = EXCLUDED.rating,
            price_level = EXCLUDED.price_level,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            photo_url = EXCLUDED.photo_url,
            google_maps_url = EXCLUDED.google_maps_url,
            cuisine = EXCLUDED.cuisine,
            types = EXCLUDED.types,
            opening_hours = EXCLUDED.opening_hours,
            platforms = EXCLUDED.platforms,
            platform_details = EXCLUDED.platform_details,
            updated_at = NOW()
        `, 
          restaurantData.place_id, restaurantData.name, restaurantData.address,
          restaurantData.city, restaurantData.lat, restaurantData.lng,
          restaurantData.rating, restaurantData.price_level,
          restaurantData.phone, restaurantData.website, restaurantData.photo_url,
          restaurantData.google_maps_url, restaurantData.cuisine,
          typesJson, openingHoursJson, platformsJson, platformDetailsJson,
          restaurantData.status, ownerUserId
        );
      } else {
        await prisma.$executeRawUnsafe(`
          INSERT INTO restaurants (
            place_id, name, address, city, lat, lng, rating, price_level,
            phone, website, photo_url, google_maps_url, cuisine, types,
            opening_hours, platforms, platform_details, status,
            created_at, updated_at
          )
          VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
            $14::jsonb, $15::jsonb, $16::jsonb, $17::jsonb, $18,
            NOW(), NOW()
          )
          ON CONFLICT (place_id) WHERE place_id IS NOT NULL
          DO UPDATE SET
            name = EXCLUDED.name,
            address = EXCLUDED.address,
            city = EXCLUDED.city,
            lat = EXCLUDED.lat,
            lng = EXCLUDED.lng,
            rating = EXCLUDED.rating,
            price_level = EXCLUDED.price_level,
            phone = EXCLUDED.phone,
            website = EXCLUDED.website,
            photo_url = EXCLUDED.photo_url,
            google_maps_url = EXCLUDED.google_maps_url,
            cuisine = EXCLUDED.cuisine,
            types = EXCLUDED.types,
            opening_hours = EXCLUDED.opening_hours,
            platforms = EXCLUDED.platforms,
            platform_details = EXCLUDED.platform_details,
            updated_at = NOW()
        `,
          restaurantData.place_id, restaurantData.name, restaurantData.address,
          restaurantData.city, restaurantData.lat, restaurantData.lng,
          restaurantData.rating, restaurantData.price_level,
          restaurantData.phone, restaurantData.website, restaurantData.photo_url,
          restaurantData.google_maps_url, restaurantData.cuisine,
          typesJson, openingHoursJson, platformsJson, platformDetailsJson,
          restaurantData.status
        );
      }

      // Fetch the inserted/updated restaurant
      const restaurant = await prisma.$queryRawUnsafe(
        `SELECT * FROM restaurants WHERE place_id = $1 LIMIT 1`,
        placeId
      ) as Array<{
        id: string;
        place_id: string;
        name: string;
        [key: string]: any;
      }>;

      res.json({
        success: true,
        restaurant: restaurant[0] || null,
        message: restaurant[0] ? 'Restaurant synced successfully' : 'Restaurant created but could not be retrieved',
      });
    } else {
      // SQLite fallback (for local development)
      // Check if restaurant exists
      const existing = await prisma.$queryRawUnsafe(
        `SELECT id FROM restaurants WHERE place_id = ? LIMIT 1`,
        placeId
      ) as Array<{ id: string }>;

      if (existing.length > 0) {
        // Update existing
        if (ownerUserId) {
          await prisma.$executeRawUnsafe(`
            UPDATE restaurants SET
              name = ?, address = ?, city = ?, lat = ?, lng = ?,
              rating = ?, price_level = ?, phone = ?, website = ?,
              photo_url = ?, google_maps_url = ?, cuisine = ?,
              types = ?, opening_hours = ?, platforms = ?, platform_details = ?,
              updated_at = datetime('now')
            WHERE place_id = ?
          `,
            restaurantData.name, restaurantData.address, restaurantData.city,
            restaurantData.lat, restaurantData.lng, restaurantData.rating,
            restaurantData.price_level, restaurantData.phone, restaurantData.website,
            restaurantData.photo_url, restaurantData.google_maps_url, restaurantData.cuisine,
            typesJson, openingHoursJson, platformsJson, platformDetailsJson,
            placeId
          );
        } else {
          await prisma.$executeRawUnsafe(`
            UPDATE restaurants SET
              name = ?, address = ?, city = ?, lat = ?, lng = ?,
              rating = ?, price_level = ?, phone = ?, website = ?,
              photo_url = ?, google_maps_url = ?, cuisine = ?,
              types = ?, opening_hours = ?, platforms = ?, platform_details = ?,
              updated_at = datetime('now')
            WHERE place_id = ?
          `,
            restaurantData.name, restaurantData.address, restaurantData.city,
            restaurantData.lat, restaurantData.lng, restaurantData.rating,
            restaurantData.price_level, restaurantData.phone, restaurantData.website,
            restaurantData.photo_url, restaurantData.google_maps_url, restaurantData.cuisine,
            typesJson, openingHoursJson, platformsJson, platformDetailsJson,
            placeId
          );
        }
      } else {
        // Insert new
        if (ownerUserId) {
          await prisma.$executeRawUnsafe(`
            INSERT INTO restaurants (
              place_id, name, address, city, lat, lng, rating, price_level,
              phone, website, photo_url, google_maps_url, cuisine, types,
              opening_hours, platforms, platform_details, status, owner_user_id,
              created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `,
            restaurantData.place_id, restaurantData.name, restaurantData.address,
            restaurantData.city, restaurantData.lat, restaurantData.lng,
            restaurantData.rating, restaurantData.price_level,
            restaurantData.phone, restaurantData.website, restaurantData.photo_url,
            restaurantData.google_maps_url, restaurantData.cuisine,
            typesJson, openingHoursJson, platformsJson, platformDetailsJson,
            restaurantData.status, ownerUserId
          );
        } else {
          await prisma.$executeRawUnsafe(`
            INSERT INTO restaurants (
              place_id, name, address, city, lat, lng, rating, price_level,
              phone, website, photo_url, google_maps_url, cuisine, types,
              opening_hours, platforms, platform_details, status,
              created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
          `,
            restaurantData.place_id, restaurantData.name, restaurantData.address,
            restaurantData.city, restaurantData.lat, restaurantData.lng,
            restaurantData.rating, restaurantData.price_level,
            restaurantData.phone, restaurantData.website, restaurantData.photo_url,
            restaurantData.google_maps_url, restaurantData.cuisine,
            typesJson, openingHoursJson, platformsJson, platformDetailsJson,
            restaurantData.status
          );
        }
      }

      const restaurant = await prisma.$queryRawUnsafe(
        `SELECT * FROM restaurants WHERE place_id = ? LIMIT 1`,
        placeId
      ) as Array<{
        id: string;
        place_id: string;
        name: string;
        [key: string]: any;
      }>;

      res.json({
        success: true,
        restaurant: restaurant[0] || null,
        message: 'Restaurant synced successfully',
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Restaurant sync error:', error);
    res.status(500).json({ error: 'Failed to sync restaurant', message: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export { router as restaurantRoutes };
