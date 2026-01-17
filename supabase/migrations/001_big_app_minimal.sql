-- Migration: Big App Minimal
-- Adds AI memory, partner request flow enhancements, watchlist jobs, and search events
-- Run this in your Supabase SQL Editor

-- A) Add extra JSONB column to profiles for AI memory
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS extra jsonb DEFAULT '{}'::jsonb;

-- B) Add new columns to booking_requests
ALTER TABLE booking_requests
ADD COLUMN IF NOT EXISTS time_window_start timestamptz NULL,
ADD COLUMN IF NOT EXISTS time_window_end timestamptz NULL,
ADD COLUMN IF NOT EXISTS accepted_time timestamptz NULL,
ADD COLUMN IF NOT EXISTS alternates jsonb NULL,
ADD COLUMN IF NOT EXISTS restaurant_message text NULL,
ADD COLUMN IF NOT EXISTS preferences_snapshot jsonb NULL;

-- B) Expand status constraint to include new statuses
-- First, drop any existing status constraint if it exists
DO $$
DECLARE
    constraint_name text;
BEGIN
    -- Find the constraint name for status check on booking_requests
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'booking_requests'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%status%';
    
    -- Drop the constraint if found
    IF constraint_name IS NOT NULL THEN
        EXECUTE format('ALTER TABLE booking_requests DROP CONSTRAINT %I', constraint_name);
    END IF;
END $$;

-- Add new constraint with expanded status values
ALTER TABLE booking_requests
ADD CONSTRAINT booking_requests_status_check 
CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'ALTERNATES', 'EXPIRED', 'CANCELLED'));

-- C) Create watchlist_jobs table
CREATE TABLE IF NOT EXISTS watchlist_jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    restaurant_id uuid NULL REFERENCES restaurants(id) ON DELETE SET NULL,
    place_id text NULL,
    restaurant_name text NOT NULL,
    party_size int NOT NULL CHECK (party_size > 0),
    time_window_start timestamptz NOT NULL,
    time_window_end timestamptz NOT NULL,
    mode text NOT NULL DEFAULT 'notify_only' CHECK (mode IN ('notify_only', 'auto_request_partner', 'auto_call')),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
    preferences_snapshot jsonb NULL,
    last_checked_at timestamptz NULL,
    next_check_at timestamptz NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- D) Create search_events table
CREATE TABLE IF NOT EXISTS search_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    diner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    place_id text NULL,
    restaurant_id uuid NULL REFERENCES restaurants(id) ON DELETE SET NULL,
    query_text text NOT NULL,
    intent jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- E) Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_booking_requests_restaurant_status_created 
ON booking_requests(restaurant_id, status, created_at);

CREATE INDEX IF NOT EXISTS idx_booking_requests_diner_created 
ON booking_requests(diner_id, created_at);

CREATE INDEX IF NOT EXISTS idx_watchlist_jobs_diner_status_next_check 
ON watchlist_jobs(diner_id, status, next_check_at);

CREATE INDEX IF NOT EXISTS idx_search_events_created 
ON search_events(created_at);

CREATE INDEX IF NOT EXISTS idx_search_events_restaurant_created 
ON search_events(restaurant_id, created_at);
