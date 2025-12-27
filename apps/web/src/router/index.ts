import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";

import AuthLayout from "../layout/AuthLayout.vue";
import AppLayout from "../layout/AppLayout.vue";

import AuthLoginPage from "../page/AuthLoginPage.vue";
import MediaSchoolLoginPage from "../page/MediaSchoolLoginPage.vue";
import RegisterPage from "../page/RegisterPage.vue";
import TermsPage from "../page/TermsPage.vue";

import FeedPage from "../page/FeedPage.vue";
import ProfilePage from "../page/ProfilePage.vue";
import ChallengesPage from "../page/ChallengesPage.vue";

import { installAuthGuards } from "./guard.ts";

const routes: RouteRecordRaw[] = [
    { path: "/", redirect: "/auth/login" },

    {
        path: "/auth",
        component: AuthLayout,
        meta: { guestOnly: true },
        children: [
            { path: "login", name: "login", component: AuthLoginPage },
            { path: "mediaschool-login", name: "mediaschool-login", component: MediaSchoolLoginPage },
            { path: "register", name: "register", component: RegisterPage },
            { path: "terms", name: "terms", component: TermsPage },
            { path: "", redirect: "/auth/login" },
        ],
    },

    { path: "/profile", redirect: "/app/profile" },
    { path: "/feed", redirect: "/app/feed" },
    { path: "/challenges", redirect: "/app/challenges" },

    {
        path: "/app",
        component: AppLayout,
        meta: { requiresAuth: true },
        children: [
            { path: "feed", name: "feed", component: FeedPage },
            { path: "", redirect: "/app/challenges" },
            { path: "challenges", name: "challenges", component: ChallengesPage },
            { path: "profile", name: "profile", component: ProfilePage },
        ],
    },

    { path: "/:pathMatch(.*)*", redirect: "/auth/login" },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

installAuthGuards(router);

export default router;
