/**
 * React Hook for Restaurant Syncing
 * Provides easy-to-use hooks for syncing restaurants in React components
 */

import { useState, useCallback } from 'react';
import {
  syncRestaurant,
  syncRestaurantsFromSearch,
  syncRestaurantsFromDatabase,
  syncRestaurantFromSearchResult,
  SyncOptions,
  SyncResult,
  BulkSyncResult,
  SyncProgress,
} from '../services/restaurantSyncService';

export interface UseRestaurantSyncResult {
  isSyncing: boolean;
  progress: SyncProgress | null;
  result: BulkSyncResult | null;
  error: string | null;
  syncRestaurant: (placeId: string, ownerUserId?: string) => Promise<SyncResult>;
  syncFromSearch: (options: SyncOptions) => Promise<BulkSyncResult>;
  syncFromDatabase: (options: SyncOptions) => Promise<BulkSyncResult>;
  syncFromSearchResult: (restaurant: any) => Promise<SyncResult>;
  reset: () => void;
}

/**
 * Hook for syncing a single restaurant
 */
export function useRestaurantSync(): UseRestaurantSyncResult {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [result, setResult] = useState<BulkSyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSyncRestaurant = useCallback(async (
    placeId: string,
    ownerUserId?: string
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    try {
      const syncResult = await syncRestaurant(placeId, ownerUserId);
      if (!syncResult.success) {
        setError(syncResult.error || 'Failed to sync restaurant');
      }
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const handleSyncFromSearch = useCallback(async (
    options: SyncOptions
  ): Promise<BulkSyncResult> => {
    setIsSyncing(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      const syncResult = await syncRestaurantsFromSearch(options, (prog) => {
        setProgress(prog);
      });

      setResult(syncResult);
      if (syncResult.failed > 0) {
        setError(`${syncResult.failed} restaurants failed to sync`);
      }
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      const failedResult: BulkSyncResult = {
        total: 0,
        synced: 0,
        updated: 0,
        failed: 1,
        errors: [{ restaurant: 'Sync', error: errorMessage }],
      };
      setResult(failedResult);
      return failedResult;
    } finally {
      setIsSyncing(false);
      setProgress(null);
    }
  }, []);

  const handleSyncFromDatabase = useCallback(async (
    options: SyncOptions
  ): Promise<BulkSyncResult> => {
    setIsSyncing(true);
    setError(null);
    setResult(null);
    setProgress(null);

    try {
      const syncResult = await syncRestaurantsFromDatabase(options, (prog) => {
        setProgress(prog);
      });

      setResult(syncResult);
      if (syncResult.failed > 0) {
        setError(`${syncResult.failed} restaurants failed to sync`);
      }
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      const failedResult: BulkSyncResult = {
        total: 0,
        synced: 0,
        updated: 0,
        failed: 1,
        errors: [{ restaurant: 'Sync', error: errorMessage }],
      };
      setResult(failedResult);
      return failedResult;
    } finally {
      setIsSyncing(false);
      setProgress(null);
    }
  }, []);

  const handleSyncFromSearchResult = useCallback(async (
    restaurant: any
  ): Promise<SyncResult> => {
    setIsSyncing(true);
    setError(null);
    try {
      const syncResult = await syncRestaurantFromSearchResult(restaurant);
      if (!syncResult.success) {
        setError(syncResult.error || 'Failed to sync restaurant');
      }
      return syncResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setIsSyncing(false);
    setProgress(null);
    setResult(null);
    setError(null);
  }, []);

  return {
    isSyncing,
    progress,
    result,
    error,
    syncRestaurant: handleSyncRestaurant,
    syncFromSearch: handleSyncFromSearch,
    syncFromDatabase: handleSyncFromDatabase,
    syncFromSearchResult: handleSyncFromSearchResult,
    reset,
  };
}
