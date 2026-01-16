import { supabase } from '../lib/supabase';
import { UserRole } from '../types';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  push_token: string | null;
}

export interface UpsertProfileParams {
  id: string;
  role: UserRole;
  full_name?: string | null;
  phone?: string | null;
  push_token?: string | null;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return data;
}

export async function upsertProfile(params: UpsertProfileParams): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: params.id,
      role: params.role,
      full_name: params.full_name ?? null,
      phone: params.phone ?? null,
      push_token: params.push_token ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error('Error upserting profile:', error);
    return null;
  }

  return data;
}
