import { create } from 'zustand';
import { Role, Preferences, Request, Watch, Intent, RestaurantStatus, RestaurantProfile } from '../types';

interface AppState {
  // Role
  role: Role;
  setRole: (role: Role) => void;

  // Preferences
  preferences: Preferences | null;
  setPreferences: (preferences: Preferences) => void;

  // Intent
  currentIntent: Intent | null;
  setCurrentIntent: (intent: Intent | null) => void;

  // Requests
  requests: Request[];
  addRequest: (request: Request) => void;
  updateRequest: (id: string, updates: Partial<Request>) => void;

  // Watchlist
  watches: Watch[];
  addWatch: (watch: Watch) => void;
  removeWatch: (id: string) => void;
  toggleWatchNotifications: (id: string) => void;

  // Restaurant
  restaurantStatus: RestaurantStatus;
  setRestaurantStatus: (status: RestaurantStatus) => void;
  restaurantProfile: RestaurantProfile | null;
  setRestaurantProfile: (profile: RestaurantProfile) => void;
  nextAvailableWindow: string | null;
  setNextAvailableWindow: (window: string | null) => void;

  // Plan
  currentPlan: {
    restaurantId: string;
    restaurantName: string;
    time: string;
    partySize: number;
  } | null;
  setCurrentPlan: (plan: AppState['currentPlan']) => void;
  backupPlans: Array<{
    restaurantId: string;
    restaurantName: string;
    time: string;
    partySize: number;
  }>;
  setBackupPlans: (plans: AppState['backupPlans']) => void;

  // AI Chat
  aiMessages: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
  }>;
  addAIMessage: (message: { text: string; isUser: boolean }) => void;
  isListening: boolean;
  setIsListening: (listening: boolean) => void;
  isThinking: boolean;
  setIsThinking: (thinking: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),

  preferences: null,
  setPreferences: (preferences) => set({ preferences }),

  currentIntent: null,
  setCurrentIntent: (intent) => set({ currentIntent: intent }),

  requests: [],
  addRequest: (request) => set((state) => ({ requests: [...state.requests, request] })),
  updateRequest: (id, updates) =>
    set((state) => ({
      requests: state.requests.map((r) => (r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r)),
    })),

  watches: [],
  addWatch: (watch) => set((state) => ({ watches: [...state.watches, watch] })),
  removeWatch: (id) => set((state) => ({ watches: state.watches.filter((w) => w.id !== id) })),
  toggleWatchNotifications: (id) =>
    set((state) => ({
      watches: state.watches.map((w) =>
        w.id === id ? { ...w, notificationsEnabled: !w.notificationsEnabled } : w
      ),
    })),

  restaurantStatus: 'open',
  setRestaurantStatus: (status) => set({ restaurantStatus: status }),
  restaurantProfile: null,
  setRestaurantProfile: (profile) => set({ restaurantProfile: profile }),
  nextAvailableWindow: null,
  setNextAvailableWindow: (window) => set({ nextAvailableWindow: window }),

  currentPlan: null,
  setCurrentPlan: (plan) => set({ currentPlan: plan }),
  backupPlans: [],
  setBackupPlans: (plans) => set({ backupPlans: plans }),

  // AI Chat
  aiMessages: [],
  addAIMessage: (message) =>
    set((state) => ({
      aiMessages: [
        ...state.aiMessages,
        {
          id: Date.now().toString(),
          text: message.text,
          isUser: message.isUser,
          timestamp: new Date(),
        },
      ],
    })),
  isListening: false,
  setIsListening: (listening) => set({ isListening: listening }),
  isThinking: false,
  setIsThinking: (thinking) => set({ isThinking: thinking }),
}));

