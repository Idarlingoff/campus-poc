import { Router } from "express";
import { authJwt, type AuthedRequest } from "../auth/auth.middleware";
import { assertUser } from "../auth/assertUser";
import { getMyProfile, patchMyProfile, setMyAvatarUrl } from "./profile.service";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const profileRouter = Router();

const avatarDir = path.join(process.cwd(), "uploads", "avatars");
fs.mkdirSync(avatarDir, { recursive: true });

function fileFilter(_req: any, file: any, cb: any) {
    const ok = ["image/png", "image/jpeg", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new Error("Invalid file type"), ok);
}

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, avatarDir),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || ".png";
        const id = crypto.randomBytes(16).toString("hex");
        cb(null, `${id}${ext}`);
    },
});

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 3 * 1024 * 1024 },
});

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

// Avatar upload
profileRouter.post("/me/avatar", authJwt, (req, res, next) => {
    upload.single("file")(req as any, res as any, (err: any) => {
        if (err) {
            const msg =
                err.message?.includes("Invalid file type")
                    ? "Format invalide (PNG/JPEG/WEBP uniquement)"
                    : err.code === "LIMIT_FILE_SIZE"
                        ? "Image trop lourde (max 3MB)"
                        : "Upload échoué";
            return res.status(400).json({ message: msg });
        }
        next();
    });
}, async (req: AuthedRequest, res) => {
    assertUser(req);
    if (!req.file) return res.status(400).json({ message: "file required" });

    const userId = req.user.id;

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    await setMyAvatarUrl(userId, avatarUrl);

    return res.status(201).json({ avatarUrl });
});