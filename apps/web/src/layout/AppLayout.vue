<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth";

import AppTopBar from "@/components/ui/AppTopBar.vue";
import BottomNav, {type BottomTab} from "@/components/ui/BottomNav.vue";
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
const canModerate = computed(() => auth.can("challenges:moderate"));

const user = computed(() => {
  if (!auth.me) return { name: "", email: "", points: 0 };
  return {
    name: auth.me.displayName,
    email: auth.me.email,
    points: 0,
  };
});

const tabs = computed<BottomTab[]>(() => {
  const base: BottomTab[] = [
    { key: "feed", label: "Accueil", icon: "🏠" }, // ✅ toujours visible
  ];

  if (auth.can("challenges:read")) {
    base.push({ key: "challenges", label: "Défis", icon: "◎" });
  }

  if (auth.can("challenges:create") || auth.can("challenges:propose")) {
    base.push({ key: "propose", label: "Proposer", icon: "＋" });
  }

  if (auth.can("activity:read")) {
    base.push({ key: "activity", label: "Activité", icon: "〰" });
  }

  if (base.length === 0) {
    base.push({ key: "feed", label: "Accueil", icon: "🏠" });
  }

  return base;
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

const safeActiveTab = computed<TabKey>(() => {
  const a = activeTab.value;
  return tabs.value.some(t => t.key === a) ? a : (tabs.value[0]?.key ?? "feed");
});

function goTab(key: TabKey) {
  if (!tabs.value.some(t => t.key === key)) return;

  if (key === "feed") router.push("/feed");
  if (key === "challenges") router.push("/app/challenges");
  if (key === "propose") router.push("/app/propose");
  if (key === "activity") router.push("/app/activity");
}

function goLogin() {
  menuOpen.value = false;
  router.push({ name: "login" });
}

function goMenu(key: string) {
  const map: Record<string, string> = {
    points: "/app/rewards",
    groups: "/app/groups",
    profile: "/app/profile",
    moderation: "/app/moderation",
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
        :canModerate="canModerate"
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
        :activeKey="safeActiveTab"
        :tabs="tabs"
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
