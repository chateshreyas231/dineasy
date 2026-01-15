/**
 * Mock Restaurant Data
 */

import { Restaurant } from '../types';

export const mockRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'The French Laundry',
    cuisine: 'French',
    rating: 4.8,
    priceLevel: 4,
    location: 'Yountville, CA',
    distance: 2.5,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
    highlights: ['Michelin Star', 'Wine Pairing', 'Private Dining'],
    bestTimes: ['7:00 PM', '7:30 PM', '8:00 PM'],
    bookingLink: 'https://www.opentable.com/...',
    platform: 'OpenTable',
  },
  {
    id: '2',
    name: 'Sushi Nakazawa',
    cuisine: 'Sushi',
    rating: 4.9,
    priceLevel: 4,
    location: 'New York, NY',
    distance: 1.2,
    imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55',
    highlights: ['Omakase', 'Fresh Fish', 'Intimate Setting'],
    bestTimes: ['6:00 PM', '6:30 PM', '7:00 PM'],
    bookingLink: 'https://www.resy.com/...',
    platform: 'Resy',
  },
  {
    id: '3',
    name: 'Eleven Madison Park',
    cuisine: 'Contemporary',
    rating: 4.7,
    priceLevel: 4,
    location: 'New York, NY',
    distance: 3.8,
    imageUrl: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0',
    highlights: ['Plant-Based', 'Tasting Menu', 'Award Winning'],
    bestTimes: ['8:00 PM', '8:30 PM'],
    bookingLink: 'https://www.tock.com/...',
    platform: 'Tock',
  },
];
