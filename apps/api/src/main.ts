import express from "express";
import cors from "cors";

import { authRouter } from "./auth/auth.routes";
import { meRouter } from "./me/me.routes";
import { authJwt } from "./auth/auth.middleware";
import { requirePerm } from "./auth/requirePerm";
import { adminRouter } from "./admin/admin.routes";
import { challengesRouter } from "./challenges/challenges.routes";
import { profileRouter } from "./profile/profile.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRouter);
app.use("/me", meRouter);

app.use("/admin", adminRouter);

app.use("/challenges", challengesRouter);

app.use("/profile", profileRouter);

app.get("/debug/permissions", authJwt, requirePerm("publications:read"), (req, res) => {
    res.json({ ok: true, message: "You can read publications" });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => {
    console.log(`[api] listening on http://localhost:${port}`);
});