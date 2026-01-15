import express from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  verifyRefreshTokenHash,
} from '../utils/auth';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = registerSchema.parse(req.body);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
    });

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // 14 days

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate tokens
    const tokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token (delete old sessions for this user)
    await prisma.session.deleteMany({
      where: { userId: user.id },
    });

    const refreshTokenHash = await hashRefreshToken(refreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshTokenHash,
        expiresAt,
      },
    });

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Delete session
      const refreshTokenHash = await hashRefreshToken(refreshToken);
      await prisma.session.deleteMany({
        where: {
          userId: req.userId!,
          refreshTokenHash,
        },
      });
    }

    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' });
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Find session
    const refreshTokenHash = await hashRefreshToken(refreshToken);
    const session = await prisma.session.findFirst({
      where: {
        userId: payload.userId,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Verify token hash matches
    const isValid = await verifyRefreshTokenHash(refreshToken, session.refreshTokenHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    // Rotate refresh token
    const newRefreshTokenHash = await hashRefreshToken(newRefreshToken);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        expiresAt,
      },
    });

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(401).json({ error: 'Token refresh failed' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: {
        dinerProfile: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      preferences: user.dinerProfile?.preferences || null,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// POST /api/auth/me/push-token
router.post('/me/push-token', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pushToken } = z.object({
      pushToken: z.string().min(1),
    }).parse(req.body);

    await prisma.user.update({
      where: { id: req.userId! },
      data: { pushToken },
    });

    res.json({ message: 'Push token updated' });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Invalid input', details: error.errors });
    }
    console.error('Update push token error:', error);
    res.status(500).json({ error: 'Failed to update push token' });
  }
});

export { router as authRoutes };
