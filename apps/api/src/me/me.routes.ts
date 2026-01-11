import { Router } from 'express';
import { authJwt, type AuthedRequest } from '../auth/auth.middleware';

export const meRouter = Router();

meRouter.get('/', authJwt, async (req: AuthedRequest, res) => {
  return res.json(req.user);
});
