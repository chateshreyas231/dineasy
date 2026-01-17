# Platform Data Guide - Mobile App

This guide shows how to pull data from reservation platforms (OpenTable, Resy, Tock, etc.) and connect it with Supabase in the mobile app.

## Overview

The mobile app can now:
- ✅ Fetch real-time availability from reservation platforms
- ✅ Cache platform data in Supabase for performance
- ✅ Store booking confirmations in Supabase
- ✅ Retrieve restaurant platform information
- ✅ Manage cache expiration and cleanup

## Setup

### 1. Run Supabase Migration

First, create the cache table in Supabase:

```sql
-- Run this in your Supabase SQL Editor
-- See: supabase/migrations/004_add_platform_data_cache.sql
```

Or run the migration file directly.

### 2. Import the Service

```typescript
import {
  getPlatformAvailability,
  getRestaurantPlatforms,
  storePlatformBooking,
} from '../services/platformDataService';
```

## Quick Start

### Fetch Platform Availability

```typescript
import { getPlatformAvailability } from '../services/platformDataService';

// Fetch availability with automatic caching
const availability = await getPlatformAvailability(
  'ChIJN1t_tDeuEmsRUsoyG83frY4', // place_id
  '2025-01-20T19:00:00Z',        // datetime
  2                               // party size
);

if (availability) {
  console.log('Available slots:', availability.slots);
  console.log('Platforms:', availability.providerOptions);
}
```

### Using the React Hook

```typescript
import { usePlatformData } from '../hooks/usePlatformData';

function RestaurantDetailsScreen({ placeId, datetime, partySize }) {
  const {
    availability,
    platforms,
    platformDetails,
    isLoading,
    error,
    refresh,
    fetchAvailability,
  } = usePlatformData(placeId, datetime, partySize, true); // auto-fetch enabled

  return (
    <View>
      {isLoading && <ActivityIndicator />}
      
      {availability && (
        <View>
          <Text>Available Slots: {availability.slots.length}</Text>
          {availability.slots.map((slot, i) => (
            <View key={i}>
              <Text>{slot.datetime}</Text>
              <Text>Platform: {slot.provider}</Text>
              <Text>Verified: {slot.verified ? 'Yes' : 'No'}</Text>
            </View>
          ))}
        </View>
      )}
      
      {platforms && (
        <View>
          <Text>Supported Platforms:</Text>
          {platforms.map(platform => (
            <Text key={platform}>{platform}</Text>
          ))}
        </View>
      )}
      
      <Button title="Refresh" onPress={refresh} />
    </View>
  );
}
```

## API Reference

### `getPlatformAvailability(placeId, datetime, partySize, useCache?)`

Fetches availability from platforms with automatic caching.

**Parameters:**
- `placeId` (string): Google Places place_id
- `datetime` (string): ISO datetime string
- `partySize` (number): Number of guests
- `useCache` (boolean, optional): Use cached data if available (default: true)

**Returns:**
```typescript
{
  placeId: string;
  restaurantName: string;
  requestedDate: string;
  partySize: number;
  providerOptions: Array<{
    name: string;
    enabled: boolean;
    verified: boolean;
  }>;
  slots: Array<{
    datetime: string;
    partySize: number;
    verified: boolean;
    provider: string;
    bookingUrl?: string;
    metadata?: Record<string, any>;
  }>;
  cachedAt?: string;
}
```

### `getRestaurantPlatforms(placeId)`

Gets platform information for a restaurant from Supabase.

**Returns:**
```typescript
{
  platforms: string[];
  platformDetails: Record<string, any>;
}
```

### `storePlatformBooking(placeId, platform, bookingData)`

Stores a booking confirmation in Supabase.

**Parameters:**
- `placeId` (string): Google Places place_id
- `platform` (string): Platform name (opentable, resy, etc.)
- `bookingData`: Booking information

**Returns:** `boolean` (success/failure)

### `cachePlatformAvailability(placeId, platform, data, expiresInMinutes?)`

Manually cache availability data.

### `getCachedPlatformAvailability(placeId, platform)`

Retrieve cached availability data.

### `clearExpiredCache(placeId?)`

Clear expired cache entries.

## Example: Complete Booking Flow

