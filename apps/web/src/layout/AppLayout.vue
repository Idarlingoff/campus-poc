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
  if (!auth.me) {
    return { name: "", email: "", points: 0 };
  }
  return {
    name: auth.me.displayName,
    email: auth.me.email,
    points: 0,
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
  if (key === "challenges") router.push("/app/challenges");
  if (key === "propose") router.push("/app/propose");
  if (key === "activity") router.push("/app/activity");
}

/**
 * Navigation menu burger
 */
function goMenu(key: string) {
  const map: Record<string, string> = {
    profile: "/app/profile",
    settings: "/app/settings",
    help: "/app/help",
  };

  const target = map[key];
  if (target) router.push(target);

  menuOpen.value = false;
}

/**
 * Logout réel
 */
function logout() {
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
        v-model:language="lang"
        @go="goMenu"
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