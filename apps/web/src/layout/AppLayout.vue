<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, useRouter, RouterView } from "vue-router";

import AppTopBar from "@/components/ui/AppTopBar.vue";
import BottomNav from "@/components/ui/BottomNav.vue";
import BurgerMenuDrawer from "@/components/navigation/BurgerMenuDrawer.vue";

type TabKey = "feed" | "challenges" | "propose" | "activity";
type Lang = "fr" | "en" | "es";

const props = defineProps<{
  user?: { name: string; email: string; points: number };
  language?: Lang;
  hideBottomNav?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:language", v: Lang): void;
  (e: "logout"): void;
}>();

const router = useRouter();
const route = useRoute();

const menuOpen = ref(false);

const user = computed(() => props.user ?? ({
  name: "Étudiant MediaSchool",
  email: "Email",
  points: 1250,
}));

const lang = computed<Lang>({
  get: () => props.language ?? "fr",
  set: (v) => emit("update:language", v),
});

/**
 * Map routes -> onglet actif bas de page
 * Ajuste si tes paths diffèrent.
 */
const activeTab = computed<TabKey>(() => {
  const p = route.path;
  if (p.startsWith("/app/propose")) return "propose";
  if (p.startsWith("/app/activity")) return "activity";
  return "feed";
});

function goTab(key: TabKey) {
  if (key === "challenges") router.push({ path: "/app/challenges" });
  if (key === "propose") router.push({ path: "/app/propose" });
  if (key === "activity") router.push({ path: "/app/activity" });
}

/**
 * Navigation menu burger (clé -> route)
 * Ajuste facilement ici selon tes pages.
 */
function goMenu(key: string) {
  const map: Record<string, string> = {
    points: "app/rewards",
    groups: "app/groups",
    profile: "/app/profile",
    "pro-space": "/pro",
    settings: "app/settings",
    help: "app/help",
    share: "app/share",
  };

  const target = map[key];
  if (target) router.push({ path: target });

  menuOpen.value = false;
}

function logout() {
  emit("logout");
  menuOpen.value = false;
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

<style scoped>
.app-shell{
  min-height: 100vh;
  background: #f6f6f6;
}

.app-content{
  padding: 18px;
  padding-bottom: 98px; /* espace BottomNav */
}

.app-content.no-bottom{
  padding-bottom: 18px;
}
</style>
