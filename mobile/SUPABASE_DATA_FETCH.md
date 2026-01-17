# Fetching Data from Supabase - Mobile App Guide

This guide shows how to fetch data directly from your Supabase database in the mobile app.

## Overview

The app now includes functions to fetch data directly from Supabase tables:
- ✅ Restaurants
- ✅ Bookings
- ✅ Platform Data Cache
- ✅ Booking Requests
- ✅ Load all data at once

## Quick Start

### Fetch Restaurants from Supabase

```typescript
import { listRestaurantsFromSupabase, getRestaurantFromSupabase } from '../data/restaurants';

// Fetch all restaurants (with optional filters)
const restaurants = await listRestaurantsFromSupabase({
  limit: 50,
  hasPlatforms: true, // Only restaurants with platforms
  city: 'San Francisco',
  cuisine: 'Italian',
});

// Fetch a single restaurant by place_id
const restaurant = await getRestaurantFromSupabase('ChIJN1t_tDeuEmsRUsoyG83frY4');
```

### Fetch All Data at Once

```typescript
import { loadAllDataFromSupabase } from '../services/supabaseDataService';

// Load all data for the current user
const allData = await loadAllDataFromSupabase({
  restaurantLimit: 100,
  bookingLimit: 50,
  includeExpiredCache: false,
});

console.log('Restaurants:', allData.restaurants);
console.log('Bookings:', allData.bookings);
console.log('Platform Cache:', allData.platformCache);
console.log('Booking Requests:', allData.bookingRequests);
```

## API Reference

### `listRestaurantsFromSupabase(options?)`

Fetches restaurants directly from Supabase.

**Options:**
- `limit?: number` - Maximum number of restaurants to fetch
- `offset?: number` - Pagination offset
- `ownerUserId?: string` - Filter by restaurant owner
- `placeId?: string` - Get specific restaurant by place_id
- `hasPlatforms?: boolean` - Only restaurants with platforms configured
- `city?: string` - Filter by city (searches in address)
- `cuisine?: string` - Filter by cuisine type

**Returns:** `Promise<Restaurant[]>`

### `getRestaurantFromSupabase(placeId)`

Fetches a single restaurant by place_id.

**Returns:** `Promise<Restaurant | null>`

### `fetchBookingsFromSupabase(options?)`

Fetches bookings from Supabase.

**Options:**
- `userId?: string` - Filter by user ID
- `placeId?: string` - Filter by restaurant place_id
- `upcoming?: boolean` - Only upcoming (true) or past (false) bookings
- `limit?: number` - Maximum number of bookings

**Returns:** `Promise<any[]>`

### `fetchPlatformCacheFromSupabase(options?)`

Fetches platform data cache entries.

**Options:**
- `placeId?: string` - Filter by place_id
- `platform?: string` - Filter by platform name
- `includeExpired?: boolean` - Include expired cache entries
- `limit?: number` - Maximum number of entries

**Returns:** `Promise<any[]>`

### `fetchBookingRequestsFromSupabase(options?)`

Fetches booking requests.

**Options:**
- `dinerId?: string` - Filter by diner user ID
- `restaurantId?: string` - Filter by restaurant ID
- `status?: string` - Filter by status (pending, accepted, declined)
- `limit?: number` - Maximum number of requests

**Returns:** `Promise<any[]>`

### `loadAllDataFromSupabase(options?)`

Loads all data from Supabase in parallel.

**Options:**
- `userId?: string` - User ID (defaults to current user)
- `includeExpiredCache?: boolean` - Include expired cache entries
- `restaurantLimit?: number` - Limit for restaurants (default: 100)
- `bookingLimit?: number` - Limit for bookings (default: 50)

**Returns:** `Promise<AllSupabaseData>`

## Example: Loading Data on App Start

```typescript
import { useEffect, useState } from 'react';
import { loadAllDataFromSupabase } from '../services/supabaseDataService';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const allData = await loadAllDataFromSupabase({
          restaurantLimit: 100,
          bookingLimit: 50,
        });
        setData(allData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View>
      <Text>Restaurants: {data.restaurants.length}</Text>
      <Text>Bookings: {data.bookings.length}</Text>
    </View>
  );
}
```

## Example: Restaurant List Screen

```typescript
import { useState, useEffect } from 'react';
import { listRestaurantsFromSupabase } from '../data/restaurants';
import { Restaurant } from '../types';

function RestaurantListScreen() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      try {
        const data = await listRestaurantsFromSupabase({
          limit: 50,
          hasPlatforms: true, // Only show restaurants with booking platforms
        });
        setRestaurants(data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRestaurants();
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <FlatList
      data={restaurants}
      renderItem={({ item }) => (
        <RestaurantCard restaurant={item} />
      )}
    />
  );
}
```

## Example: Using React Hook

```typescript
import { useState, useEffect } from 'react';
import { listRestaurantsFromSupabase } from '../data/restaurants';

function useRestaurantsFromSupabase(options = {}) {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetch() {
      try {
        setLoading(true);
        const data = await listRestaurantsFromSupabase(options);
        setRestaurants(data);
        setError(null);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetch();
  }, [JSON.stringify(options)]);

  return { restaurants, loading, error, refetch: () => fetch() };
}

// Usage
function MyComponent() {
  const { restaurants, loading } = useRestaurantsFromSupabase({
    limit: 20,
    hasPlatforms: true,
  });

  // ...
}
```

## Difference: Supabase vs Backend API

### Use Supabase Direct Fetch When:
- ✅ You want to load data that's already in your database
- ✅ You need to filter by database fields (owner, status, etc.)
- ✅ You want faster queries (no backend round-trip)
- ✅ You're building admin/management screens

### Use Backend API When:
- ✅ You need to search Google Places
- ✅ You need real-time availability from platforms
- ✅ You need to sync/update restaurant data
- ✅ You need platform detection

## Best Practices

1. **Use Pagination**: Always set a `limit` to avoid loading too much data
2. **Filter Early**: Use Supabase filters instead of filtering in JavaScript
3. **Cache Results**: Consider caching results in React state or context
4. **Error Handling**: Always handle errors gracefully
5. **Loading States**: Show loading indicators while fetching

## Troubleshooting

### "Supabase not initialized"
- Check your Supabase environment variables
- Ensure `supabase` client is properly configured in `lib/supabase.ts`

### "No data returned"
- Check RLS (Row Level Security) policies in Supabase
- Verify you're authenticated if required
- Check if data exists in your Supabase dashboard

### "Permission denied"
- Check RLS policies allow reads for your user
- Verify authentication is working
