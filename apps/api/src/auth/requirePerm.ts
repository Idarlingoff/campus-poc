import type { Response, NextFunction } from 'express';
import type { AuthedRequest } from './auth.middleware';

export function requirePerm(permission: string) {
  return (req: AuthedRequest, res: Response, next: NextFunction) => {
    const perms = req.user?.permissions ?? [];
    if (!perms.includes(permission)) {
      return res
        .status(403)
        .json({ message: 'Forbidden', missing: permission });
    }
    next();
  };
}
