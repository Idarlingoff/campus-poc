import { Router } from "express";
import { authJwt, type AuthedRequest } from "../auth/auth.middleware";
import { assertUser } from "../auth/assertUser";
import { getMyProfile, patchMyProfile } from "./profile.service";

export const profileRouter = Router();

profileRouter.get("/me", authJwt, async (req: AuthedRequest, res) => {
    assertUser(req);

    const userId = req.user.id;
    const data = await getMyProfile(userId);
    return res.json(data);
});

profileRouter.patch("/me", authJwt, async (req: AuthedRequest, res) => {
    assertUser(req);

    const userId = req.user.id;
    const updated = await patchMyProfile(userId, req.body ?? {});
    return res.json(updated);
});
