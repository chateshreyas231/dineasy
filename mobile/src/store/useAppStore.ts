import { create } from 'zustand';
import {
  UserRole,
  User,
  Preferences,
  QueryIntent,
  Restaurant,
  TableRequest,
  Booking,
  AIMessage,
  RestaurantProfile,
} from '../types';

interface AppState {
  // Role
  role: UserRole | null;
  setRole: (role: UserRole) => void;

  // User
  user: User | null;
  setUser: (user: User | null) => void;

  // Preferences
  preferences: Preferences | null;
  setPreferences: (preferences: Preferences) => void;

  // Intent
  intent: QueryIntent | null;
  setIntent: (intent: QueryIntent | null) => void;

  // Requests
  requests: TableRequest[];
  addRequest: (request: TableRequest) => void;
  updateRequest: (id: string, updates: Partial<TableRequest>) => void;

  // Watchlist
  watchlist: Restaurant[];
  addToWatchlist: (restaurant: Restaurant) => void;
  removeFromWatchlist: (id: string) => void;

  // Restaurant Profile
  restaurantProfile: RestaurantProfile | null;
  setRestaurantProfile: (profile: RestaurantProfile | null) => void;

  // Restaurant Status
  restaurantStatus: 'open' | 'closed' | 'busy';
  setRestaurantStatus: (status: 'open' | 'closed' | 'busy') => void;

  // Current Plan
  currentPlan: Booking | null;
  setCurrentPlan: (plan: Booking | null) => void;

  // Backup Plans
  backupPlans: Booking[];
  setBackupPlans: (plans: Booking[]) => void;

  // AI Chat
  aiMessages: AIMessage[];
  isListening: boolean;
  isThinking: boolean;
  addAIMessage: (message: AIMessage) => void;
  setListening: (listening: boolean) => void;
  setThinking: (thinking: boolean) => void;
  clearAIChat: () => void;
  
  // AI Activities (live feed)
  aiActivities: any[];
  addAIActivity: (activity: any) => void;
  clearAIActivities: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Role
  role: null,
  setRole: (role) => set({ role }),

  // User
  user: null,
  setUser: (user) => set({ user }),

  // Preferences
  preferences: null,
  setPreferences: (preferences) => set({ preferences }),

  // Intent
  intent: null,
  setIntent: (intent) => set({ intent }),

  // Requests
  requests: [],
  addRequest: (request) =>
    set((state) => ({ requests: [...state.requests, request] })),
  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === id ? { ...r, ...updates } : r
      ),
    })),

  // Watchlist
  watchlist: [],
  addToWatchlist: (restaurant) =>
    set((state) => ({
      watchlist: [...state.watchlist, restaurant],
    })),
  removeFromWatchlist: (id) =>
    set((state) => ({
      watchlist: state.watchlist.filter((r) => r.id !== id),
    })),

  // Restaurant Profile
  restaurantProfile: null,
  setRestaurantProfile: (profile) => set({ restaurantProfile: profile }),

  // Restaurant Status
  restaurantStatus: 'open',
  setRestaurantStatus: (status) => set({ restaurantStatus: status }),

  // Current Plan
  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),

  // Backup Plans
  backupPlans: [],
  setBackupPlans: (plans) => set({ backupPlans: plans }),

  // AI Chat
  aiMessages: [],
  isListening: false,
  isThinking: false,
  addAIMessage: (message) =>
    set((state) => ({ aiMessages: [...state.aiMessages, message] })),
  setListening: (listening) => set({ isListening: listening }),
  setThinking: (thinking) => set({ isThinking: thinking }),
  clearAIChat: () => set({ aiMessages: [], isListening: false, isThinking: false }),
  
  // AI Activities
  aiActivities: [],
  addAIActivity: (activity) =>
    set((state) => ({ aiActivities: [...state.aiActivities, activity] })),
  clearAIActivities: () => set({ aiActivities: [] }),
}));
