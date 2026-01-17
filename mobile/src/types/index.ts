/**
 * TypeScript Type Definitions
 */

export type UserRole = 'diner' | 'restaurant';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isAdmin?: boolean; // Temporary admin flag
}

export interface Preferences {
  dietary: string[];
  budget: 'low' | 'medium' | 'high' | 'luxury';
  ambience: string[];
  cuisine: string[];
}

export interface QueryIntent {
  partySize?: number;
  dateTime?: Date | string; // Can be Date object or ISO string
  cuisine?: string;
  location?: string;
  occasion?: string;
  vibe?: string[];
  budget?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceLevel: number;
  location: string;
  distance?: number;
  imageUrl?: string;
  highlights?: string[];
  bestTimes?: string[];
  bookingLink?: string;
  platform?: string; // Keep for backward compatibility
  platforms?: string[]; // Array of platforms: ['opentable', 'resy', 'tock', etc.]
  platformDetails?: Record<string, any>; // Platform-specific details
  placeId?: string; // Google Places ID
}

export interface TableRequest {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dateTime: Date;
  partySize: number;
  status: 'pending' | 'confirmed' | 'declined' | 'cancelled';
  notes?: string;
  alternateTimes?: Date[];
}

export interface Booking {
  id: string;
  restaurantId: string;
  restaurantName: string;
  dateTime: Date;
  partySize: number;
  status: 'confirmed' | 'pending' | 'cancelled';
  bookingLink?: string;
  provider?: string;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface AIState {
  isListening: boolean;
  isThinking: boolean;
  messages: AIMessage[];
}

export interface RestaurantProfile {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  cuisine?: string;
  hours?: Record<string, string>;
  status: 'open' | 'closed' | 'busy';
  nextAvailable?: Date;
}

export interface AIActivity {
  id: string;
  type: 'question' | 'thinking' | 'searching' | 'checking' | 'booking' | 'success' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
}

export interface RestaurantOption {
  id: string;
  restaurantId?: string;
  placeId?: string;
  name: string;
  platform: string;
  dateTime: string; // ISO string
  partySize: number;
  cuisine?: string;
  location?: string;
  rating?: number;
  bookingLink?: string;
  photoUrl?: string;
}

export interface BookingRequest {
  platform: string;
  restaurantName: string;
  restaurantId?: string;
  dateTime: string;
  partySize: number;
  userContact: {
    name: string;
    email: string;
    phone?: string;
  };
  bookingLink?: string;
}
