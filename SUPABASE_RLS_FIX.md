# Fixing Row Level Security (RLS) Policies for Profiles Table

If you're unable to update the `role` column in the `profiles` table in Supabase, it's likely due to missing or incorrect Row Level Security (RLS) policies.

## Quick Fix

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run the following SQL:

```sql
-- Enable RLS on profiles table
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if needed (optional)
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
ON profiles
FOR SELECT
USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
ON profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile (including role)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

## Alternative: Using the Supabase Dashboard

1. Go to **Authentication** > **Policies** in your Supabase Dashboard
2. Select the `profiles` table
3. Click **New Policy**
4. Create policies for:
   - **SELECT**: Allow users to view their own profile
   - **INSERT**: Allow users to insert their own profile
   - **UPDATE**: Allow users to update their own profile

For each policy, use the condition: `auth.uid() = id`

## Verify the Fix

After applying the policies, try updating a role in your app. The error should be resolved.

## Common Error Codes

- `42501`: Permission denied - RLS policy is blocking the operation
- `PGRST301`: No rows found - The profile doesn't exist or the query didn't match any rows
- `23505`: Duplicate key - The profile already exists (use upsert instead of insert)

## Notes

- The `id` column in the `profiles` table should match `auth.uid()` (the authenticated user's ID)
- If your profiles table uses a different structure, adjust the policies accordingly
- You can also find the SQL file at: `backend/prisma/migrations/fix_profiles_rls_policies.sql`
