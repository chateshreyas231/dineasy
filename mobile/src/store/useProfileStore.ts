import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Profile } from '../types/db';

interface ProfileState {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  fetchProfile: (userId: string) => Promise<void>;
  updateProfile: (updates: { full_name?: string | null; phone?: string | null }) => Promise<void>;
  updateExtra: (patch: Record<string, any>) => Promise<void>;
  setRole: (role: 'diner' | 'restaurant') => Promise<void>;
  updatePushToken: (token: string) => Promise<void>;
  clearProfile: () => void;
}

const deepMerge = (target: any, source: any): any => {
  if (source === null || typeof source !== 'object') {
    return source;
  }
  
  if (target === null || typeof target !== 'object') {
    return source;
  }

  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key]) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        result[key] = deepMerge(target[key], source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async (userId: string) => {
    set({ loading: true, error: null });
    
    try {
      if (!supabase) {
        throw new Error('Supabase is not configured');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 is "not found" - profile doesn't exist yet
        if (error.code === 'PGRST116') {
          set({ profile: null, loading: false, error: null });
          return;
        }
        
        throw error;
      }

      set({ profile: data, loading: false, error: null });
    } catch (error) {
      console.error('Error fetching profile:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
      });
    }
  },

  updateProfile: async (updates: { full_name?: string | null; phone?: string | null }) => {
    const { profile } = get();
    
    if (!profile) {
      throw new Error('No profile loaded. Call fetchProfile first.');
    }

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    set({ loading: true, error: null });

    try {
      console.log('Updating profile with:', updates);
      console.log('Profile ID:', profile.id);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Supabase update error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      console.log('Profile updated successfully:', data);

      set({
        profile: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      set({
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updateExtra: async (patch: Record<string, any>) => {
    const { profile } = get();
    
    if (!profile) {
      throw new Error('No profile loaded. Call fetchProfile first.');
    }

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    set({ loading: true, error: null });

    try {
      const currentExtra = profile.extra || {};
      const mergedExtra = deepMerge(currentExtra, patch);

      const { data, error } = await supabase
        .from('profiles')
        .update({ extra: mergedExtra })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      set({
        profile: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error updating profile extra:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update profile',
      });
      throw error;
    }
  },

  setRole: async (role: 'diner' | 'restaurant') => {
    const { profile } = get();
    
    if (!profile) {
      throw new Error('No profile loaded. Call fetchProfile first.');
    }

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile role:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        
        // Provide more helpful error messages
        let errorMessage = 'Failed to update role';
        if (error.code === '42501') {
          errorMessage = 'Permission denied. Check Row Level Security (RLS) policies in Supabase.';
        } else if (error.code === 'PGRST301') {
          errorMessage = 'No rows found to update. Profile may not exist.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      set({
        profile: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error updating profile role:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update role';
      set({
        loading: false,
        error: errorMessage,
      });
      throw error;
    }
  },

  updatePushToken: async (token: string) => {
    const { profile } = get();
    
    if (!profile) {
      throw new Error('No profile loaded. Call fetchProfile first.');
    }

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    set({ loading: true, error: null });

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ push_token: token })
        .eq('id', profile.id)
        .select()
        .single();

      if (error) throw error;

      set({
        profile: data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error updating push token:', error);
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update push token',
      });
      throw error;
    }
  },

  clearProfile: () => {
    set({ profile: null, loading: false, error: null });
  },
}));
