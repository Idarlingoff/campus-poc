import { Router } from 'express';
import { authJwt, type AuthedRequest } from '../auth/auth.middleware';
import { assertUser } from '../auth/assertUser';
import {
  getMyProfile,
  patchMyProfile,
  setMyAvatarUrl,
  getProfileById,
  followUser,
  unfollowUser,
  listMyFollowing,
  listMyFollowers,
  searchProfiles,
  getFullProfile,
} from './profile.service';

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

export const profileRouter = Router();

const avatarDir = path.join(process.cwd(), 'uploads', 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });

function fileFilter(_req: any, file: any, cb: any) {
  const ok = ['image/png', 'image/jpeg', 'image/webp'].includes(file.mimetype);
  cb(ok ? null : new Error('Invalid file type'), ok);
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, avatarDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const id = crypto.randomBytes(16).toString('hex');
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 },
});

/**
 * ✅ Me
 */
profileRouter.get('/me', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);
  const userId = req.user.id;
  const data = await getMyProfile(userId);
  return res.json(data);
});

profileRouter.patch('/me', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);
  const userId = req.user.id;
  const updated = await patchMyProfile(userId, req.body ?? {});
  return res.json(updated);
});

/**
 * ✅ Follow lists (préparation feed)
 */
profileRouter.get('/me/following', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);
  return res.json(await listMyFollowing(req.user.id));
});

profileRouter.get('/me/followers', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);
  return res.json(await listMyFollowers(req.user.id));
});

/**
 * ✅ Public profile by id (utile pour page /app/users/:id)
 */
profileRouter.get('/:id', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);

  try {
    const viewerId = req.user.id;
    const targetId = String(req.params.id);
    const data = await getProfileById(viewerId, targetId);
    return res.json(data);
  } catch (e: any) {
    if (e?.status) return res.status(e.status).json({ message: e.message });
    return res.status(500).json({ message: 'Erreur profil' });
  }
});

/**
 * ✅ Follow / Unfollow
 */
profileRouter.post('/:id/follow', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);
  const followerId = req.user.id;
  const followedId = req.params.id;
  try {
    const out = await followUser(followerId, followedId);
    return res.status(201).json(out);
  } catch (e: any) {
    return res
      .status(400)
      .json({ message: e?.message ?? 'Impossible de suivre' });
  }
});

profileRouter.delete(
  '/:id/follow',
  authJwt,
  async (req: AuthedRequest, res) => {
    assertUser(req);
    const followerId = req.user.id;
    const followedId = req.params.id;
    const out = await unfollowUser(followerId, followedId);
    return res.json(out);
  },
);

profileRouter.post(
  '/me/avatar',
  authJwt,
  (req, res, next) => {
    upload.single('file')(req as any, res as any, (err: any) => {
      if (err) {
        const msg = err.message?.includes('Invalid file type')
          ? 'Format invalide (PNG/JPEG/WEBP uniquement)'
          : err.code === 'LIMIT_FILE_SIZE'
            ? 'Image trop lourde (max 3MB)'
            : 'Upload échoué';
        return res.status(400).json({ message: msg });
      }
      next();
    });
  },
  async (req: AuthedRequest, res) => {
    assertUser(req);
    if (!req.file) return res.status(400).json({ message: 'file required' });

    const userId = req.user.id;
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await setMyAvatarUrl(userId, avatarUrl);
    return res.status(201).json({ avatarUrl });
  },
);

profileRouter.get('/search', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);

  const q = String(req.query.q ?? '').trim();
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
  const offset = Math.max(0, Number(req.query.offset ?? 0));

  // si pas de query, on renvoie vide (évite de lister tout le campus)
  if (!q || q.length < 2) return res.json({ items: [], total: 0 });

  const data = await searchProfiles(req.user.id, q, limit, offset);
  return res.json(data);
});

profileRouter.get('/:id', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);

  try {
    const viewerId = req.user.id;
    const targetId = String(req.params.id);
    const data = await getFullProfile(viewerId, targetId);
    return res.json(data);
  } catch (e: any) {
    if (e?.status) return res.status(e.status).json({ message: e.message });
    return res.status(500).json({ message: 'Erreur profil' });
  }
});

profileRouter.get('/:id', authJwt, async (req: AuthedRequest, res) => {
  assertUser(req);

  const viewerId = req.user.id;
  const targetId = String(req.params.id);

  if (targetId === viewerId) {
    const data = await getMyProfile(viewerId);
    return res.json(data);
  }

  const data = await getFullProfile(viewerId, targetId);
  return res.json(data);
});
