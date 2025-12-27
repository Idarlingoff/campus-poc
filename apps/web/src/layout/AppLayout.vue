<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import AppTopBar from "@/components/ui/AppTopBar.vue";
import BottomNav from "@/components/ui/BottomNav.vue";
import BurgerMenuDrawer from "@/components/navigation/BurgerMenuDrawer.vue";

type TabKey = "feed" | "challenges" | "propose" | "activity";
type Lang = "fr" | "en" | "es";

const props = defineProps<{
  language?: Lang;
  hideBottomNav?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:language", v: Lang): void;
}>();

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const menuOpen = ref(false);

const user = computed(() => {
  if (!auth.me) return { name: "", email: "", points: 0 };
  return {
    name: auth.me.displayName,
    email: auth.me.email,
    points: 0, // à brancher plus tard
  };
});

const lang = computed<Lang>({
  get: () => props.language ?? "fr",
  set: (v) => emit("update:language", v),
});

const activeTab = computed<TabKey>(() => {
  const p = route.path;
  if (p.startsWith("/app/challenges")) return "challenges";
  if (p.startsWith("/app/propose")) return "propose";
  if (p.startsWith("/app/activity")) return "activity";
  return "feed";
});

function goTab(key: TabKey) {
  if (key === "feed") router.push("/feed"); // si ton feed est hors /app
  if (key === "challenges") router.push("/app/challenges");
  if (key === "propose") router.push("/app/propose");
  if (key === "activity") router.push("/app/activity");
}

function goLogin() {
  menuOpen.value = false;
  router.push({ name: "login" });
}

/**
 * Navigation menu burger
 */
function goMenu(key: string) {
  const map: Record<string, string> = {
    points: "/app/rewards",
    groups: "/app/groups",
    profile: "/app/profile",
    "pro-space": "/app/pro",
    settings: "/app/settings",
    help: "/app/help",
    share: "/app/share",
  };

  const target = map[key];
  if (target) router.push(target);

  menuOpen.value = false;
}

/**
 * Logout
 */
function logout() {
  // si invité, pas de logout réel : on propose juste d'aller se connecter
  if (auth.isGuest) {
    menuOpen.value = false;
    router.push({ name: "login" });
    return;
  }

  auth.logout();
  menuOpen.value = false;
  router.replace({ name: "login" });
}
</script>

<template>
  <div class="app-shell">
    <AppTopBar @menu="menuOpen = true" />

    <BurgerMenuDrawer
        v-model="menuOpen"
        :user="user"
        :isGuest="auth.isGuest"
        v-model:language="lang"
        @go="goMenu"
        @login="goLogin"
        @logout="logout"
    />

    <main class="app-content" :class="{ 'no-bottom': hideBottomNav }">
      <RouterView />
    </main>

    <BottomNav
        v-if="!hideBottomNav"
        :activeKey="activeTab"
        @go="goTab"
    />
  </div>
</template>

<style scoped>
.app-shell{
  min-height: 100vh;
  background: #f6f6f6;
}

.app-content{
  padding: 18px;
  padding-bottom: 98px;
}

.app-content.no-bottom{
  padding-bottom: 18px;
}
</style>
