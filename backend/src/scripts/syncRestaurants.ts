/**
 * Bulk Restaurant Sync Script
 * 
 * This script:
 * 1. Searches for restaurants via Google Places API
 * 2. Syncs each restaurant to the database
 * 3. Detects reservation platforms from restaurant websites
 * 4. Fetches platform-specific data (restaurant IDs, booking URLs, etc.)
 * 5. Updates the database with enriched platform information
 * 
 * Usage:
 *   tsx src/scripts/syncRestaurants.ts --query "Italian restaurants" --location "San Francisco, CA"
 *   tsx src/scripts/syncRestaurants.ts --query "sushi" --lat 37.7749 --lng -122.4194 --radius 10000
 *   tsx src/scripts/syncRestaurants.ts --from-db --limit 100
 */

import dotenv from 'dotenv';
import { searchRestaurants, getPlaceDetails } from '../services/googlePlaces';
import { enrichWithYelp } from '../services/yelpEnrichment';
import { detectPlatforms, extractCuisineFromTypes } from '../utils/platformDetection';
import { prisma } from '../utils/db';
import { OpenTableAdapter } from '../adapters/openTableAdapter';
import { ResyAdapter } from '../adapters/resyAdapter';
import { YelpAdapter } from '../adapters/yelpAdapter';
import { TockAdapter } from '../adapters/tockAdapter';

// Load environment variables
dotenv.config();

interface SyncOptions {
  query?: string;
  location?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  fromDb?: boolean;
  limit?: number;
  ownerUserId?: string;
  delay?: number; // Delay between requests in ms
}

interface RestaurantData {
  place_id: string;
  name: string;
  address: string | null;
  city: string | null;
  lat: number;
  lng: number;
  rating: number | null;
  price_level: number | null;
  phone: string | null;
  website: string | null;
  photo_url: string | null;
  google_maps_url: string | null;
  cuisine: string | null;
  types: string[];
  opening_hours: any;
  platforms: string[] | null;
  platform_details: Record<string, any> | null;
  status: string;
}

interface SyncStats {
  total: number;
  synced: number;
  updated: number;
  failed: number;
  skipped: number;
  errors: Array<{ restaurant: string; error: string }>;
}

/**
 * Fetches platform-specific data for a restaurant
 */
async function fetchPlatformData(
  restaurant: RestaurantData,
  platform: string
): Promise<Record<string, any> | null> {
  try {
    switch (platform) {
      case 'opentable':
        return await fetchOpenTableData(restaurant);
      case 'resy':
        return await fetchResyData(restaurant);
      case 'yelp_reservations':
        return await fetchYelpData(restaurant);
      case 'tock':
        return await fetchTockData(restaurant);
      default:
        return null;
    }
  } catch (error) {
    console.error(`Error fetching ${platform} data for ${restaurant.name}:`, error);
    return null;
  }
}

/**
 * Fetches OpenTable-specific data
 */
async function fetchOpenTableData(restaurant: RestaurantData): Promise<Record<string, any> | null> {
  // If we already have OpenTable data from platform detection, use it
  if (restaurant.platform_details?.opentable) {
    return restaurant.platform_details.opentable;
  }

  // Try to extract restaurant ID from website URL
  if (restaurant.website) {
    const match = restaurant.website.match(/opentable\.(com|co\.uk)\/restaurant\/(?:profile\/)?(\d+)/);
    if (match) {
      return {
        restaurant_id: match[2],
        url: restaurant.website,
      };
    }
  }

  // Could also search OpenTable API here if available
  return null;
}

/**
 * Fetches Resy-specific data
 */
async function fetchResyData(restaurant: RestaurantData): Promise<Record<string, any> | null> {
  if (restaurant.platform_details?.resy) {
    return restaurant.platform_details.resy;
  }

  if (restaurant.website) {
    const match = restaurant.website.match(/resy\.com\/cities\/[^/]+\/([^/?]+)/);
    if (match) {
      return {
        venue_slug: match[1],
        url: restaurant.website,
      };
    }
  }

  return null;
}

/**
 * Fetches Yelp-specific data
 */
async function fetchYelpData(restaurant: RestaurantData): Promise<Record<string, any> | null> {
  if (restaurant.platform_details?.yelp_reservations) {
    return restaurant.platform_details.yelp_reservations;
  }

  // Use Yelp enrichment to get business ID
  try {
    const yelpData = await enrichWithYelp(restaurant.name, restaurant.lat, restaurant.lng);
    if (yelpData.yelpBusinessId) {
      return {
        business_id: yelpData.yelpBusinessId,
        url: yelpData.yelpUrl || null,
      };
    }
  } catch (error) {
    console.error('Error enriching with Yelp:', error);
  }

  return null;
}

