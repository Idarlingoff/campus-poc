import { Router } from 'express';
import { authJwt, type AuthedRequest } from '../auth/auth.middleware';
import { requirePerm } from '../auth/requirePerm';
import {
  createChallenge,
  listApprovedChallenges,
  listPendingChallenges,
  listChallengesForModeration, // NEW
  getChallengeById,
  getChallengeForModerationById, // NEW (optionnel mais utile)
  getChallengeJudgingBundle, // NEW (optionnel mais recommandé)
  moderateChallenge,
  registerToChallenge,
  submitProof,
  setWinners,
} from './challenges.service';

export const challengesRouter = Router();

/**
 * GET /challenges (APPROVED only)
 */
challengesRouter.get(
  '/',
  authJwt,
  requirePerm('challenges:read'),
  async (_req: AuthedRequest, res) => {
    const items = await listApprovedChallenges();
    res.json(items);
  },
);

/**
 * GET /challenges/pending
 * ⚠️ IMPORTANT: doit être AVANT "/:id"
 */
challengesRouter.get(
  '/pending',
  authJwt,
  requirePerm('challenges:moderate'),
  async (_req: AuthedRequest, res) => {
    const items = await listPendingChallenges();
    res.json(items);
  },
);

/**
 * GET /challenges/moderation
 * -> Liste TOUS les challenges (PENDING/APPROVED/REJECTED) + phase calculée
 */
challengesRouter.get(
  '/moderation',
  authJwt,
  requirePerm('challenges:moderate'),
  async (_req: AuthedRequest, res) => {
    const items = await listChallengesForModeration();
    res.json(items);
  },
);

/**
 * GET /challenges/:id/moderation
 * -> Détail challenge pour modérateur (quel que soit status)
 * (utile si tu veux une page détail modération plus tard)
 */
challengesRouter.get(
  '/:id/moderation',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const data = await getChallengeForModerationById(userId, id);
    res.json(data);
  },
);

/**
 * GET /challenges/:id/judging
 * -> Bundle pour renseigner le podium: challenge + participants + submissions + winners
 */
challengesRouter.get(
  '/:id/judging',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    const id = req.params.id;
    const data = await getChallengeJudgingBundle(id);
    res.json(data);
  },
);

/**
 * GET /challenges/:id
 * Détail challenge (APPROVED only) côté user
 */
challengesRouter.get(
  '/:id',
  authJwt,
  requirePerm('challenges:read'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const data = await getChallengeById(userId, id);
    res.json(data);
  },
);

/**
 * POST /challenges (create PENDING)
 */
challengesRouter.post(
  '/',
  authJwt,
  requirePerm('challenges:create'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const created = await createChallenge(userId, req.body ?? {});
    res.status(201).json(created);
  },
);

/**
 * PATCH /challenges/:id/moderate
 */
challengesRouter.patch(
  '/:id/moderate',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const updated = await moderateChallenge(userId, id, req.body ?? {});
    res.json(updated);
  },
);

/**
 * POST /challenges/:id/register
 */
challengesRouter.post(
  '/:id/register',
  authJwt,
  requirePerm('challenges:participate'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const out = await registerToChallenge(userId, id, req.body ?? {});
    res.status(201).json(out);
  },
);

/**
 * POST /challenges/:id/submission
 */
challengesRouter.post(
  '/:id/submission',
  authJwt,
  requirePerm('challenges:submit'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const out = await submitProof(userId, id, req.body ?? {});
    res.status(201).json(out);
  },
);

/**
 * POST /challenges/:id/winners
 */
challengesRouter.post(
  '/:id/winners',
  authJwt,
  requirePerm('challenges:moderate'),
  async (req: AuthedRequest, res) => {
    const userId = req.user!.id;
    const id = req.params.id;
    const out = await setWinners(userId, id, req.body ?? {});
    res.status(200).json(out);
  },
);
