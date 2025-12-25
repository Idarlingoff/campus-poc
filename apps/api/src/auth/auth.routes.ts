import { Router } from "express";
import { z } from "zod";
import { createUser, findUserByEmail, verifyPassword } from "./auth.service";
import { signAccessToken } from "./jwt";

export const authRouter = Router();

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    displayName: z.string().min(2),
    role: z.enum(["student", "external"]).default("external"), // ajuste si besoin
});

authRouter.post("/register", async (req, res) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const { email, password, displayName, role } = parsed.data;

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ message: "Email already used" });

    const user = await createUser({ email, password, displayName, roleCode: role });
    const accessToken = signAccessToken(user.id);

    return res.status(201).json({
        accessToken,
        user,
    });
});

const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1),
});

authRouter.post("/login", async (req, res) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ message: "Invalid body", errors: parsed.error.flatten() });

    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const ok = await verifyPassword(user, password);
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user.id);

    return res.json({
        accessToken,
        user: { id: user.id, email: user.email, displayName: user.display_name },
    });
});