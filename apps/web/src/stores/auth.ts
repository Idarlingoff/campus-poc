import { defineStore } from "pinia";
import { apiRequest, ApiError } from "../services/api";

export type Me = {
    id: string;
    email: string;
    displayName: string;
    roles: string[];
    permissions: string[];
};

type LoginResponse = {
    accessToken: string;
    user: { id: string; email: string; displayName: string };
};

type RegisterBody = {
    email: string;
    password: string;
    displayName: string;
    campusId?: string | null;
};

type LoginBody = {
    email: string;
    password: string;
};

const TOKEN_KEY = "campus_access_token";
const GUEST_KEY = "campus_guest";

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: (localStorage.getItem(TOKEN_KEY) as string | null),
        me: null as Me | null,
        guest: localStorage.getItem(GUEST_KEY) === "1",
        loading: false,
        error: null as string | null,
    }),

    getters: {
        isAuthenticated: (s) => !!s.token && !!s.me,
        isGuest: (s) => s.guest === true,
        roles: (s) => s.me?.roles ?? [],
        permissions: (s) => s.me?.permissions ?? [],
    },

    actions: {
        setToken(token: string | null) {
            this.token = token;
            if (token) localStorage.setItem(TOKEN_KEY, token);
            else localStorage.removeItem(TOKEN_KEY);
        },

        setGuest(v: boolean) {
            this.guest = v;
            if (v) localStorage.setItem(GUEST_KEY, "1");
            else localStorage.removeItem(GUEST_KEY);
        },

        enterAsGuest() {
            this.setToken(null);
            this.me = null;
            this.setGuest(true);
            this.error = null;
        },

        can(permission: string): boolean {
            return (this.me?.permissions ?? []).includes(permission);
        },

        hasRole(role: string): boolean {
            return (this.me?.roles ?? []).includes(role);
        },

        async bootstrap() {
            if (!this.token) {
                this.me = null;
                return;
            }

            try {
                this.loading = true;
                this.error = null;

                this.setGuest(false);

                this.me = await apiRequest<Me>("/me", { token: this.token });
            } catch {
                this.setToken(null);
                this.me = null;
            } finally {
                this.loading = false;
            }
        },

        async login(body: LoginBody) {
            this.loading = true;
            this.error = null;

            try {
                const res = await apiRequest<LoginResponse>("/auth/login", {
                    method: "POST",
                    body,
                });

                this.setGuest(false);
                this.setToken(res.accessToken);
                this.me = await apiRequest<Me>("/me", { token: this.token });
            } catch (e) {
                this.setToken(null);
                this.me = null;

                if (e instanceof ApiError) this.error = e.body?.message ?? "Login failed";
                else this.error = "Login failed";

                throw e;
            } finally {
                this.loading = false;
            }
        },

        async register(body: RegisterBody) {
            this.loading = true;
            this.error = null;

            try {
                const res = await apiRequest<LoginResponse>("/auth/register", {
                    method: "POST",
                    body,
                });

                this.setGuest(false);
                this.setToken(res.accessToken);
                this.me = await apiRequest<Me>("/me", { token: this.token });
            } catch (e) {
                this.setToken(null);
                this.me = null;

                if (e instanceof ApiError) this.error = e.body?.message ?? "Register failed";
                else this.error = "Register failed";

                throw e;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.setToken(null);
            this.me = null;
            this.setGuest(false);
            this.error = null;
        },
    },
});