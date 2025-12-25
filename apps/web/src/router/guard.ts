import type { Router } from "vue-router";
import { useAuthStore } from "../stores/auth";

export function installAuthGuards(router: Router) {
    router.beforeEach(async (to) => {
        const auth = useAuthStore();

        if (auth.token && !auth.me && !auth.loading) {
            await auth.bootstrap();
        }

        const requiresAuth = to.matched.some(
            (r) => r.meta?.requiresAuth === true
        );

        if (requiresAuth) {
            if (auth.isAuthenticated) return true;

            if (to.name === "feed" && auth.isGuest) return true;

            return { name: "login" };
        }

        return true;
    });
}
