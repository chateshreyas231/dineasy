/**
 * Booking routes with review-plan and confirm flow
 */

import express from 'express';
import { z } from 'zod';
import { PrismaClient, BookingStatus, BookingProvider } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { getProvider, getEnabledProviders } from '../providers';
import { getPlaceDetails } from '../services/googlePlaces';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const availabilitySchema = z.object({
  placeId: z.string().min(1),
  datetime: z.string().datetime(),
  partySize: z.coerce.number().min(1).max(20),
});

const reviewPlanSchema = z.object({
  placeId: z.string().min(1),
  datetime: z.string().datetime(),
  partySize: z.coerce.number().min(1).max(20),
  constraints: z.record(z.any()).optional(),
});

const confirmBookingSchema = z.object({
  planId: z.string().optional(), // Optional plan ID from review-plan
  placeId: z.string().min(1),
  datetime: z.string().datetime(),
  partySize: z.coerce.number().min(1).max(20),
  provider: z.enum(['deeplink', 'yelp_reservations', 'opentable_partner']),
});

const cancelSchema = z.object({
  reason: z.string().optional(),
});

// GET /api/bookings/availability
router.get('/availability', async (req, res) => {
  try {
    const { placeId, datetime, partySize } = availabilitySchema.parse(req.query);

    const requestedDate = new Date(datetime);
    
    // Get restaurant details
    const restaurantDetails = await getPlaceDetails(placeId);

    // Get availability from all enabled providers
    const enabledProviders = getEnabledProviders();
    const providerOptions: any[] = [];
    const allSlots: any[] = [];

    for (const providerName of enabledProviders) {
      const provider = getProvider(providerName as BookingProvider);
      if (!provider) continue;

      try {
        const slots = await provider.getAvailability({
          placeId,
          datetime: requestedDate,
          partySize: Number(partySize),
        });

        providerOptions.push({
          name: providerName,
          enabled: true,
          verified: providerName !== 'deeplink', // Only deeplink is unverified
        });

        allSlots.push(...slots.map(slot => ({
          ...slot,
          provider: providerName,
        })));
      } catch (error) {
        console.error(`Provider ${providerName} availability error:`, error);
      }
    }

    res.json({
      placeId,
      restaurantName: restaurantDetails.name,
      requestedDate: requestedDate.toISOString(),
      partySize: Number(partySize),
      providerOptions,
      slots: allSlots,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Availability error:', error);
    res.status(500).json({ error: 'Failed to get availability' });
  }
});

// POST /api/bookings/review-plan
router.post('/review-plan', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { placeId, datetime, partySize, constraints } = reviewPlanSchema.parse(req.body);

    const requestedDate = new Date(datetime);
    
    // Get restaurant details
    const restaurantDetails = await getPlaceDetails(placeId);

    // Get user for contact info
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get availability
    const enabledProviders = getEnabledProviders();
    let bestProvider: BookingProvider = 'deeplink';
    let verifiedSlot = false;
    let selectedSlot: any = null;

    // Try to find a verified slot
    for (const providerName of enabledProviders) {
      const provider = getProvider(providerName as BookingProvider);
      if (!provider || providerName === 'deeplink') continue; // Skip deeplink for verified slots

      try {
        const slots = await provider.getAvailability({
          placeId,
          datetime: requestedDate,
          partySize: Number(partySize),
        });

        const verifiedSlots = slots.filter(s => s.verified);
        if (verifiedSlots.length > 0) {
          bestProvider = providerName as BookingProvider;
          verifiedSlot = true;
          selectedSlot = verifiedSlots[0];
          break;
        }
      } catch (error) {
        console.error(`Provider ${providerName} check error:`, error);
      }
    }

    // If no verified slot, use deeplink
    if (!verifiedSlot) {
      const deeplinkProvider = getProvider('deeplink');
      if (deeplinkProvider) {
        const slots = await deeplinkProvider.getAvailability({
          placeId,
          datetime: requestedDate,
          partySize: Number(partySize),
        });
        selectedSlot = slots[0];
      }
    }

    // Generate plan ID (could store in cache/DB for short-term)
    const planId = `plan_${Date.now()}_${req.userId}`;

    const planSummary = {
      planId,
      restaurant: {
        placeId,
        name: restaurantDetails.name,
        address: restaurantDetails.formattedAddress || restaurantDetails.address,
        lat: restaurantDetails.lat,
        lng: restaurantDetails.lng,
      },
      datetime: requestedDate.toISOString(),
      partySize: Number(partySize),
      providerChosen: bestProvider,
      verifiedSlot,
      slot: selectedSlot,
      redirectUrl: bestProvider === 'deeplink' ? selectedSlot?.bookingUrl : undefined,
    };

    res.json(planSummary);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Review plan error:', error);
    res.status(500).json({ error: 'Failed to review plan' });
  }
});

