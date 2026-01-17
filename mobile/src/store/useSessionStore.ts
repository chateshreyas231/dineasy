import { create } from 'zustand';
import { Session } from '@supabase/supabase-js';
import { supabase, getSupabaseEnv } from '../lib/supabase';

interface SessionState {
  session: Session | null;
  userId: string | null;
  loading: boolean;
  _subscription: any | null;
  init: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  session: null,
  userId: null,
  loading: true,
  _subscription: null,

  init: async () => {
    try {
      // Check if Supabase is configured
      const env = getSupabaseEnv();
      if (!env || !supabase) {
        console.warn('Supabase not configured, skipping session initialization');
        set({ session: null, userId: null, loading: false });
        return;
      }

      // Get initial session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
        set({ session: null, userId: null, loading: false });
        return;
      }

      set({
        session,
        userId: session?.user?.id ?? null,
        loading: false,
      });

      // Subscribe to auth changes (only if not already subscribed)
      if (!get()._subscription) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('Auth state changed:', event, session?.user?.id);
            set({
              session,
              userId: session?.user?.id ?? null,
            });
          }
        );
        set({ _subscription: subscription });
      }
    } catch (error) {
      console.error('Error initializing session:', error);
      set({ session: null, userId: null, loading: false });
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: 'Supabase is not configured' };
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Session is automatically updated via onAuthStateChange subscription
      // But we can also set it directly here for immediate update
      set({
        session: data.session,
        userId: data.session?.user?.id ?? null,
      });

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign in failed' };
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      if (!supabase) {
        return { error: 'Supabase is not configured' };
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      // Session is automatically updated via onAuthStateChange subscription
      set({
        session: data.session,
        userId: data.session?.user?.id ?? null,
      });

      return {};
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Sign up failed' };
    }
  },

  signOut: async () => {
    try {
      if (!supabase) {
        set({ session: null, userId: null });
        return;
      }

      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
      }

      // Session is automatically cleared via onAuthStateChange subscription
      set({
        session: null,
        userId: null,
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
}));
