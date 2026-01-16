import { supabase } from '../lib/supabase';

export interface Request {
  id: string;
  restaurant_id: string;
  diner_id: string;
  datetime: string;
  party_size: number;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateRequestParams {
  restaurant_id: string;
  datetime: string;
  party_size: number;
  notes?: string | null;
}

export async function createRequest(params: CreateRequestParams): Promise<Request | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Error creating request: Not authenticated');
    return null;
  }

  const { data, error } = await supabase
    .from('booking_requests')
    .insert({
      restaurant_id: params.restaurant_id,
      datetime: params.datetime,
      party_size: params.party_size,
      notes: params.notes ?? null,
      diner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating request:', error);
    return null;
  }

  return data;
}

export async function getRequest(id: string): Promise<Request | null> {
  const { data, error } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching request:', error);
    return null;
  }

  return data;
}

export async function listMyRequests(): Promise<Request[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Error listing requests: Not authenticated');
    return [];
  }

  const { data, error } = await supabase
    .from('booking_requests')
    .select('*')
    .eq('diner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing requests:', error);
    return [];
  }

  return data || [];
}

export async function listRestaurantPendingRequests(): Promise<Request[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.error('Error listing restaurant requests: Not authenticated');
    return [];
  }

  const { data, error } = await supabase
    .from('booking_requests')
    .select('*, restaurants!inner(*)')
    .eq('restaurants.owner_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error listing restaurant requests:', error);
    return [];
  }

  return data || [];
}

export async function setRequestStatus(id: string, status: string): Promise<Request | null> {
  const { data, error } = await supabase
    .from('booking_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating request status:', error);
    return null;
  }

  return data;
}
