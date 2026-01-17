/**
 * Booking Requests API Service
 * Handles creation, listing, and response to booking requests
 * Used by both diners (creating requests) and restaurants (responding to requests)
 * 
 * Uses the public.booking_requests table (NOT reservation_requests)
 */

import { supabase } from '../../lib/supabase';
import { BookingRequest } from '../../types/db';

/**
 * Request status values (uppercase to match database constraint)
 */
export type BookingRequestStatus = 
  | 'PENDING' 
  | 'ACCEPTED' 
  | 'DECLINED' 
  | 'ALTERNATES' 
  | 'EXPIRED' 
  | 'CANCELLED';

/**
 * Response action types (uppercase)
 */
export type ResponseAction = 'ACCEPT' | 'DECLINE' | 'ALTERNATES';

/**
 * Create booking request payload
 */
export interface CreateBookingRequestPayload {
  diner_id: string;
  restaurant_id: string;
  party_size: number;
  notes?: string | null;
  time_window_start: string; // ISO string
  time_window_end: string; // ISO string
  preferences_snapshot?: any | null;
}

/**
 * Response to request payload
 */
export interface RespondToRequestPayload {
  accepted_time?: string | null; // ISO string, required for ACCEPT
  alternates?: any | null; // Required for ALTERNATES
  restaurant_message?: string | null; // Optional message from restaurant
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
 * Create a new booking request
 * @param payload Request creation data
 * @returns Created booking request object
 * @throws Error with readable message on failure
 */
export async function createBookingRequest(
  payload: CreateBookingRequestPayload
): Promise<BookingRequest> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Insert request with status='PENDING'
    const { data, error } = await supabase
      .from('booking_requests')
      .insert({
        diner_id: payload.diner_id,
        restaurant_id: payload.restaurant_id,
        party_size: payload.party_size,
        time_window_start: payload.time_window_start,
        time_window_end: payload.time_window_end,
        preferences_snapshot: payload.preferences_snapshot ?? null,
        status: 'PENDING',
        // Note: If notes column exists, include it. Otherwise it will be ignored.
        // If the table doesn't support notes, consider storing in preferences_snapshot
        ...(payload.notes !== undefined && { notes: payload.notes }),
      })
      .select()
      .single();

    if (error) {
      throw normalizeError(error, 'Failed to create booking request');
    }

    if (!data) {
      throw new Error('Request created but no data returned');
    }

    return data as BookingRequest;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while creating the booking request');
  }
}

/**
 * List all booking requests for a specific diner
 * @param diner_id Diner ID
 * @returns Array of booking request objects
 * @throws Error with readable message on failure
 */
export async function listDinerRequests(diner_id: string): Promise<BookingRequest[]> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('booking_requests')
      .select('*')
      .eq('diner_id', diner_id)
      .order('created_at', { ascending: false });

    if (error) {
      throw normalizeError(error, 'Failed to fetch diner booking requests');
    }

    return (data || []) as BookingRequest[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching diner booking requests');
  }
}

/**
 * List booking requests for a specific restaurant, optionally filtered by status
 * @param restaurant_id Restaurant ID
 * @param status Optional status filter (defaults to 'PENDING')
 * @returns Array of booking request objects
 * @throws Error with readable message on failure
 */
export async function listRestaurantRequests(
  restaurant_id: string,
  status: BookingRequestStatus = 'PENDING'
): Promise<BookingRequest[]> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    let query = supabase
      .from('booking_requests')
      .select('*')
      .eq('restaurant_id', restaurant_id);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw normalizeError(error, 'Failed to fetch restaurant booking requests');
    }

    return (data || []) as BookingRequest[];
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while fetching restaurant booking requests');
  }
}

/**
 * Respond to a booking request (accept, decline, or suggest alternates)
 * @param id Request ID to respond to
 * @param action Response action: 'ACCEPT', 'DECLINE', or 'ALTERNATES'
 * @param payload Optional response data (accepted_time, alternates, restaurant_message)
 * @returns Updated booking request object
 * @throws Error with readable message on failure
 */
export async function respondToRequest(
  id: string,
  action: ResponseAction,
  payload?: RespondToRequestPayload
): Promise<BookingRequest> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    // Determine status and required fields based on action
    let status: BookingRequestStatus;
    const updateData: any = {
      updated_at: new Date().toISOString(), // Explicitly update updated_at
    };

    switch (action) {
      case 'ACCEPT':
        status = 'ACCEPTED';
        if (!payload?.accepted_time) {
          throw new Error('accepted_time is required for ACCEPT action');
        }
        updateData.accepted_time = payload.accepted_time;
        break;
      case 'DECLINE':
        status = 'DECLINED';
        break;
      case 'ALTERNATES':
        status = 'ALTERNATES';
        if (!payload?.alternates) {
          throw new Error('alternates is required for ALTERNATES action');
        }
        updateData.alternates = payload.alternates;
        break;
      default:
        throw new Error(`Invalid action: ${action}. Must be 'ACCEPT', 'DECLINE', or 'ALTERNATES'`);
    }

    // Add restaurant message if provided
    if (payload?.restaurant_message !== undefined) {
      updateData.restaurant_message = payload.restaurant_message;
    }

    // Update request
    const { data, error } = await supabase
      .from('booking_requests')
      .update({
        status,
        ...updateData,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw normalizeError(error, `Failed to ${action} booking request`);
    }

    if (!data) {
      throw new Error('Booking request not found or update failed');
    }

    return data as BookingRequest;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while responding to the booking request');
  }
}

/**
 * Cancel a booking request (typically called by diner)
 * @param id Request ID to cancel
 * @returns Updated booking request object
 * @throws Error with readable message on failure
 */
export async function cancelRequest(id: string): Promise<BookingRequest> {
  try {
    if (!supabase) {
      throw new Error('Supabase client not initialized');
    }

    const { data, error } = await supabase
      .from('booking_requests')
      .update({
        status: 'CANCELLED',
        updated_at: new Date().toISOString(), // Explicitly update updated_at
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw normalizeError(error, 'Failed to cancel booking request');
    }

    if (!data) {
      throw new Error('Booking request not found or cancellation failed');
    }

    return data as BookingRequest;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unexpected error occurred while cancelling the booking request');
  }
}
