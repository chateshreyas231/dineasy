/**
 * React Hook for Platform Data
 * Provides easy-to-use hooks for fetching and caching platform availability data
 */

import { useState, useCallback, useEffect } from 'react';
import {
  getPlatformAvailability,
  fetchPlatformAvailability,
  getRestaurantPlatforms,
  storePlatformBooking,
  getAllCachedPlatformData,
  clearExpiredCache,
  PlatformAvailability,
} from '../services/platformDataService';

export interface UsePlatformDataResult {
  availability: PlatformAvailability | null;
  platforms: string[] | null;
  platformDetails: Record<string, any> | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  fetchAvailability: (placeId: string, datetime: string, partySize: number, useCache?: boolean) => Promise<void>;
  getPlatforms: (placeId: string) => Promise<void>;
  clearCache: (placeId?: string) => Promise<void>;
}

/**
 * Hook for fetching and managing platform availability data
 */
export function usePlatformData(
  placeId?: string,
  datetime?: string,
  partySize?: number,
  autoFetch: boolean = false
): UsePlatformDataResult {
  const [availability, setAvailability] = useState<PlatformAvailability | null>(null);
  const [platforms, setPlatforms] = useState<string[] | null>(null);
  const [platformDetails, setPlatformDetails] = useState<Record<string, any> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailabilityData = useCallback(async (
    pid: string,
    dt: string,
    ps: number,
    useCache: boolean = true
  ) => {
    if (!pid || !dt || !ps) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getPlatformAvailability(pid, dt, ps, useCache);
      if (data) {
        setAvailability(data);
      } else {
        setError('Failed to fetch availability');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching platform availability:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchPlatformsData = useCallback(async (pid: string) => {
    if (!pid) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await getRestaurantPlatforms(pid);
      if (data) {
        setPlatforms(data.platforms);
        setPlatformDetails(data.platformDetails);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error fetching restaurant platforms:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (placeId && datetime && partySize) {
      await fetchAvailabilityData(placeId, datetime, partySize, false);
    }
  }, [placeId, datetime, partySize, fetchAvailabilityData]);

  const clearCacheData = useCallback(async (pid?: string) => {
    try {
      await clearExpiredCache(pid);
    } catch (err) {
      console.error('Error clearing cache:', err);
    }
  }, []);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch && placeId) {
      if (datetime && partySize) {
        fetchAvailabilityData(placeId, datetime, partySize);
      }
      fetchPlatformsData(placeId);
    }
  }, [autoFetch, placeId, datetime, partySize, fetchAvailabilityData, fetchPlatformsData]);

  return {
    availability,
    platforms,
    platformDetails,
    isLoading,
    error,
    refresh,
    fetchAvailability: fetchAvailabilityData,
    getPlatforms: fetchPlatformsData,
    clearCache: clearCacheData,
  };
}

/**
 * Hook for storing platform bookings
 */
export function usePlatformBooking() {
  const [isStoring, setIsStoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const storeBooking = useCallback(async (
    placeId: string,
    platform: string,
    bookingData: {
      datetime: string;
      partySize: number;
      bookingId?: string;
      confirmationUrl?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<boolean> => {
    setIsStoring(true);
    setError(null);

    try {
      const success = await storePlatformBooking(placeId, platform, bookingData);
      if (!success) {
        setError('Failed to store booking');
      }
      return success;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return false;
    } finally {
      setIsStoring(false);
    }
  }, []);

  return {
    storeBooking,
    isStoring,
    error,
  };
}
