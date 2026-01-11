import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from './jwt';
import { getMe, type MeResponse } from '../me/me.service';

export type OptionalAuthedRequest = Request & { user?: MeResponse };

export async function optionalAuthJwt(
  req: OptionalAuthedRequest,
  _res: Response,
  next: NextFunction,
) {
  const auth = req.headers.authorization;

  if (!auth || !auth.startsWith('Bearer ')) return next();

  const token = auth.slice('Bearer '.length).trim();
  try {
    const payload = verifyAccessToken(token);
    const me = await getMe(payload.sub);
    req.user = me;
  } catch {}

  next();
}
