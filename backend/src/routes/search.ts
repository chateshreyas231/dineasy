/**
 * Search API Route
 * Handles GET /api/search requests
 */

import { Router, Request, Response } from 'express';
import { parseQuery } from '../services/queryParser';
import { ReservationService } from '../services/reservationService';
import { getCachedResults, setCachedResults } from '../utils/cache';
import { SearchResponse } from '../types';

const router = Router();
const reservationService = new ReservationService();

/**
 * GET /api/search
 * Query parameter: ?query="Dinner for 2 tomorrow 7pm sushi in Lincoln Park"
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const query = req.query.query as string;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid query parameter',
        message: 'Please provide a query parameter, e.g., ?query="Dinner for 2 tomorrow 7pm sushi in Lincoln Park"'
      });
    }

    // Parse the natural language query
    const parsedIntent = parseQuery(query);
    
    // Check cache first
    const cachedResults = await getCachedResults(parsedIntent);
    if (cachedResults) {
      console.log('✅ Returning cached results');
      const response: SearchResponse = {
        results: cachedResults,
        query,
        parsedIntent,
        timestamp: new Date().toISOString()
      };
      return res.json(response);
    }

    // Search across all platforms
    console.log('🔍 Searching for reservations...', parsedIntent);
    const results = await reservationService.searchReservations(parsedIntent);
    
    // Cache the results
    await setCachedResults(parsedIntent, results);
    
    const response: SearchResponse = {
      results,
      query,
      parsedIntent,
      timestamp: new Date().toISOString()
    };

    res.json(response);
  } catch (error) {
    console.error('Error in search route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as searchRoutes };


