-- Migration: Add restaurant platform information
-- Adds columns to store platform associations and Google Places data
-- Run this in your Supabase SQL Editor

-- Add platform-related columns to restaurants table
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS platforms jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS platform_details jsonb DEFAULT '{}'::jsonb;

-- Add place_id column (referenced in other tables but missing from restaurants)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS place_id text NULL;

-- Add missing Google Places data columns
-- Note: address, city, lat, lng, cuisine, price_level already exist
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS rating numeric NULL,
ADD COLUMN IF NOT EXISTS website text NULL,
ADD COLUMN IF NOT EXISTS photo_url text NULL,
ADD COLUMN IF NOT EXISTS google_maps_url text NULL,
ADD COLUMN IF NOT EXISTS types jsonb NULL,
ADD COLUMN IF NOT EXISTS opening_hours jsonb NULL;

-- Add status and settings columns (if not already present)
ALTER TABLE restaurants
ADD COLUMN IF NOT EXISTS status text NULL DEFAULT 'open'::text,
ADD COLUMN IF NOT EXISTS settings jsonb NULL;

-- Add status constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'restaurants_status_check'
  ) THEN
    ALTER TABLE restaurants
    ADD CONSTRAINT restaurants_status_check 
    CHECK (status IS NULL OR status = ANY (ARRAY['open'::text, 'busy'::text, 'closed'::text]));
  END IF;
END $$;

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_restaurants_place_id ON restaurants(place_id) WHERE place_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_platforms ON restaurants USING GIN(platforms) WHERE platforms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_location ON restaurants(lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating) WHERE rating IS NOT NULL;

-- Add unique constraint on place_id to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_restaurants_place_id_unique ON restaurants(place_id) WHERE place_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN restaurants.platforms IS 'Array of reservation platform names, e.g. ["opentable", "resy", "tock"]';
COMMENT ON COLUMN restaurants.platform_details IS 'Platform-specific details like URLs and restaurant IDs';
COMMENT ON COLUMN restaurants.place_id IS 'Google Places API place_id for this restaurant';
