/**
 * Redis Cache Utility
 * Implements caching for search results to improve performance
 * and reduce load on external platforms
 */

import { createClient } from 'redis';
import { QueryIntent, RestaurantOption } from '../types';

let redisClient: ReturnType<typeof createClient> | null = null;

/**
 * Initialize Redis client
 */
export async function initCache(): Promise<void> {
  if (redisClient) {
    return;
  }

  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  redisClient = createClient({ url: redisUrl });

  redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  await redisClient.connect();
  console.log('✅ Redis cache connected');
}

/**
 * Generate cache key from query intent
 */
function getCacheKey(intent: QueryIntent): string {
  const keyParts = [
    intent.location,
    intent.dateTime,
    intent.partySize.toString(),
    intent.cuisine || '',
    intent.occasion || ''
  ];
  return `search:${keyParts.join(':')}`;
}

/**
 * Get cached search results
 */
export async function getCachedResults(intent: QueryIntent): Promise<RestaurantOption[] | null> {
  if (!redisClient) {
    await initCache();
  }

  try {
    const key = getCacheKey(intent);
    const cached = await redisClient!.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    console.error('Error reading from cache:', error);
  }

  return null;
}

/**
 * Cache search results
 */
export async function setCachedResults(
  intent: QueryIntent,
  results: RestaurantOption[],
  ttlSeconds: number = parseInt(process.env.REDIS_TTL || '600') // Default 10 minutes
): Promise<void> {
  if (!redisClient) {
    await initCache();
  }

  try {
    const key = getCacheKey(intent);
    await redisClient!.setEx(key, ttlSeconds, JSON.stringify(results));
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Clear cache for a specific query
 */
export async function clearCache(intent: QueryIntent): Promise<void> {
  if (!redisClient) {
    await initCache();
  }

  try {
    const key = getCacheKey(intent);
    await redisClient!.del(key);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Close Redis connection
 */
export async function closeCache(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}