```typescript
import { usePlatformData, usePlatformBooking } from '../hooks/usePlatformData';
import { bookingApi } from '../utils/api';

function BookingScreen({ placeId, datetime, partySize }) {
  const { availability, isLoading, refresh } = usePlatformData(
    placeId,
    datetime,
    partySize,
    true
  );
  
  const { storeBooking, isStoring } = usePlatformBooking();

  const handleBook = async (slot: AvailabilitySlot) => {
    try {
      // Confirm booking via backend
      const bookingResult = await bookingApi.confirm({
        placeId,
        datetime: slot.datetime,
        partySize: slot.partySize,
        provider: slot.provider as any,
      });

      if (bookingResult.data) {
        // Store booking in Supabase
        await storeBooking(placeId, slot.provider, {
          datetime: slot.datetime,
          partySize: slot.partySize,
          bookingId: bookingResult.data.bookingId,
          confirmationUrl: bookingResult.data.redirectUrl,
          metadata: {
            restaurantName: availability?.restaurantName,
            slot: slot,
          },
        });

        // Navigate to confirmation
        navigation.navigate('BookingConfirmation', {
          bookingId: bookingResult.data.bookingId,
        });
      }
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  return (
    <View>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={availability?.slots || []}
          renderItem={({ item: slot }) => (
            <TouchableOpacity onPress={() => handleBook(slot)}>
              <Text>{new Date(slot.datetime).toLocaleString()}</Text>
              <Text>{slot.provider}</Text>
              {slot.verified && <Text>✓ Verified</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}
```

## Caching Strategy

The service automatically caches availability data:

1. **Cache Duration**: 15 minutes by default
2. **Cache Key**: `place_id + platform`
3. **Auto-Refresh**: Fetches fresh data if cache expired
4. **Manual Refresh**: Call `refresh()` to force fresh data

### Cache Management

```typescript
import { clearExpiredCache, getAllCachedPlatformData } from '../services/platformDataService';

// Clear all expired cache
await clearExpiredCache();

// Clear cache for specific restaurant
await clearExpiredCache(placeId);

// Get all cached data for a restaurant
const cached = await getAllCachedPlatformData(placeId);
```

## Platform Data Structure

### Availability Slot

```typescript
{
  datetime: string;        // ISO datetime
  partySize: number;       // Number of guests
  verified: boolean;       // Is this slot verified by platform?
  provider: string;        // Platform name
  bookingUrl?: string;     // Direct booking URL
  metadata?: {             // Additional platform-specific data
    restaurantId?: string;
    venueId?: string;
    // ... other platform data
  };
}
```

### Platform Details (from restaurants table)

```typescript
{
  opentable: {
    restaurant_id: "12345",
    url: "https://www.opentable.com/..."
  },
  resy: {
    venue_slug: "restaurant-name",
    url: "https://resy.com/..."
  },
  // ... other platforms
}
```

## Supabase Tables

### `platform_data_cache`

Stores cached availability data:

- `place_id`: Google Places ID
- `platform`: Platform name
- `availability_data`: JSONB with availability slots
- `cached_at`: When data was cached
- `expires_at`: When cache expires

### `restaurants`

Stores platform information:

- `platforms`: Array of platform names
- `platform_details`: Object with platform-specific data

### `bookings`

Stores booking confirmations:

- `place_id`: Restaurant place ID
- `provider`: Platform name
- `provider_booking_id`: Platform's booking ID
- `booking_url`: Confirmation URL
- `confirmation`: JSONB with booking details

## Error Handling

```typescript
const { availability, error } = usePlatformData(placeId, datetime, partySize);

if (error) {
  return <Text>Error: {error}</Text>;
}

if (!availability) {
  return <Text>No availability found</Text>;
}
```

## Best Practices

1. **Use Caching**: Always use `useCache: true` for better performance
2. **Refresh Strategically**: Only refresh when user explicitly requests it
3. **Handle Errors**: Always check for errors and provide user feedback
4. **Cache Cleanup**: Periodically clear expired cache
5. **Platform Detection**: Check `platforms` array before fetching availability

## Integration with Restaurant Sync

Combine with restaurant sync to get complete platform data:

```typescript
import { syncRestaurant } from '../services/restaurantSyncService';
import { getPlatformAvailability } from '../services/platformDataService';

// 1. Sync restaurant to get platform info
await syncRestaurant(placeId);

// 2. Fetch availability from platforms
const availability = await getPlatformAvailability(placeId, datetime, partySize);
```

## Troubleshooting

### "Supabase not initialized"
- Check your Supabase environment variables
- Ensure `supabase` client is properly configured

### "No availability found"
- Restaurant may not have platforms configured
- Sync the restaurant first to detect platforms
- Check if platforms are enabled in backend

### "Cache not working"
- Verify `platform_data_cache` table exists
- Check RLS policies allow reads/writes
- Ensure `expires_at` is in the future
