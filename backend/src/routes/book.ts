/**
 * Booking API Route
 * Handles POST /api/book requests
 * 
 * For MVP: Primarily redirects to platform booking pages
 * Can optionally log booking attempts and send confirmation emails
 */

import { Router, Request, Response } from 'express';
import { BookingRequest, BookingResponse } from '../types';
import { sendBookingConfirmation } from '../utils/mailer';
import { prisma } from '../utils/db';

const router = Router();

/**
 * POST /api/book
 * Request body: BookingRequest
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const bookingRequest: BookingRequest = req.body;
    
    // Validate request
    if (!bookingRequest.platform || !bookingRequest.restaurantName || 
        !bookingRequest.dateTime || !bookingRequest.userContact?.email) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide platform, restaurantName, dateTime, and userContact.email'
      });
    }

    // For MVP, if we have a bookingLink, redirect to it
    if (bookingRequest.bookingLink) {
      // Log the booking attempt to database
      try {
        await prisma.reservation.create({
          data: {
            restaurantName: bookingRequest.restaurantName,
            platform: bookingRequest.platform,
            dateTime: new Date(bookingRequest.dateTime),
            partySize: bookingRequest.partySize,
            userEmail: bookingRequest.userContact.email,
            userName: bookingRequest.userContact.name,
            status: 'PENDING',
            bookingLink: bookingRequest.bookingLink
          }
        });
      } catch (dbError) {
        console.error('Error logging reservation to database:', dbError);
        // Continue even if DB logging fails
      }

      // Send confirmation email (async, don't wait)
      sendBookingConfirmation(
        bookingRequest.userContact.email,
        {
          name: bookingRequest.restaurantName,
          platform: bookingRequest.platform,
          dateTime: bookingRequest.dateTime,
          partySize: bookingRequest.partySize,
          location: '', // Could be included in request
          bookingLink: bookingRequest.bookingLink
        },
        {
          name: bookingRequest.userContact.name,
          phone: bookingRequest.userContact.phone
        }
      ).catch(err => console.error('Error sending email:', err));

      const response: BookingResponse = {
        success: true,
        message: 'Redirecting to booking page',
        redirectUrl: bookingRequest.bookingLink
      };

      return res.json(response);
    }

    // If no bookingLink, return error (auto-booking not implemented in MVP)
    res.status(400).json({
      error: 'Booking link required',
      message: 'Auto-booking not yet implemented. Please provide a bookingLink to redirect to the platform.'
    });
  } catch (error) {
    console.error('Error in book route:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as bookRoutes };

