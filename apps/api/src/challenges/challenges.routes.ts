import { Router } from "express";
import { authJwt, type AuthedRequest } from "../auth/auth.middleware";
import { requirePerm } from "../auth/requirePerm";
import {
    createChallenge,
    listApprovedChallenges,
    listPendingChallenges,
    moderateChallenge,
} from "./challenges.service";

export const challengesRouter = Router();

/**
 * GET /challenges (APPROVED only)
 */
challengesRouter.get(
    "/",
    authJwt,
    requirePerm("challenges:read"),
    async (req: AuthedRequest, res) => {
        const items = await listApprovedChallenges();
        res.json(items);
    }
);

/**
 * POST /challenges (create PENDING)
 */
challengesRouter.post(
    "/",
    authJwt,
    requirePerm("challenges:create"),
    async (req: AuthedRequest, res) => {
        const userId = req.user!.id;
        const created = await createChallenge(userId, req.body ?? {});
        res.status(201).json(created);
    }
);

/**
 * GET /challenges/pending
 */
challengesRouter.get(
    "/pending",
    authJwt,
    requirePerm("challenges:moderate"),
    async (_req: AuthedRequest, res) => {
        const items = await listPendingChallenges();
        res.json(items);
    }
);

/**
 * PATCH /challenges/:id/moderate
 * body: { action: "approve" | "reject", reason?: string }
 */
challengesRouter.patch(
    "/:id/moderate",
    authJwt,
    requirePerm("challenges:moderate"),
    async (req: AuthedRequest, res) => {
        const userId = req.user!.id;
        const id = req.params.id;
        const updated = await moderateChallenge(userId, id, req.body ?? {});
        res.json(updated);
    }
);