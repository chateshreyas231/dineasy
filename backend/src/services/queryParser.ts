/**
 * Natural Language Query Parser
 * Converts user queries like "Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
 * into structured QueryIntent objects
 * 
 * Uses Chrono library for date/time parsing and regex patterns for other fields
 */

import * as chrono from 'chrono-node';
import { QueryIntent } from '../types';

// Common cuisine keywords
const CUISINE_KEYWORDS = [
  'sushi', 'japanese', 'italian', 'french', 'mexican', 'chinese', 'thai',
  'indian', 'mediterranean', 'steakhouse', 'seafood', 'pizza', 'bbq',
  'korean', 'vietnamese', 'greek', 'spanish', 'american', 'fusion',
  'vegetarian', 'vegan', 'brunch', 'breakfast', 'lunch', 'dinner'
];

// Occasion keywords
const OCCASION_KEYWORDS = ['dinner', 'lunch', 'brunch', 'breakfast', 'drinks', 'happy hour'];

// Vibe keywords
const VIBE_KEYWORDS = ['romantic', 'casual', 'formal', 'family-friendly', 'date night', 'business', 'celebration'];

/**
 * Parses a natural language query into a structured QueryIntent
 */
export function parseQuery(query: string): QueryIntent {
  const normalizedQuery = query.toLowerCase().trim();
  
  // Parse date and time using Chrono
  const dateTime = parseDateTime(normalizedQuery);
  
  // Extract party size
  const partySize = parsePartySize(normalizedQuery);
  
  // Extract cuisine
  const cuisine = parseCuisine(normalizedQuery);
  
  // Extract occasion
  const occasion = parseOccasion(normalizedQuery);
  
  // Extract vibe tags
  const vibe = parseVibe(normalizedQuery);
  
  // Extract location (everything else after removing parsed parts)
  const location = parseLocation(normalizedQuery, dateTime, partySize, cuisine, occasion);
  
  return {
    partySize,
    dateTime: dateTime.toISOString(),
    cuisine,
    location,
    occasion,
    vibe
  };
}

/**
 * Parses date and time from query using Chrono
 * Defaults to tomorrow at 7pm if not specified
 */
function parseDateTime(query: string): Date {
  // Try to parse with Chrono
  const parsed = chrono.parseDate(query);
  
  if (parsed) {
    return parsed;
  }
  
  // Fallback: if query contains "tomorrow" or "today", use that
  if (query.includes('tomorrow')) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(19, 0, 0, 0); // 7pm default
    return tomorrow;
  }
  
  if (query.includes('today')) {
    const today = new Date();
    today.setHours(19, 0, 0, 0); // 7pm default
    return today;
  }
  
  // Default to tomorrow 7pm
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 1);
  defaultDate.setHours(19, 0, 0, 0);
  return defaultDate;
}

/**
 * Extracts party size from query
 * Looks for patterns like "for 2", "2 people", "party of 2"
 */
function parsePartySize(query: string): number {
  // Pattern: "for 2", "for 3", etc.
  const forPattern = /for\s+(\d+)/;
  const forMatch = query.match(forPattern);
  if (forMatch) {
    return parseInt(forMatch[1], 10);
  }
  
  // Pattern: "2 people", "3 persons", etc.
  const peoplePattern = /(\d+)\s+(?:people|persons|guests|diners)/;
  const peopleMatch = query.match(peoplePattern);
  if (peopleMatch) {
    return parseInt(peopleMatch[1], 10);
  }
  
  // Pattern: "party of 2"
  const partyPattern = /party\s+of\s+(\d+)/;
  const partyMatch = query.match(partyPattern);
  if (partyMatch) {
    return parseInt(partyMatch[1], 10);
  }
  
  // Default to 2
  return 2;
}

/**
 * Extracts cuisine type from query
 */
function parseCuisine(query: string): string | undefined {
  for (const cuisine of CUISINE_KEYWORDS) {
    if (query.includes(cuisine)) {
      return cuisine.charAt(0).toUpperCase() + cuisine.slice(1);
    }
  }
  return undefined;
}

/**
 * Extracts occasion from query
 */
function parseOccasion(query: string): string | undefined {
  for (const occ of OCCASION_KEYWORDS) {
    if (query.includes(occ)) {
      return occ;
    }
  }
  return undefined;
}

/**
 * Extracts vibe/tags from query
 */
function parseVibe(query: string): string[] | undefined {
  const vibes: string[] = [];
  for (const vibe of VIBE_KEYWORDS) {
    if (query.includes(vibe)) {
      vibes.push(vibe);
    }
  }
  return vibes.length > 0 ? vibes : undefined;
}

/**
 * Extracts location from query
 * Removes parsed parts and uses remaining text as location
 */
function parseLocation(
  query: string,
  dateTime: Date,
  partySize: number,
  cuisine?: string,
  occasion?: string
): string {
  let location = query;
  
  // Remove date/time related words
  location = location.replace(/\b(tomorrow|today|tonight|next week|this week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
  location = location.replace(/\b(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)\b/gi, '');
  location = location.replace(/\b(\d{1,2})\s*(am|pm|AM|PM)\b/gi, '');
  
  // Remove party size references
  location = location.replace(/\bfor\s+\d+\b/gi, '');
  location = location.replace(/\b\d+\s+(?:people|persons|guests|diners)\b/gi, '');
  location = location.replace(/\bparty\s+of\s+\d+\b/gi, '');
  
  // Remove cuisine
  if (cuisine) {
    location = location.replace(new RegExp(`\\b${cuisine.toLowerCase()}\\b`, 'gi'), '');
  }
  
  // Remove occasion
  if (occasion) {
    location = location.replace(new RegExp(`\\b${occasion}\\b`, 'gi'), '');
  }
  
  // Remove vibe keywords
  VIBE_KEYWORDS.forEach(vibe => {
    location = location.replace(new RegExp(`\\b${vibe}\\b`, 'gi'), '');
  });
  
  // Remove common stop words
  location = location.replace(/\b(in|at|near|around|for|a|an|the)\b/gi, '');
  
  // Clean up whitespace
  location = location.trim().replace(/\s+/g, ' ');
  
  // If location is empty or too short, default to a common area
  if (!location || location.length < 2) {
    return 'Chicago, IL'; // Default location
  }
  
  // Capitalize first letter of each word
  return location.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

