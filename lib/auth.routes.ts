import { Router } from 'express';
import { prisma } from './prisma.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();

// --- Token Helpers ---
function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, { expiresIn: '15m' });
}

function signRefreshToken(sessionId: string): string {
  return jwt.sign({ sid: sessionId }, process.env.SESSION_SECRET!, { expiresIn: '30d' });
}

// --- Registration ---
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        credentials: {
          create: {
            credId: `legacy-${Date.now()}`, // placeholder for WebAuthn migration
            publicKey: Buffer.from(hashed),
            counter: 0,
          },
        },
      },
    });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        deviceId: req.headers['user-agent'] || 'unknown',
      },
    });

    res.json({
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(session.id),
    });
  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// --- Login ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: { credentials: true },
    });

    if (!user || !user.credentials.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const legacyCred = user.credentials[0];
    if (!legacyCred) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, legacyCred.publicKey.toString());

    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        deviceId: req.headers['user-agent'] || 'unknown',
      },
    });

    res.json({
      accessToken: signAccessToken(user.id),
      refreshToken: signRefreshToken(session.id),
    });
  } catch (err) {
    console.error('❌ Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// --- Consent Tracking ---
router.post('/consent', async (req, res) => {
  try {
    const { userId, purpose, scope } = req.body;

    const consent = await prisma.consent.create({
      data: { userId, purpose, scope },
    });

    res.json(consent);
  } catch (err) {
    console.error('❌ Consent error:', err);
    res.status(500).json({ error: 'Consent save failed' });
  }
});

export default router;