/**
 * Fetches Tock-specific data
 */
async function fetchTockData(restaurant: RestaurantData): Promise<Record<string, any> | null> {
  if (restaurant.platform_details?.tock) {
    return restaurant.platform_details.tock;
  }

  if (restaurant.website) {
    const match = restaurant.website.match(/(?:explore)?tock\.com\/([^/?]+)/);
    if (match) {
      return {
        venue_slug: match[1],
        url: restaurant.website,
      };
    }
  }

  return null;
}

/**
 * Syncs a single restaurant to the database
 */
async function syncRestaurant(
  placeId: string,
  ownerUserId?: string,
  delay: number = 1000
): Promise<{ success: boolean; updated: boolean; error?: string }> {
  try {
    // Add delay to avoid rate limiting
    if (delay > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
    }

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

    // Extract city from address
    const city = placeDetails.formattedAddress
      ? placeDetails.formattedAddress.split(',').slice(-3, -1).join(',').trim() || null
      : null;

    // Prepare restaurant data
    const restaurantData: RestaurantData = {
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
      status: 'open',
    };

    // Fetch additional platform data for each detected platform
    if (restaurantData.platforms && restaurantData.platforms.length > 0) {
      const enrichedDetails: Record<string, any> = { ...restaurantData.platform_details || {} };

      for (const platform of restaurantData.platforms) {
        const platformData = await fetchPlatformData(restaurantData, platform);
        if (platformData) {
          enrichedDetails[platform] = {
            ...enrichedDetails[platform],
            ...platformData,
          };
        }
      }

      restaurantData.platform_details = Object.keys(enrichedDetails).length > 0 ? enrichedDetails : null;
    }

    // Check if restaurant already exists
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

    // Prepare JSONB values
    const typesJson = JSON.stringify(restaurantData.types);
    const openingHoursJson = restaurantData.opening_hours ? JSON.stringify(restaurantData.opening_hours) : null;
    const platformsJson = restaurantData.platforms ? JSON.stringify(restaurantData.platforms) : null;
    const platformDetailsJson = restaurantData.platform_details ? JSON.stringify(restaurantData.platform_details) : null;

    let updated = false;

    if (isPostgres) {
      // Check if exists
      const existing = await prisma.$queryRawUnsafe(
        `SELECT id FROM restaurants WHERE place_id = $1 LIMIT 1`,
        placeId
      ) as Array<{ id: string }>;

      updated = existing.length > 0;

      // Upsert
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
    } else {
      // SQLite fallback
      const existing = await prisma.$queryRawUnsafe(
        `SELECT id FROM restaurants WHERE place_id = ? LIMIT 1`,
        placeId
      ) as Array<{ id: string }>;

      updated = existing.length > 0;

      if (existing.length > 0) {
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
    }

    return { success: true, updated };
  } catch (error) {
    return {
      success: false,
      updated: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Syncs restaurants from Google Places search
 */
async function syncFromGooglePlaces(options: SyncOptions): Promise<SyncStats> {
  const stats: SyncStats = {
    total: 0,
    synced: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    console.log('🔍 Searching Google Places...');
    const places = await searchRestaurants(
      options.query || 'restaurant',
      options.lat,
      options.lng,
      options.radius || 5000
    );

    stats.total = Math.min(places.length, options.limit || places.length);
    console.log(`📊 Found ${places.length} restaurants, syncing ${stats.total}...`);

    for (let i = 0; i < stats.total; i++) {
      const place = places[i];
      console.log(`\n[${i + 1}/${stats.total}] Syncing: ${place.name} (${place.placeId})`);

      const result = await syncRestaurant(
        place.placeId,
        options.ownerUserId,
        options.delay || 1000
      );

      if (result.success) {
        if (result.updated) {
          stats.updated++;
          console.log(`  ✅ Updated`);
        } else {
          stats.synced++;
          console.log(`  ✅ Synced`);
        }
      } else {
        stats.failed++;
        stats.errors.push({ restaurant: place.name, error: result.error || 'Unknown error' });
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error syncing from Google Places:', error);
    stats.errors.push({
      restaurant: 'Google Places Search',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return stats;
}

/**
 * Syncs restaurants from database
 */
async function syncFromDatabase(options: SyncOptions): Promise<SyncStats> {
  const stats: SyncStats = {
    total: 0,
    synced: 0,
    updated: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  try {
    console.log('📊 Fetching restaurants from database...');
    const dbUrl = process.env.DATABASE_URL || '';
    const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');

    let restaurants: Array<{ place_id: string; name: string }>;

    if (isPostgres) {
      restaurants = await prisma.$queryRawUnsafe(
        `SELECT place_id, name FROM restaurants WHERE place_id IS NOT NULL LIMIT $1`,
        options.limit || 100
      ) as Array<{ place_id: string; name: string }>;
    } else {
      restaurants = await prisma.$queryRawUnsafe(
        `SELECT place_id, name FROM restaurants WHERE place_id IS NOT NULL LIMIT ?`,
        options.limit || 100
      ) as Array<{ place_id: string; name: string }>;
    }

    stats.total = restaurants.length;
    console.log(`📊 Found ${stats.total} restaurants in database, syncing...`);

    for (let i = 0; i < stats.total; i++) {
      const restaurant = restaurants[i];
      console.log(`\n[${i + 1}/${stats.total}] Syncing: ${restaurant.name} (${restaurant.place_id})`);

      const result = await syncRestaurant(
        restaurant.place_id,
        options.ownerUserId,
        options.delay || 1000
      );

      if (result.success) {
        stats.updated++;
        console.log(`  ✅ Updated`);
      } else {
        stats.failed++;
        stats.errors.push({ restaurant: restaurant.name, error: result.error || 'Unknown error' });
        console.log(`  ❌ Failed: ${result.error}`);
      }
    }
  } catch (error) {
    console.error('Error syncing from database:', error);
    stats.errors.push({
      restaurant: 'Database Query',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }

  return stats;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const options: SyncOptions = {
    delay: 1000, // Default 1 second delay between requests
  };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--query':
        options.query = args[++i];
        break;
      case '--location':
        options.location = args[++i];
        break;
      case '--lat':
        options.lat = parseFloat(args[++i]);
        break;
      case '--lng':
        options.lng = parseFloat(args[++i]);
        break;
      case '--radius':
        options.radius = parseInt(args[++i]);
        break;
      case '--from-db':
        options.fromDb = true;
        break;
      case '--limit':
        options.limit = parseInt(args[++i]);
        break;
      case '--owner-user-id':
        options.ownerUserId = args[++i];
        break;
      case '--delay':
        options.delay = parseInt(args[++i]);
        break;
      case '--help':
        console.log(`
Bulk Restaurant Sync Script

Usage:
  tsx src/scripts/syncRestaurants.ts [options]

Options:
  --query <string>          Search query for Google Places (default: "restaurant")
  --location <string>       Location string (e.g., "San Francisco, CA")
  --lat <number>            Latitude for location-based search
  --lng <number>            Longitude for location-based search
  --radius <number>         Search radius in meters (default: 5000)
  --from-db                 Sync restaurants from database instead of Google Places
  --limit <number>          Maximum number of restaurants to sync (default: all)
  --owner-user-id <uuid>    Optional owner user ID to assign to restaurants
  --delay <number>          Delay between requests in milliseconds (default: 1000)
  --help                    Show this help message

Examples:
  # Search and sync Italian restaurants in San Francisco
  tsx src/scripts/syncRestaurants.ts --query "Italian restaurants" --location "San Francisco, CA"

  # Search near specific coordinates
  tsx src/scripts/syncRestaurants.ts --query "sushi" --lat 37.7749 --lng -122.4194 --radius 10000

  # Update existing restaurants in database
  tsx src/scripts/syncRestaurants.ts --from-db --limit 100

  # Sync with faster rate (500ms delay)
  tsx src/scripts/syncRestaurants.ts --query "pizza" --location "New York, NY" --delay 500
        `);
        process.exit(0);
    }
  }

  console.log('🚀 Starting restaurant sync...\n');
  console.log('Options:', JSON.stringify(options, null, 2), '\n');

  let stats: SyncStats;

  if (options.fromDb) {
    stats = await syncFromDatabase(options);
  } else {
    stats = await syncFromGooglePlaces(options);
  }

  // Print summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 Sync Summary');
  console.log('='.repeat(50));
  console.log(`Total restaurants: ${stats.total}`);
  console.log(`✅ Newly synced: ${stats.synced}`);
  console.log(`🔄 Updated: ${stats.updated}`);
  console.log(`❌ Failed: ${stats.failed}`);
  console.log(`⏭️  Skipped: ${stats.skipped}`);

  if (stats.errors.length > 0) {
    console.log('\n❌ Errors:');
    stats.errors.forEach(({ restaurant, error }) => {
      console.log(`  - ${restaurant}: ${error}`);
    });
  }

  console.log('\n✨ Done!');
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export { syncRestaurant, syncFromGooglePlaces, syncFromDatabase };
