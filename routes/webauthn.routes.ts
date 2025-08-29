// src/routes/webauthn.routes.ts
import express, { type Request, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import {
  startRegistration,
  finishRegistration,
  startAuthentication,
  finishAuthentication,
} from '../lib/webauthn.js';

const router = express.Router();

// --- Registration Init ---
router.post('/register-init', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const options = await startRegistration(user.id, email);
    res.json(options);
  } catch (error) {
    console.error('Registration init error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Registration Complete ---
router.post('/register-complete', async (req: Request, res: Response) => {
  try {
    const { email, attestationResponse } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const result = await finishRegistration(user.id, attestationResponse);
    res.json({ success: true, credentialId: result.credentialId });
  } catch (error) {
    console.error('Registration complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Login Init ---
router.post('/login-init', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });
    if (!user || user.passkeys.length === 0) {
      return res.status(404).json({ error: 'No credentials found' });
    }

    const options = await startAuthentication(user.id);
    res.json(options);
  } catch (error) {
    console.error('Login init error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- Login Complete ---
router.post('/login-complete', async (req: Request, res: Response) => {
  try {
    const { email, assertionResponse } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { passkeys: true },
    });
    if (!user || user.passkeys.length === 0) {
      return res.status(404).json({ error: 'No credentials found' });
    }

    const result = await finishAuthentication(user.id, assertionResponse);

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        deviceId: req.headers['user-agent'] || 'unknown',
      },
    });

    res.json({
      success: true,
      credentialId: result.credentialId,
      accessToken: 'TODO: sign JWT here',
      refreshToken: 'TODO: sign refresh token here',
    });
  } catch (error) {
    console.error('Login complete error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
