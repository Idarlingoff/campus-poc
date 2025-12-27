import { Router } from "express";
import { optionalAuthJwt, type OptionalAuthedRequest } from "../auth/optionalAuth.middleware";
import { authJwt, type AuthedRequest } from "../auth/auth.middleware";
import { requirePerm } from "../auth/requirePerm";

export const challengesRouter = Router();

/**
 * Exemple: GET /challenges
 * - accessible aux invités (public), mais tu peux filtrer selon req.user si connecté
 */
challengesRouter.get("/", optionalAuthJwt, async (req: OptionalAuthedRequest, res) => {
    // ici tu renverras plus tard depuis la BDD
    return res.json({
        viewer: req.user ? { id: req.user.id, roles: req.user.roles } : "guest",
        items: [],
    });
});

/**
 * Exemple: POST /challenges
 * - réservé à ceux qui ont challenges:create
 */
challengesRouter.post("/", authJwt, requirePerm("challenges:create"), async (_req: AuthedRequest, res) => {
    // plus tard insert DB
    return res.status(201).json({ ok: true });
});
