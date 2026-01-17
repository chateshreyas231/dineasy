-- Migration: Fix restaurants owner column
-- Renames owner_id to owner_user_id to match application code expectations
-- Updates the foreign key constraint accordingly

DO $$
BEGIN
    -- Check if owner_id column exists and needs to be renamed
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'restaurants' 
        AND column_name = 'owner_id'
    ) THEN
        -- Drop the existing foreign key constraint
        IF EXISTS (
            SELECT 1 
            FROM information_schema.table_constraints 
            WHERE constraint_schema = 'public'
            AND table_name = 'restaurants' 
            AND constraint_name = 'restaurants_owner_id_fkey'
        ) THEN
            ALTER TABLE restaurants DROP CONSTRAINT restaurants_owner_id_fkey;
            RAISE NOTICE 'Dropped existing foreign key constraint';
        END IF;

        -- Rename owner_id to owner_user_id
        ALTER TABLE restaurants RENAME COLUMN owner_id TO owner_user_id;
        RAISE NOTICE 'Renamed owner_id to owner_user_id';

        -- Recreate the foreign key constraint with the new column name
        ALTER TABLE restaurants 
        ADD CONSTRAINT restaurants_owner_user_id_fkey 
        FOREIGN KEY (owner_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Created foreign key constraint on owner_user_id';
        
    ELSIF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public'
        AND table_name = 'restaurants' 
        AND column_name = 'owner_user_id'
    ) THEN
        -- Add owner_user_id column if neither exists (shouldn't happen, but safe)
        ALTER TABLE restaurants 
        ADD COLUMN owner_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added owner_user_id column';
    ELSE
        RAISE NOTICE 'owner_user_id column already exists';
    END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_restaurants_owner_user_id 
ON restaurants(owner_user_id);
