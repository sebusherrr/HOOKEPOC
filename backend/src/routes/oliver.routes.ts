import { Router } from 'express';
import { requireAuth, AuthedRequest } from '../middleware/auth';
import { searchOliver, getOliverStatus } from '../services/oliver.service';

export const oliverRouter = Router();

oliverRouter.get('/status', requireAuth, (_req, res) => {
  res.json(getOliverStatus());
});

oliverRouter.get('/search', requireAuth, async (req: AuthedRequest, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ error: 'q is required' });
  const result = await searchOliver(q);
  res.status(result.ok ? 200 : 503).json(result);
});
