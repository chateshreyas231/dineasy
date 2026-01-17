/**
 * AI Agent Service
 * Slot-filling conversation with explicit confirmation guardrails
 */

import { apiClient, bookingApi } from '../utils/api';
import { QueryIntent, RestaurantOption, BookingRequest } from '../types';

export interface AIActivity {
  id: string;
  type: 'thinking' | 'searching' | 'checking' | 'booking' | 'success' | 'error';
  message: string;
  timestamp: Date;
  data?: any;
}

export type AgentStage = 'COLLECTING' | 'REVIEWING_PLAN';

type Slots = Partial<Pick<QueryIntent, 'partySize' | 'dateTime' | 'location' | 'cuisine'>>;

type PendingPlan = {
  restaurant: RestaurantOption;
  verified: boolean; // must be true if availability tool verified
};

export type MonitoringOffer = {
  restaurant: RestaurantOption;
  timeWindowStart: Date;
  timeWindowEnd: Date;
  partySize: number;
};

export type AgentReply = {
  assistantText: string;
  statusLine?: string;
  quickReplies?: string[];
  pendingPlan?: PendingPlan;
  monitoringOffer?: MonitoringOffer;
};

class AIAgentService {
  private activities: AIActivity[] = [];
  private onActivityUpdate?: (activities: AIActivity[]) => void;

  private stage: AgentStage = 'COLLECTING';
  private slots: Slots = {};
  private pendingPlan: PendingPlan | null = null;
  private lastResults: RestaurantOption[] = [];

  setActivityCallback(callback: (activities: AIActivity[]) => void) {
    this.onActivityUpdate = callback;
  }

