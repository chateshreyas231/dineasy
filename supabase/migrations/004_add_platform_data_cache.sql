-- Migration: Add platform data cache table
-- Stores cached availability data from reservation platforms
-- Run this in your Supabase SQL Editor

-- Create platform_data_cache table
CREATE TABLE IF NOT EXISTS platform_data_cache (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id text NOT NULL,
    platform text NOT NULL,
    availability_data jsonb NOT NULL,
    cached_at timestamptz NOT NULL DEFAULT now(),
    expires_at timestamptz NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    
    -- Unique constraint: one cache entry per place_id + platform combination
    CONSTRAINT platform_data_cache_place_platform_unique UNIQUE (place_id, platform)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_platform_data_cache_place_id ON platform_data_cache(place_id);
CREATE INDEX IF NOT EXISTS idx_platform_data_cache_platform ON platform_data_cache(platform);
CREATE INDEX IF NOT EXISTS idx_platform_data_cache_expires_at ON platform_data_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_platform_data_cache_place_expires ON platform_data_cache(place_id, expires_at);

-- Add comments for documentation
COMMENT ON TABLE platform_data_cache IS 'Caches availability data from reservation platforms to reduce API calls';
COMMENT ON COLUMN platform_data_cache.place_id IS 'Google Places place_id for the restaurant';
COMMENT ON COLUMN platform_data_cache.platform IS 'Platform name: opentable, resy, tock, yelp_reservations, etc.';
COMMENT ON COLUMN platform_data_cache.availability_data IS 'Cached availability slots and platform data';
COMMENT ON COLUMN platform_data_cache.expires_at IS 'When this cache entry expires and should be refreshed';

-- Enable RLS (Row Level Security)
ALTER TABLE platform_data_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read their own cached data
-- Adjust based on your security requirements
CREATE POLICY "Users can read platform cache data"
    ON platform_data_cache
    FOR SELECT
    USING (true); -- Allow all reads for now, adjust as needed

-- Policy: Allow authenticated users to insert/update cache
CREATE POLICY "Users can manage platform cache data"
    ON platform_data_cache
    FOR ALL
    USING (true); -- Allow all writes for now, adjust as needed

-- Function to automatically clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_platform_cache()
RETURNS void AS $$
BEGIN
    DELETE FROM platform_data_cache
    WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to clean up expired entries
-- This would require pg_cron extension
-- SELECT cron.schedule('cleanup-platform-cache', '0 * * * *', 'SELECT cleanup_expired_platform_cache()');
