# Restaurant Sync Script Guide

## Quick Start

**Important:** Run all commands from the `backend` directory:

```bash
cd /Users/shreyaschate/dineasy/backend
```

## Usage

### Search and sync from Google Places:

```bash
# Search Italian restaurants in San Francisco
npm run sync:restaurants -- --query "Italian restaurants" --location "San Francisco, CA"

# Search near specific coordinates
npm run sync:restaurants -- --query "sushi" --lat 37.7749 --lng -122.4194 --radius 10000

# Limit number of results
npm run sync:restaurants -- --query "pizza" --location "New York, NY" --limit 50

# Faster sync (500ms delay between requests)
npm run sync:restaurants -- --query "steakhouse" --location "Chicago, IL" --delay 500
```

### Update existing restaurants in database:

```bash
# Update all restaurants in database
npm run sync:restaurants -- --from-db

# Update first 100 restaurants
npm run sync:restaurants -- --from-db --limit 100
```

### Alternative: Direct tsx usage

```bash
# Using npx (no need to install tsx globally)
npx tsx src/scripts/syncRestaurants.ts --query "Italian restaurants" --location "San Francisco, CA"

# Or if tsx is installed globally
tsx src/scripts/syncRestaurants.ts --query "Italian restaurants" --location "San Francisco, CA"
```

## Options

- `--query <string>` - Search query (default: "restaurant")
- `--location <string>` - Location string (e.g., "San Francisco, CA")
- `--lat <number>` - Latitude for location-based search
- `--lng <number>` - Longitude for location-based search
- `--radius <number>` - Search radius in meters (default: 5000)
- `--from-db` - Sync restaurants from database instead of Google Places
- `--limit <number>` - Maximum number of restaurants to sync
- `--owner-user-id <uuid>` - Optional owner user ID to assign
- `--delay <number>` - Delay between requests in ms (default: 1000)
- `--help` - Show help message

## What the Script Does

For each restaurant, the script:

1. ✅ Fetches full details from Google Places API
2. ✅ Enriches with Yelp data (if API key available)
3. ✅ Detects reservation platforms from website URLs
4. ✅ Fetches platform-specific data:
   - **OpenTable**: restaurant IDs from URLs
   - **Resy**: venue slugs
   - **Yelp**: business IDs via Yelp API
   - **Tock**: venue slugs
5. ✅ Upserts to database with all platform information
6. ✅ Updates `platforms` and `platform_details` columns

## Example Output

```
🚀 Starting restaurant sync...

Options: {
  "query": "Italian restaurants",
  "location": "San Francisco, CA",
  "delay": 1000
}

🔍 Searching Google Places...
📊 Found 20 restaurants, syncing 20...

[1/20] Syncing: Tony's Little Star Pizza (ChIJN1t_tDeuEmsRUsoyG83frY4)
  ✅ Synced

[2/20] Syncing: Delfina (ChIJ...)
  ✅ Updated

...

==================================================
📊 Sync Summary
==================================================
Total restaurants: 20
✅ Newly synced: 15
🔄 Updated: 5
❌ Failed: 0
⏭️  Skipped: 0

✨ Done!
```

## Troubleshooting

### "Missing script: sync:restaurants"
- Make sure you're in the `backend` directory, not `mobile` or `frontend`

### "command not found: tsx"
- Use `npx tsx` instead of just `tsx`
- Or run `npm run sync:restaurants` which uses the local tsx

### API Rate Limits
- Increase the `--delay` value (e.g., `--delay 2000` for 2 seconds)
- Google Places API has rate limits, so be mindful of request frequency

### Database Connection Errors
- Make sure your `.env` file in the `backend` directory has the correct `DATABASE_URL`
- For Supabase, use: `DATABASE_URL="postgresql://..."`
