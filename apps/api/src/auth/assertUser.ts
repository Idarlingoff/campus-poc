import type { AuthedRequest } from "./auth.middleware";

export function assertUser(req: AuthedRequest): asserts req is AuthedRequest & {
    user: NonNullable<AuthedRequest["user"]>;
} {
    if (!req.user) {
        throw new Error("User not authenticated");
    }
}
