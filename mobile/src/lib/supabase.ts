import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

/**
 * Get Supabase environment variables
 * Returns null if keys are missing (instead of throwing)
 */
export function getSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = 
    process.env.SUPABASE_URL || 
    process.env.EXPO_PUBLIC_SUPABASE_URL || 
    Constants.expoConfig?.extra?.supabaseUrl ||
    '';

  const anonKey = 
    process.env.SUPABASE_ANON_KEY || 
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 
    Constants.expoConfig?.extra?.supabaseAnonKey ||
    '';

  if (!url || !anonKey) {
    console.warn(
      'Supabase environment variables are missing. Please configure:\n' +
      '  - SUPABASE_URL (or EXPO_PUBLIC_SUPABASE_URL)\n' +
      '  - SUPABASE_ANON_KEY (or EXPO_PUBLIC_SUPABASE_ANON_KEY)\n' +
      'Or set them in app.json under extra.supabaseUrl and extra.supabaseAnonKey'
    );
    return null;
  }

  return { url, anonKey };
}

// Lazy initialization of Supabase client
let supabaseClient: SupabaseClient | null = null;

function initializeSupabase(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const env = getSupabaseEnv();
  if (!env) {
    return null;
  }

  try {
    supabaseClient = createClient(env.url, env.anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
    return supabaseClient;
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    return null;
  }
}

// Initialize on module load
const client = initializeSupabase();

// Export supabase - will be null if not configured, but typed as SupabaseClient for convenience
// All callers should check if supabase is null before using it
export const supabase: SupabaseClient | null = client;
