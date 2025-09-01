import type { Request, Response } from 'express';
import { Router } from 'express';
import { verifySession } from '../middleware/verifySession.ts';

const router = Router();

router.get('/dashboard', verifySession, (req: Request, res: Response) => {
  const user = (req as any).user;
  res.json({ message: `Welcome, ${user.username}` });
});

export default router;
