export type Role = 'diner' | 'restaurant' | null;

export interface Restaurant {
  id: string;
  name: string;
  distance: number; // in miles
  tags: string[];
  priceLevel: 1 | 2 | 3; // $, $$, $$$
  estWaitMinRange: [number, number];
  photoUrl?: string;
  cuisine: string[];
  vibe: string[];
  address: string;
  highlights: string[];
  bestTimes: string[];
}

export interface Intent {
  query?: string;
  locationLabel: string;
  timeWindow: 'now' | 'later' | string;
  partySize: number;
  waitTolerance: '0-15' | '15-30' | '30-60' | '60+';
  vibeTags: string[];
  cuisineTags: string[];
  mustHaves: string[];
  dishesLike?: string;
}

export type RequestStatus = 'sent' | 'seen' | 'confirmed' | 'alternate' | 'declined';

export interface Request {
  id: string;
  restaurantId: string;
  restaurantName: string;
  partySize: number;
  timeWindow: string;
  notes?: string;
  status: RequestStatus;
  alternateTimes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Watch {
  id: string;
  geoLabel: string;
  radius: number; // in miles
  timeRange: string;
  vibeTags: string[];
  notificationsEnabled: boolean;
}

export interface Preferences {
  dietary: string[];
  budget: (1 | 2 | 3)[];
  ambience: string[];
}

export interface RestaurantProfile {
  name: string;
  address: string;
  phone: string;
  verified: boolean;
  vibeTags: string[];
  hours: string;
  cuisine: string[];
  avgPrice: 1 | 2 | 3;
  maxHolds: number;
  timeWindows: string[];
}

export type RestaurantStatus = 'open' | 'moderate' | 'busy' | 'full';

