/**
 * Reservation Requests API Service
 * Handles creation, listing, and response to reservation requests
 * Used by both diners (creating requests) and restaurants (responding to requests)
 */

import { supabase } from '../../lib/supabase';
import { ReservationRequest } from '../../types/supabase';

/**
 * Request status values
 */
export type RequestStatus = 
  | 'pending' 
  | 'accepted' 
  | 'declined' 
  | 'alternates' 
  | 'expired' 
  | 'cancelled';

/**
 * Response action types
 */
export type ResponseAction = 'accept' | 'decline' | 'alternates';

/**
 * Create request payload
 */
export interface CreateRequestPayload {
  restaurant_id: string;
  place_id: string;
  party_size: number;
  time_window_start: string; // ISO string
  time_window_end: string; // ISO string
  notes?: string | null;
  preferences_snapshot?: any | null;
}

/**
 * Response to request payload
 */
export interface RespondToRequestPayload {
  accepted_time?: string | null; // ISO string
  alternates?: any | null; // Array of alternate time options
  message?: string | null; // Restaurant message to diner
}

/**
 * Normalized request type (matches database schema)
 */
export interface Request extends ReservationRequest {
  status: RequestStatus;
}

/**
 * Normalize Supabase error to readable Error
 */
function normalizeError(error: any, defaultMessage: string): Error {
  if (error instanceof Error) {
    return error;
  }
  
  if (error?.message) {
    return new Error(error.message);
  }
  
  if (typeof error === 'string') {
    return new Error(error);
  }
  
  return new Error(defaultMessage);
}

/**
 * Create a new reservation request
 * @param payload Request creation data
 * @returns Created request object
 * @throws Error with readable message on failure
 */
export async function createRequest(payload: CreateRequestPayload): Promise<Request> {
  try {
    // Get current authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error('Authentication required. Please log in to create a request.');
    }

    // Insert request
    const { data, error } = await supabase
      .from('reservation_requests')
      .insert({
        diner_user_id: user.id,
        restaurant_id: payload.restaurant_id,
        place_id: payload.place_id,
        party_size: payload.party_size,
        time_window_start: payload.time_window_start,
        time_window_end: payload.time_window_end,
        notes: payload.notes ?? null,
        preferences_snapshot: payload.preferences_snapshot ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw normalizeError(error, 'Failed to create reservation request');
    }

    if (!data) {
      throw new Error('Request created but no data returned');
    }

    return data as Request;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating the request');
  }
}

/**
 * List all requests for a specific diner
 * @param diner_user_id Diner user ID
 * @returns Array of request objects
 * @throws Error with readable message on failure
 */
export async function listDinerRequests(diner_user_id: string): Promise<Request[]> {
  try {
    const { data, error } = await supabase
      .from('reservation_requests')
      .select('*')
      .eq('diner_user_id', diner_user_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw normalizeError(error, 'Failed to fetch diner requests');
    }

    return (data || []) as Request[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching diner requests');
  }
}

/**
 * List requests for a specific restaurant, optionally filtered by status
 * @param restaurant_id Restaurant ID
 * @param status Optional status filter (defaults to 'pending')
 * @returns Array of request objects
 * @throws Error with readable message on failure
 */
export async function listRestaurantRequests(
  restaurant_id: string,
  status: RequestStatus = 'pending'
): Promise<Request[]> {
  try {
    let query = supabase
      .from('reservation_requests')
      .select('*')
      .eq('restaurant_id', restaurant_id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw normalizeError(error, 'Failed to fetch restaurant requests');
    }

    return (data || []) as Request[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching restaurant requests');
  }
}

/**
 * Respond to a request (accept, decline, or suggest alternates)
 * @param requestId Request ID to respond to
 * @param action Response action: 'accept', 'decline', or 'alternates'
 * @param payload Optional response data (accepted_time, alternates, message)
 * @returns Updated request object
 * @throws Error with readable message on failure
 */
export async function respondToRequest(
  requestId: string,
  action: ResponseAction,
  payload?: RespondToRequestPayload
): Promise<Request> {
  try {
    // Determine status based on action
    let status: RequestStatus;
    const updateData: any = {};

    switch (action) {
      case 'accept':
        status = 'accepted';
        if (payload?.accepted_time) {
          updateData.accepted_time = payload.accepted_time;
        }
        break;
      case 'decline':
        status = 'declined';
        break;
      case 'alternates':
        status = 'alternates';
        if (payload?.alternates) {
          updateData.alternates = payload.alternates;
        }
        break;
      default:
        throw new Error(`Invalid action: ${action}. Must be 'accept', 'decline', or 'alternates'`);
    }

    // Add restaurant message if provided
    if (payload?.message) {
      updateData.restaurant_message = payload.message;
    }

    // Update request
    const { data, error } = await supabase
      .from('reservation_requests')
      .update({
        status,
        ...updateData,
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw normalizeError(error, `Failed to ${action} request`);
    }

    if (!data) {
      throw new Error('Request not found or update failed');
    }

    return data as Request;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while responding to the request');
  }
}

/**
 * Cancel a request (typically called by diner)
 * @param requestId Request ID to cancel
 * @returns Updated request object
 * @throws Error with readable message on failure
 */
export async function cancelRequest(requestId: string): Promise<Request> {
  try {
    const { data, error } = await supabase
      .from('reservation_requests')
      .update({
        status: 'cancelled',
      })
      .eq('id', requestId)
      .select()
      .single();

    if (error) {
      throw normalizeError(error, 'Failed to cancel request');
    }

    if (!data) {
      throw new Error('Request not found or cancellation failed');
    }

    return data as Request;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while cancelling the request');
  }
}
