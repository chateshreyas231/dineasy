/**
 * Monitoring routes for "Keep Checking" feature
 */

import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { startMonitorJob, stopMonitorJob } from '../services/monitorService';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const startMonitorSchema = z.object({
  placeId: z.string().min(1),
  timeWindowStart: z.string().datetime(),
  timeWindowEnd: z.string().datetime(),
  partySize: z.coerce.number().min(1).max(20),
});

// POST /api/monitor/start
router.post('/start', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { placeId, timeWindowStart, timeWindowEnd, partySize } = startMonitorSchema.parse(req.body);

    const startDate = new Date(timeWindowStart);
    const endDate = new Date(timeWindowEnd);

    // Validate time window
    if (endDate <= startDate) {
      return res.status(400).json({ error: 'End time must be after start time' });
    }

    // Check for existing active monitor
    const existingMonitor = await prisma.monitorJob.findFirst({
      where: {
        userId: req.userId!,
        placeId,
        status: 'ACTIVE',
      },
    });

    if (existingMonitor) {
      return res.status(400).json({ error: 'Active monitor already exists for this restaurant' });
    }

    // Create monitor job
    const monitorJob = await prisma.monitorJob.create({
      data: {
        userId: req.userId!,
        placeId,
        timeWindowStart: startDate,
        timeWindowEnd: endDate,
        partySize: Number(partySize),
        status: 'ACTIVE',
      },
    });

    // Start BullMQ job
    await startMonitorJob(monitorJob.id, {
      placeId,
      timeWindowStart: startDate,
      timeWindowEnd: endDate,
      partySize: Number(partySize),
      userId: req.userId!,
    });

    res.json({
      monitorJob,
      message: 'Monitoring started',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Start monitor error:', error);
    res.status(500).json({ error: 'Failed to start monitoring' });
  }
});

// POST /api/monitor/stop/:id
router.post('/stop/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const monitorJob = await prisma.monitorJob.findFirst({
      where: {
        id,
        userId: req.userId!,
      },
    });

    if (!monitorJob) {
      return res.status(404).json({ error: 'Monitor job not found' });
    }

    if (monitorJob.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'Monitor is not active' });
    }

    // Stop BullMQ job
    await stopMonitorJob(id);

    // Update status
    const updated = await prisma.monitorJob.update({
      where: { id },
      data: {
        status: 'CANCELLED',
      },
    });

    res.json({
      monitorJob: updated,
      message: 'Monitoring stopped',
    });
  } catch (error) {
    console.error('Stop monitor error:', error);
    res.status(500).json({ error: 'Failed to stop monitoring' });
  }
});

// GET /api/monitor
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const monitorJobs = await prisma.monitorJob.findMany({
      where: {
        userId: req.userId!,
        status: 'ACTIVE',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({
      monitors: monitorJobs,
      count: monitorJobs.length,
    });
  } catch (error) {
    console.error('Get monitors error:', error);
    res.status(500).json({ error: 'Failed to get monitors' });
  }
});

export { router as monitorRoutes };
