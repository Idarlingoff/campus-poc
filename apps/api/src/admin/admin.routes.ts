import { Router } from "express";
import { authJwt, type AuthedRequest } from "../auth/auth.middleware";
import { requirePerm } from "../auth/requirePerm";
import { query } from "../db";

export const adminRouter = Router();

/**
 * Ajoute un rôle à un user (ici bde)
 */
adminRouter.post("/users/:id/roles/bde", authJwt, requirePerm("roles:assign"), async (req: AuthedRequest, res) => {
    const userId = req.params.id;

    const roleRows = await query<{ id: string }>(`select id from roles where code='bde' limit 1`);
    const roleId = roleRows[0]?.id;
    if (!roleId) return res.status(500).json({ message: "Role bde not found in DB" });

    await query(
        `insert into user_roles(user_id, role_id) values ($1, $2) on conflict do nothing`,
        [userId, roleId]
    );

    return res.status(200).json({ ok: true });
});

/**
 * Retire le rôle bde
 */
adminRouter.delete("/users/:id/roles/bde", authJwt, requirePerm("roles:assign"), async (req: AuthedRequest, res) => {
    const userId = req.params.id;

    const roleRows = await query<{ id: string }>(`select id from roles where code='bde' limit 1`);
    const roleId = roleRows[0]?.id;
    if (!roleId) return res.status(500).json({ message: "Role bde not found in DB" });

    await query(
        `delete from user_roles where user_id=$1 and role_id=$2`,
        [userId, roleId]
    );

    return res.status(200).json({ ok: true });
});
