# Restaurant Sync - Mobile App Guide

This guide shows how to use the restaurant sync functionality in the mobile app.

## Overview

The mobile app now has full restaurant sync capabilities that allow you to:
- Sync individual restaurants from Google Places
- Bulk sync restaurants from search results
- Update existing restaurants in the database
- Track sync progress in real-time

## Quick Start

### 1. Sync a Single Restaurant

```typescript
import { syncRestaurant } from '../services/restaurantSyncService';

// Sync a restaurant by place ID
const result = await syncRestaurant('ChIJN1t_tDeuEmsRUsoyG83frY4');

if (result.success) {
  console.log('Restaurant synced:', result.restaurant);
} else {
  console.error('Error:', result.error);
}
```

### 2. Using the React Hook

```typescript
import { useRestaurantSync } from '../hooks/useRestaurantSync';

function MyComponent() {
  const {
    isSyncing,
    progress,
    result,
    error,
    syncRestaurant,
    syncFromSearch,
    syncFromDatabase,
    reset,
  } = useRestaurantSync();

  const handleSync = async () => {
    const result = await syncFromSearch({
      query: 'Italian restaurants',
      location: 'San Francisco, CA',
      limit: 10,
    });

    console.log(`Synced ${result.synced} restaurants`);
  };

  return (
    <View>
      {isSyncing && progress && (
        <Text>
          Syncing {progress.current}/{progress.total}: {progress.restaurantName}
        </Text>
      )}
      
      {result && (
        <Text>
          Total: {result.total}, Synced: {result.synced}, Failed: {result.failed}
        </Text>
      )}
      
      <Button title="Sync Restaurants" onPress={handleSync} disabled={isSyncing} />
    </View>
  );
}
```

### 3. Sync from Search Results

```typescript
import { syncRestaurantFromSearchResult } from '../services/restaurantSyncService';

// When user selects a restaurant from search
const handleSelectRestaurant = async (restaurant: Restaurant) => {
  const result = await syncRestaurantFromSearchResult(restaurant);
  
  if (result.success) {
    // Restaurant is now in database with platform data
    console.log('Restaurant synced with platforms:', result.restaurant?.platforms);
  }
};
```

## API Reference

### `syncRestaurant(placeId, ownerUserId?)`

Syncs a single restaurant by Google Places ID.

**Parameters:**
- `placeId` (string): Google Places place_id
- `ownerUserId` (string, optional): User ID to assign as owner

**Returns:**
```typescript
{
  success: boolean;
  restaurant?: any;
  message?: string;
  error?: string;
}
```

### `syncRestaurantsFromSearch(options, onProgress?)`

Syncs multiple restaurants from a Google Places search.

**Parameters:**
- `options` (SyncOptions):
  - `query` (string): Search query
  - `location` (string): Location string
  - `lat` (number): Latitude
  - `lng` (number): Longitude
  - `radius` (number): Search radius in meters
  - `limit` (number): Maximum restaurants to sync
  - `ownerUserId` (string, optional): User ID to assign as owner
- `onProgress` (function, optional): Progress callback

**Returns:**
```typescript
{
  total: number;
  synced: number;
  updated: number;
  failed: number;
  errors: Array<{ restaurant: string; error: string }>;
}
```

### `syncRestaurantsFromDatabase(options, onProgress?)`

Updates existing restaurants in the database.

**Parameters:**
- `options` (SyncOptions): Same as above
- `onProgress` (function, optional): Progress callback

**Returns:** Same as `syncRestaurantsFromSearch`

### `syncRestaurantFromSearchResult(restaurant)`

Syncs a restaurant from search results.

**Parameters:**
- `restaurant` (any): Restaurant object from search results

**Returns:** Same as `syncRestaurant`

## React Hook: `useRestaurantSync()`

Provides a React hook for easy integration in components.

**Returns:**
```typescript
{
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
```

## Example: Full Sync Screen

```typescript
import React, { useState } from 'react';
import { View, Text, Button, TextInput, ActivityIndicator } from 'react-native';
import { useRestaurantSync } from '../hooks/useRestaurantSync';

export function RestaurantSyncScreen() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  
  const {
    isSyncing,
    progress,
    result,
    error,
    syncFromSearch,
    reset,
  } = useRestaurantSync();

  const handleSync = async () => {
    reset();
    await syncFromSearch({
      query: query || 'restaurant',
      location: location,
      limit: 20,
    });
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Search query"
        value={query}
        onChangeText={setQuery}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
      
      <TextInput
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />

      <Button
        title={isSyncing ? 'Syncing...' : 'Sync Restaurants'}
        onPress={handleSync}
        disabled={isSyncing}
      />

      {isSyncing && progress && (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator />
          <Text>
            {progress.current}/{progress.total}: {progress.restaurantName}
          </Text>
          <Text>Status: {progress.status}</Text>
        </View>
      )}

      {result && (
        <View style={{ marginTop: 20 }}>
          <Text>Total: {result.total}</Text>
          <Text>Synced: {result.synced}</Text>
          <Text>Updated: {result.updated}</Text>
          <Text>Failed: {result.failed}</Text>
          
          {result.errors.length > 0 && (
            <View>
              <Text>Errors:</Text>
              {result.errors.map((err, i) => (
                <Text key={i}>{err.restaurant}: {err.error}</Text>
              ))}
            </View>
          )}
        </View>
      )}

      {error && (
        <Text style={{ color: 'red', marginTop: 10 }}>{error}</Text>
      )}
    </View>
  );
}
```

## What Gets Synced

When you sync a restaurant, the following data is fetched and stored:

1. **Google Places Data:**
   - Name, address, location (lat/lng)
   - Rating, price level
   - Phone, website, photos
   - Opening hours, cuisine type

2. **Platform Detection:**
   - Automatically detects reservation platforms from website URLs
   - Supported platforms: OpenTable, Resy, Tock, Toast, 7Rooms, Yelp, Google Reserve

3. **Platform Details:**
   - Platform-specific IDs (restaurant IDs, venue slugs, etc.)
   - Booking URLs
   - Additional metadata

4. **Yelp Enrichment:**
   - Yelp business ID and rating (if Yelp API key configured)

## Integration Points

### In Search Results

When displaying search results, you can automatically sync restaurants:

```typescript
import { syncRestaurantFromSearchResult } from '../data/restaurants';

const handleRestaurantSelect = async (restaurant: Restaurant) => {
  // Sync restaurant when user views details
  await syncRestaurantFromSearchResult(restaurant);
  // Navigate to restaurant details
};
```

### In Restaurant Details

Sync restaurant when viewing details:

```typescript
import { syncRestaurant } from '../data/restaurants';

useEffect(() => {
  if (placeId) {
    syncRestaurant(placeId);
  }
}, [placeId]);
```

## Notes

- The sync process includes rate limiting (1 second delay between requests)
- Progress callbacks are provided for real-time updates
- Errors are tracked and reported for each failed restaurant
- The sync endpoint automatically detects and updates platform information
