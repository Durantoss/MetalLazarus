import type { Router, Request, Response } from 'express';
import { verifySession } from '../middleware/verifySession.ts';

const router = Router();

router.get('/dashboard', verifySession, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: `Welcome, ${user.username}` });
});

export default router;