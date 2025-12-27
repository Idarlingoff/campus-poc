import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "./jwt";
import { getMe, type MeResponse } from "../me/me.service";

export type AuthedRequest = Request & { user?: MeResponse };

export async function authJwt(req: AuthedRequest, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Missing Authorization Bearer token" });
    }

    const token = auth.slice("Bearer ".length).trim();
    try {
        const payload = verifyAccessToken(token);
        const userId = payload.sub;

        const me = await getMe(userId);
        req.user = me;

        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}