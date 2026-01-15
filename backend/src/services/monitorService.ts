/**
 * Monitor service for BullMQ job management
 */

import { Queue, Worker, Job } from 'bullmq';
import Redis from 'ioredis';
import { PrismaClient, BookingStatus } from '@prisma/client';
import { getProvider } from '../providers';
import { getPlaceDetails } from '../services/googlePlaces';
import { sendPushNotification } from './pushNotificationService';

const prisma = new PrismaClient();

// Redis connection for BullMQ
const redisConnection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Monitor queue
export const monitorQueue = new Queue('monitor', {
  connection: redisConnection,
});

// Monitor worker
export const monitorWorker = new Worker(
  'monitor',
  async (job: Job) => {
    const { placeId, timeWindowStart, timeWindowEnd, partySize, userId } = job.data;

    try {
      // Get monitor job
      const monitorJob = await prisma.monitorJob.findUnique({
        where: { id: job.id },
      });

      if (!monitorJob || monitorJob.status !== 'ACTIVE') {
        return; // Job cancelled or completed
      }

      // Get restaurant details
      const restaurantDetails = await getPlaceDetails(placeId);

      // Check availability from all enabled providers
      const enabledProviders = ['yelp_reservations', 'opentable_partner']; // Skip deeplink for monitoring
      
      for (const providerName of enabledProviders) {
        const provider = getProvider(providerName as any);
        if (!provider || !provider.isEnabled()) continue;

        try {
          // Check availability for the time window
          const slots = await provider.getAvailability({
            placeId,
            datetime: new Date(timeWindowStart),
            partySize,
          });

          // Find verified slots within time window
          const availableSlots = slots.filter(slot => {
            if (!slot.verified) return false;
            const slotTime = new Date(slot.datetime);
            return slotTime >= new Date(timeWindowStart) && slotTime <= new Date(timeWindowEnd);
          });

          if (availableSlots.length > 0) {
            // Found availability! Create booking and notify user
            const bestSlot = availableSlots[0];

            // Create booking with MONITORING status (user needs to confirm)
            const booking = await prisma.booking.create({
              data: {
                userId,
                placeId,
                restaurantName: restaurantDetails.name,
                restaurantAddress: restaurantDetails.formattedAddress || restaurantDetails.address,
                lat: restaurantDetails.lat,
                lng: restaurantDetails.lng,
                datetime: new Date(bestSlot.datetime),
                partySize,
                provider: providerName as any,
                status: BookingStatus.MONITORING,
                bookingUrl: bestSlot.bookingUrl,
              },
            });

            // Update monitor job
            await prisma.monitorJob.update({
              where: { id: monitorJob.id },
              data: {
                status: 'COMPLETED',
                lastCheckedAt: new Date(),
              },
            });

            // Send push notification
            const user = await prisma.user.findUnique({
              where: { id: userId },
            });

            if (user?.pushToken) {
              await sendPushNotification(user.pushToken, {
                title: 'Table Available!',
                body: `A table is available at ${restaurantDetails.name} for ${partySize} people`,
                data: {
                  type: 'MONITORING_MATCH',
                  bookingId: booking.id,
                  placeId,
                },
              });
            }

            // Stop this job
            await job.remove();

            return {
              success: true,
              bookingId: booking.id,
              slot: bestSlot,
            };
          }
        } catch (error) {
          console.error(`Provider ${providerName} check error:`, error);
        }
      }

      // Update last checked time
      await prisma.monitorJob.update({
        where: { id: monitorJob.id },
        data: {
          lastCheckedAt: new Date(),
        },
      });

      return { success: false, checked: true };
    } catch (error) {
      console.error('Monitor job error:', error);
      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, // Process 5 jobs concurrently
  }
);

/**
 * Start a monitor job
 */
export async function startMonitorJob(monitorJobId: string, data: any) {
  // Add repeatable job that runs every 2-5 minutes
  await monitorQueue.add(
    `monitor:${monitorJobId}`,
    data,
    {
      jobId: monitorJobId,
      repeat: {
        every: 2 * 60 * 1000, // Every 2 minutes
        limit: 60, // Max 60 checks (2 hours)
      },
      removeOnComplete: {
        age: 3600, // Keep completed jobs for 1 hour
      },
      removeOnFail: {
        age: 86400, // Keep failed jobs for 24 hours
      },
    }
  );
}

/**
 * Stop a monitor job
 */
export async function stopMonitorJob(monitorJobId: string) {
  const job = await monitorQueue.getJob(monitorJobId);
  if (job) {
    await job.remove();
  }
  
  // Also remove repeatable job
  const repeatableJobs = await monitorQueue.getRepeatableJobs();
  const repeatableJob = repeatableJobs.find(j => j.id === monitorJobId);
  if (repeatableJob) {
    await monitorQueue.removeRepeatableByKey(repeatableJob.key);
  }
}
