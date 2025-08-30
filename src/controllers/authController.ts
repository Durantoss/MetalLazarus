import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET!;
const jwtTTL = process.env.ADMIN_JWT_TTL_SECONDS || '1800';

export function login(req: Request, res: Response) {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const token = jwt.sign({ username }, jwtSecret, { expiresIn: parseInt(jwtTTL) });
  res.json({ token });
}