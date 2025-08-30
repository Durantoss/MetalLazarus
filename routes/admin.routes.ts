import { prisma } from '../lib/prisma.js';
import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'Durantoss_Anomaly';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'GiegerBomba25!';
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'metal-lazarus-admin-secret';

router.post('/admin-login', (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin' }, ADMIN_JWT_SECRET, { expiresIn: '1h' });

  res.json({ ok: true, token, role: 'admin' });
});

export default router;
