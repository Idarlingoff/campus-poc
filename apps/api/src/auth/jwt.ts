import jwt, { type Secret, type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d";

export type JwtPayload = { sub: string };

export function signAccessToken(userId: string): string {
    const options: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jwt.sign({ sub: userId }, JWT_SECRET as Secret, options);
}

export function verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, JWT_SECRET as Secret) as JwtPayload;
}
