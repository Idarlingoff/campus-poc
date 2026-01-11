import { Router } from 'express';
import { authJwt, type AuthedRequest } from '../auth/auth.middleware';
import { assertUser } from '../auth/assertUser';
import { searchUsers } from './users.service';

export const usersRouter = Router();

/**
 * GET /users/search?q=...
 * Auth required (donc invité => pas accès)
 */
usersRouter.get('/search', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);

  const q = String(req.query.q ?? '').trim();
  if (!q || q.length < 2) return res.json({ items: [] });

  const items = await searchUsers(req.user.id, q);
  return res.json({ items });
});