// POST /api/bookings/confirm
router.post('/confirm', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { planId, placeId, datetime, partySize, provider } = confirmBookingSchema.parse(req.body);

    const requestedDate = new Date(datetime);
    
    // Get restaurant details
    const restaurantDetails = await getPlaceDetails(placeId);

    // Get user for contact info
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get provider
    const bookingProvider = getProvider(provider);
    if (!bookingProvider || !bookingProvider.isEnabled()) {
      return res.status(400).json({ error: 'Provider not available' });
    }

    // Attempt booking
    const bookingRequest = {
      placeId,
      restaurantName: restaurantDetails.name,
      restaurantAddress: restaurantDetails.formattedAddress || restaurantDetails.address,
      lat: restaurantDetails.lat,
      lng: restaurantDetails.lng,
      datetime: requestedDate,
      partySize: Number(partySize),
      userContact: {
        name: user.name,
        email: user.email,
        phone: undefined, // Could add to user profile
      },
    };

    const bookingResult = await bookingProvider.book(bookingRequest);

    if (!bookingResult.success) {
      return res.status(400).json({
        error: 'Booking failed',
        message: bookingResult.error || 'Unknown error',
      });
    }

    // Determine booking status
    let bookingStatus: BookingStatus = BookingStatus.CONFIRMED;
    if (provider === 'deeplink' || bookingResult.redirectUrl) {
      bookingStatus = BookingStatus.PENDING_EXTERNAL;
    }

    // Create booking record
    const booking = await prisma.booking.create({
      data: {
        userId: req.userId!,
        placeId,
        restaurantName: restaurantDetails.name,
        restaurantAddress: bookingRequest.restaurantAddress,
        lat: restaurantDetails.lat,
        lng: restaurantDetails.lng,
        datetime: requestedDate,
        partySize: Number(partySize),
        provider,
        status: bookingStatus,
        providerBookingId: bookingResult.bookingId,
        bookingUrl: bookingResult.redirectUrl,
        confirmation: bookingResult.confirmation || null,
      },
    });

    res.json({
      mode: bookingStatus === BookingStatus.PENDING_EXTERNAL ? 'REDIRECT' : 'IN_APP',
      bookingId: booking.id,
      redirectUrl: bookingResult.redirectUrl,
      confirmation: bookingResult.confirmation,
      booking,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Confirm booking error:', error);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// GET /api/bookings
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { upcoming } = req.query;
    const now = new Date();

    const where: any = {
      userId: req.userId!,
    };

    if (upcoming === 'true') {
      where.datetime = { gte: now };
    } else if (upcoming === 'false') {
      where.datetime = { lt: now };
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        datetime: 'desc',
      },
    });

    res.json({
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to get bookings' });
  }
});

// GET /api/bookings/:id
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Failed to get booking' });
  }
});

// POST /api/bookings/:id/cancel
router.post('/:id/cancel', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = cancelSchema.parse(req.body);

    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status === BookingStatus.CANCELLED) {
      return res.status(400).json({ error: 'Booking already cancelled' });
    }

    // Try to cancel with provider if supported
    const provider = getProvider(booking.provider);
    let cancelled = false;

    if (provider?.cancel && booking.providerBookingId) {
      try {
        const cancelResult = await provider.cancel(booking.id, booking.providerBookingId);
        cancelled = cancelResult.success;
      } catch (error) {
        console.error('Provider cancel error:', error);
      }
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        status: BookingStatus.CANCELLED,
        confirmation: {
          ...(booking.confirmation as any || {}),
          cancellationReason: reason,
          cancelledAt: new Date().toISOString(),
          providerCancelled: cancelled,
        },
      },
    });

    res.json({
      booking: updatedBooking,
      message: cancelled
        ? 'Booking cancelled with provider'
        : 'Booking marked as cancelled. Please contact the restaurant directly if needed.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Cancel booking error:', error);
    res.status(500).json({ error: 'Failed to cancel booking' });
  }
});

export { router as bookingRoutes };
