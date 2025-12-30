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
import ProfileEditPage from "../page/ProfileEditPage.vue"
import ChallengesPage from "../page/ChallengesPage.vue";
import ProposeChallengePage from "../page/ProposeChallengePage.vue";
import ChallengeModerationPage from "../page/ChallengeModerationPage.vue";
import ChallengeDetailPage from "../page/ChallengeDetailPage.vue";
import UserProfilePage from "../page/UserProfilePage.vue";

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
            { path: "propose", name: "propose", component: ProposeChallengePage },
            { path: "moderation", name: "moderation", component: ChallengeModerationPage, meta: { requiresAuth: true, requiresPerm: "challenges:moderate" } },
            { path: "challenges", name: "challenges", component: ChallengesPage },
            { path: "challenges/:id", name: "challenge-detail", component: ChallengeDetailPage },
            { path: "profile", name: "profile", component: ProfilePage },
            { path: "profile/:id", name: "profile-user", component: ProfilePage },
            { path: "profile/edit", name: "profile-edit", component: ProfileEditPage },
            { path: "/app/users", name: "users", component: UserProfilePage },
            { path: "/app/users/:id", name: "user-profile", component: UserProfilePage },
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
