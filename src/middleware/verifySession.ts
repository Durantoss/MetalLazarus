import type { Request, Response, NextFunction } from 'express';

import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET!;

export function verifySession(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    (req as any).user = decoded;
    next();
  } catch {
    return res.status(403).json({ error: 'Token verification failed' });
  }
}