  private addActivity(activity: Omit<AIActivity, 'id' | 'timestamp'>) {
    const newActivity: AIActivity = {
      ...activity,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    this.activities.push(newActivity);
    this.onActivityUpdate?.(this.activities);
  }

  clearActivities() {
    this.activities = [];
    this.onActivityUpdate?.(this.activities);
  }

  resetConversation() {
    this.stage = 'COLLECTING';
    this.slots = {};
    this.pendingPlan = null;
    this.lastResults = [];
    this.clearActivities();
  }

  /**
   * MAIN ENTRY: one message in -> one structured reply out
   * Guardrails:
   * - never claims availability without /availability tool response
   * - never books without explicit confirmation
   */
  async handleUserMessage(text: string): Promise<AgentReply> {
    const message = text.trim();
    if (!message) {
      return { assistantText: "Tell me what you're craving and when you want to go." };
    }

    this.addActivity({ type: 'thinking', message: 'Understanding your request...' });

    // 1) If user is confirming/cancelling an existing plan
    if (this.pendingPlan) {
      const yes = this.isYes(message);
      const no = this.isNo(message);

      if (yes) {
        // Only book on explicit confirmation
        this.addActivity({ type: 'booking', message: `Booking at ${this.pendingPlan.restaurant.name}...` });

        return {
          assistantText: `Got it. I'm booking ${this.pendingPlan.restaurant.name} now.`,
          statusLine: 'booking…',
          pendingPlan: this.pendingPlan || undefined,
        };
      }

      if (no) {
        this.pendingPlan = null;
        this.stage = 'COLLECTING';
        return {
          assistantText: `No worries. Want me to show a couple more options?`,
          quickReplies: ['Show options', 'Change location', 'Change time'],
        };
      }

      // If user changes constraints (e.g., "downtown"), treat as slot update and re-search
      this.pendingPlan = null;
      this.stage = 'COLLECTING';
    }

    // 2) Update slots from message
    this.slots = this.parseAndUpdateSlots(message, this.slots);

    // 3) Ask ONE missing slot at a time (like your frames)
    const missing = this.nextMissingSlot(this.slots);
    if (missing) {
      return this.askForSlot(missing, this.slots);
    }

    // 4) Search
    this.addActivity({ type: 'searching', message: 'Searching restaurants...' });

    const query = this.buildSearchQuery(this.slots);
    const results = await this.searchRestaurants(query);

    if (results.length === 0) {
      return {
        assistantText: `I couldn't find good matches. Want to widen the area or change the time?`,
        quickReplies: ['Widen area', 'Change time', 'Any cuisine'],
      };
    }

    this.lastResults = results;

    // 5) Check availability for top choice (tool verified)
    const top = results[0];
    this.addActivity({ type: 'checking', message: `Checking availability at ${top.name}...` });

    const verifiedAvailable = await this.checkAvailability(top);

    if (verifiedAvailable) {
      this.pendingPlan = { restaurant: top, verified: true };
      this.stage = 'REVIEWING_PLAN';

        return {
          assistantText: `${top.name} is available for ${top.partySize} at ${this.prettyTime(top.dateTime)}. Do you want me to book it?`,
          quickReplies: ['Yes, book it', 'No', 'Show other options'],
          pendingPlan: this.pendingPlan || undefined,
          statusLine: 'available ✓',
        };
    }

    // Not available: offer monitoring + options
    const requestedTime = new Date(this.slots.dateTime as any);
    const timeWindowStart = new Date(requestedTime);
    timeWindowStart.setHours(timeWindowStart.getHours() - 1); // 1 hour before
    const timeWindowEnd = new Date(requestedTime);
    timeWindowEnd.setHours(timeWindowEnd.getHours() + 2); // 2 hours after
    
    return {
      assistantText: `I don't see an available slot right now for your exact time. Want me to keep checking and alert you if something opens up?`,
      quickReplies: ['Yes, keep checking', 'Show other options', 'Change time'],
      statusLine: 'not available',
      monitoringOffer: {
        restaurant: top,
        timeWindowStart,
        timeWindowEnd,
        partySize: this.slots.partySize || 2,
      },
    };
  }

  /**
   * Call this ONLY when user explicitly confirms booking.
   * You'll trigger this from UI when they tap "Confirm booking".
   */
  async confirmBooking(userContact: { name: string; email: string; phone?: string }): Promise<{
    success: boolean;
    bookingId?: string;
    redirectUrl?: string;
    restaurant?: RestaurantOption;
    error?: string;
  }> {
    if (!this.pendingPlan) throw new Error('No pending plan to book');

    const restaurant = this.pendingPlan.restaurant;

    // Use review-plan and confirm flow
    try {
      // First review plan
      const reviewResponse = await bookingApi.reviewPlan(
        restaurant.restaurantId || restaurant.placeId || '',
        restaurant.dateTime,
        restaurant.partySize
      );

      if (reviewResponse.error) {
        this.addActivity({
          type: 'error',
          message: `Review failed: ${reviewResponse.error}`,
        });
        return { success: false, error: reviewResponse.error };
      }

      const plan = reviewResponse.data as any;
      if (!plan) {
        return { success: false, error: 'Failed to review plan' };
      }

      // Then confirm
      const confirmResponse = await bookingApi.confirm({
        planId: plan.planId,
        placeId: restaurant.restaurantId || restaurant.placeId || '',
        datetime: restaurant.dateTime,
        partySize: restaurant.partySize,
        provider: (plan.providerChosen || 'deeplink') as 'deeplink' | 'yelp_reservations' | 'opentable_partner',
      });

      if (confirmResponse.error || !confirmResponse.data) {
        this.addActivity({
          type: 'error',
          message: `Booking failed: ${confirmResponse.error || 'Unknown error'}`,
        });
        return { success: false, error: confirmResponse.error || 'Booking failed' };
      }

      const bookingData = confirmResponse.data as any;

      this.addActivity({
        type: 'success',
        message: `✓ Booked at ${restaurant.name}`,
        data: { bookingId: bookingData?.bookingId },
      });

      // Clear plan after booking attempt
      this.pendingPlan = null;
      this.stage = 'COLLECTING';

      return {
        success: true,
        bookingId: bookingData?.bookingId,
        redirectUrl: bookingData?.redirectUrl,
        restaurant,
      };
    } catch (error) {
      this.addActivity({
        type: 'error',
        message: `Booking error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
      return { success: false, error: error instanceof Error ? error.message : 'Booking failed' };
    }
  }

  async checkAvailability(restaurant: RestaurantOption): Promise<boolean> {
    try {
      const response = await bookingApi.getAvailability(
        restaurant.restaurantId || restaurant.placeId || '',
        restaurant.dateTime,
        restaurant.partySize
      );
      if (response.error) return false;
      
      // Check if any slot is verified
      const data = response.data as any;
      const slots = data?.slots || [];
      return slots.some((slot: any) => slot.verified === true);
    } catch {
      return false;
    }
  }

  private async searchRestaurants(query: string): Promise<RestaurantOption[]> {
    try {
      const response = await apiClient.get<{ results: RestaurantOption[] }>(`/restaurants/search?query=${encodeURIComponent(query)}`);
      if (response.error) {
        this.addActivity({ type: 'error', message: `Search failed: ${response.error}` });
        return [];
      }
      const results = response.data?.results || [];
      this.addActivity({ type: 'success', message: `Found ${results.length} options` });
      
      // Transform to RestaurantOption format
      return results.map((r: any) => ({
        id: r.placeId || r.id,
        restaurantId: r.placeId,
        placeId: r.placeId,
        name: r.name,
        platform: r.platforms?.[0] || r.platform || 'deeplink', // Use first platform or fallback
        dateTime: (typeof this.slots.dateTime === 'string' ? this.slots.dateTime : this.slots.dateTime?.toISOString()) || new Date().toISOString(),
        partySize: this.slots.partySize || 2,
        cuisine: r.types?.[0] || this.slots.cuisine || 'restaurant',
        location: r.address || this.slots.location || '',
        rating: r.rating,
        bookingLink: r.googleMapsUrl || r.website,
        photoUrl: r.photoUrl,
      }));
    } catch {
      this.addActivity({ type: 'error', message: 'Failed to search restaurants' });
      return [];
    }
  }

  // ---------- Slot filling helpers ----------

  private nextMissingSlot(slots: Slots): 'location' | 'partySize' | 'dateTime' | 'cuisine' | null {
    // Priority order: location, partySize, dateTime, cuisine
    if (!slots.location) return 'location';
    if (!slots.partySize) return 'partySize';
    if (!slots.dateTime) return 'dateTime';
    if (!slots.cuisine) return 'cuisine';
    return null;
  }

  private askForSlot(missing: 'location' | 'partySize' | 'dateTime' | 'cuisine', slots: Slots): AgentReply {
    switch (missing) {
      case 'location':
        return {
          assistantText: 'What area should I search in?',
          quickReplies: ['Downtown', 'Near me', 'River North', 'Loop'],
          statusLine: 'locating…',
        };
      case 'partySize':
        return {
          assistantText: 'How many people?',
          quickReplies: ['2', '3', '4', '5'],
          statusLine: 'collecting info…',
        };
      case 'dateTime':
        return {
          assistantText: 'What time?',
          quickReplies: ['7:00 PM', '8:00 PM', '9:00 PM', 'Tonight'],
          statusLine: 'collecting info…',
        };
      case 'cuisine':
        return {
          assistantText: 'What are you in the mood for?',
          quickReplies: ['Sushi', 'Italian', 'Steak', 'Anything'],
          statusLine: 'collecting info…',
        };
      default:
        return { assistantText: 'Tell me a bit more.' };
    }
  }

  private parseAndUpdateSlots(text: string, current: Slots): Slots {
    const q = text.toLowerCase();
    const next: Slots = { ...current };

    // Quick cuisine
    const cuisineKeywords: Record<string, string> = {
      sushi: 'sushi',
      italian: 'italian',
      mexican: 'mexican',
      chinese: 'chinese',
      indian: 'indian',
      french: 'french',
      steak: 'steak',
      seafood: 'seafood',
      pizza: 'italian',
      burger: 'american',
    };
    for (const [key, value] of Object.entries(cuisineKeywords)) {
      if (q.includes(key)) {
        next.cuisine = value;
        break;
      }
    }
    if (q.includes('anything') || q.includes('any')) next.cuisine = 'any';

    // Location (simple, you can replace with GPS later)
    if (q.includes('downtown')) next.location = 'downtown';
    if (q.includes('river north') || q.includes('rivernorth')) next.location = 'river north';
    if (q.includes('loop')) next.location = 'loop';
    if (q.includes('near me') || q.includes('my location')) next.location = 'near me';
    
    const locMatch = text.match(/(?:in|near|around)\s+(.+?)(?:\s|$)/i);
    if (locMatch?.[1] && locMatch[1].length < 40) {
      next.location = locMatch[1].trim();
    }

    // Party size
    const partyMatch = text.match(/(\d+)\s*(?:people|person|guests?|party|p)/i);
    if (partyMatch && Number(partyMatch[1]) > 0 && Number(partyMatch[1]) < 30) {
      next.partySize = Number(partyMatch[1]);
    }

    // Time (basic; replace with chrono later)
    const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeMatch) {
      const now = new Date();
      const hourRaw = Number(timeMatch[1]);
      const mins = Number(timeMatch[2] || '0');
      const isPm = timeMatch[3].toLowerCase() === 'pm';
      const hour = (hourRaw % 12) + (isPm ? 12 : 0);
      now.setHours(hour, mins, 0, 0);
      next.dateTime = now.toISOString() as any;
    }
    if (q.includes('tonight') && !next.dateTime) {
      const now = new Date();
      now.setHours(20, 0, 0, 0); // default 8pm
      next.dateTime = now.toISOString() as any;
    }
    if (q.includes('tomorrow') && !next.dateTime) {
      const now = new Date();
      now.setDate(now.getDate() + 1);
      now.setHours(20, 0, 0, 0);
      next.dateTime = now.toISOString() as any;
    }

    return next;
  }

  private buildSearchQuery(slots: Slots) {
    const parts = [
      slots.cuisine && slots.cuisine !== 'any' ? slots.cuisine : 'restaurant',
      slots.location ? `in ${slots.location}` : '',
      slots.partySize ? `for ${slots.partySize}` : '',
      slots.dateTime ? `at ${this.prettyTime(slots.dateTime)}` : '',
    ].filter(Boolean);

    return parts.join(' ');
  }

  private prettyTime(iso?: string | Date) {
    if (!iso) return '';
    const d = typeof iso === 'string' ? new Date(iso) : iso;
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private isYes(text: string) {
    const t = text.toLowerCase();
    return ['yes', 'y', 'book', 'book it', 'confirm', 'go ahead', 'sure', 'ok', 'okay'].some((k) => t.includes(k));
  }

  private isNo(text: string) {
    const t = text.toLowerCase();
    return ['no', 'n', "don't", 'dont', 'cancel', 'not now', 'skip', 'maybe later'].some((k) => t.includes(k));
  }

  getActivities() {
    return this.activities;
  }

  getPendingPlan() {
    return this.pendingPlan;
  }
}

export const aiAgentService = new AIAgentService();
