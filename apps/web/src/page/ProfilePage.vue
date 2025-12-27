<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import ProfileHeroCard from "../components/profile/ProfileHeroCard.vue";
import ProfileIdentity from "../components/profile/ProfileIdentity.vue";
import ProfileStatsRow from "../components/profile/ProfileStatsRow.vue";

import ProfileProgressCard from "../components/profile/ProfileProgressCard.vue";
import LevelProgressBar from "../components/profile/LevelProgressBar.vue";

import BadgesCard from "../components/profile/BadgesCard.vue";
import BadgeGrid, { type Badge } from "../components/profile/BadgeGrid.vue";

import RecentActivityCard from "../components/profile/RecentActivityCard.vue";
import ActivityList from "../components/profile/ActivityList.vue";
import type { ActivityItem } from "../components/profile/ActivityListItem.vue";

import ProfileActionsCard from "../components/profile/ProfileActionsCard.vue";
import ProfileActionItem from "../components/profile/ProfileActionItem.vue";

import ContactInfoCard from "../components/profile/ContactInfoCard.vue";
import ContactLine from "../components/profile/ContactLine.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type ProfileMeResponse = {
  identity: {
    id: string;
    email: string;
    displayName: string;
    bio: string;
    city: string;
    schoolLine: string;
    sinceDate?: string | null;
    avatarText: string;
    roles?: string[];
  };
  stats: {
    pointsTotal: number;
    challengesDone: number;
    ranking: number | null;
  };
  progression: {
    current: number;
    max: number;
    hint: string;
  };
  badges: Array<{ title: string; description: string; icon: string; unlocked: boolean }>;
  recentActivity: Array<{ icon: string; title: string; meta: string; points?: number; createdAt: string }>;
};

const auth = useAuthStore();
const router = useRouter();

const isGuest = computed(() => auth.isGuest || !auth.isAuthenticated);

const loading = ref(false);
const error = ref<string | null>(null);
const profile = ref<ProfileMeResponse | null>(null);

function goLogin() {
  router.push({ name: "login" });
}

function logout() {
  auth.logout();
  router.replace({ name: "login" });
}

async function fetchProfile() {
  if (!auth.token) return;

  loading.value = true;
  error.value = null;

  try {
    profile.value = await apiRequest<ProfileMeResponse>("/profile/me", {
      token: auth.token,
    });
  } catch (e: any) {
    // Si token invalide/expiré => logout
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      auth.logout();
      router.replace({ name: "login" });
      return;
    }
    error.value = e instanceof ApiError ? (e.body?.message ?? "Erreur profil") : "Erreur profil";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  // invité => pas d’appel API
  if (isGuest.value) return;

  // si connecté mais me pas encore chargé (edge case), bootstrap
  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }

  // si après bootstrap on n'est pas authentifié => login
  if (!auth.isAuthenticated) return;

  await fetchProfile();
});

/**
 * Helpers
 */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "🙂";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "🙂";
}

/**
 * Bindings vers l'API
 */
const displayName = computed(() => profile.value?.identity.displayName ?? auth.me?.displayName ?? "");
const email = computed(() => profile.value?.identity.email ?? auth.me?.email ?? "");

const schoolLine = computed(() => profile.value?.identity.schoolLine ?? "");
const bio = computed(() => profile.value?.identity.bio ?? "");
const city = computed(() => profile.value?.identity.city ?? "");
const since = computed(() => {
  const d = profile.value?.identity.sinceDate;
  if (!d) return "";
  // format simple AAAA-MM -> tu pourras formatter mieux plus tard
  return d;
});

const avatarText = computed(() => {
  const apiAvatar = profile.value?.identity.avatarText?.trim();
  if (apiAvatar) return apiAvatar;
  return initials(displayName.value);
});

const stats = computed(() => {
  const s = profile.value?.stats;
  if (!s) return [];
  return [
    { value: s.pointsTotal, label: "Points totaux" },
    { value: s.challengesDone, label: "Défis" },
    { value: s.ranking ? `#${s.ranking}` : "—", label: "Classement actuel" },
  ];
});

const progressionCurrent = computed(() => profile.value?.progression.current ?? 0);
const progressionMax = computed(() => profile.value?.progression.max ?? 1000);
const progressHint = computed(() => profile.value?.progression.hint ?? "");

const badges = computed<Badge[]>(() =>
    (profile.value?.badges ?? []).map((b) => ({
      title: b.title,
      description: b.description,
      icon: b.icon,
      unlocked: b.unlocked,
    }))
);

const badgeCountLabel = computed(() => {
  const all = badges.value.length;
  const unlocked = badges.value.filter((b) => b.unlocked).length;
  return `${unlocked}/${all}`;
});

const activity = computed<ActivityItem[]>(() =>
    (profile.value?.recentActivity ?? []).map((a) => ({
      icon: a.icon || "◎",
      title: a.title,
      meta: a.meta ?? "",
      points: a.points,
    }))
);

/**
 * Actions
 */
function goSettings() {
  router.push("/app/settings");
}
function goShare() {
  router.push("/app/share");
}
function editProfile() {
  // TODO: /app/profile/edit
  console.log("edit profile");
}
</script>

<template>
  <!-- invité -->
  <div v-if="isGuest" class="guest-wall">
    <div class="guest-card">
      <h2>Profil indisponible en mode invité</h2>
      <p>Connecte-toi pour accéder à ton profil, tes badges et ta progression.</p>
      <button class="primary" type="button" @click="goLogin">Se connecter</button>
    </div>
  </div>

  <!-- connecté -->
  <template v-else>
    <div v-if="loading" class="loading">
      Chargement du profil...
    </div>

    <div v-else-if="error" class="error-box">
      <div class="err-title">Impossible de charger le profil</div>
      <div class="err-msg">{{ error }}</div>
      <button class="retry" type="button" @click="fetchProfile">Réessayer</button>
    </div>

    <template v-else>
      <ProfileHeroCard :showEdit="true" @edit="editProfile">
        <ProfileIdentity
            :name="displayName"
            :schoolLine="schoolLine"
            :bio="bio"
            :city="city"
            :since="since"
            :avatarText="avatarText"
        />
        <ProfileStatsRow :stats="stats" />
      </ProfileHeroCard>

      <ProfileProgressCard rightLabel=" ">
        <LevelProgressBar
            :current="progressionCurrent"
            :max="progressionMax"
            :hint="progressHint"
        />
      </ProfileProgressCard>

      <BadgesCard :countLabel="badgeCountLabel">
        <template v-if="badges.length > 0">
          <BadgeGrid :badges="badges" />
        </template>

        <template v-else>
          <EmptyState
              icon="🏅"
              title="Aucun badge pour le moment"
              description="Complète ton premier défi pour débloquer un badge."
          />
        </template>
      </BadgesCard>

      <RecentActivityCard>
        <template v-if="activity.length > 0">
          <ActivityList :items="activity" />
        </template>

        <template v-else>
          <EmptyState
              icon="📭"
              title="Aucune activité récente"
              description="Ta participation apparaîtra ici après tes premiers défis."
          />
        </template>
      </RecentActivityCard>

      <ProfileActionsCard>
        <ProfileActionItem icon="👤" label="Modifier le profil" @click="editProfile" />
        <ProfileActionItem icon="🔗" label="Partager mon profil" @click="goShare" />
        <ProfileActionItem icon="⚙️" label="Paramètres" @click="goSettings" />
        <ProfileActionItem icon="⎋" label="Déconnexion" danger @click="logout" />
      </ProfileActionsCard>

      <ContactInfoCard>
        <ContactLine icon="✉️" label="Email" :value="email" />
      </ContactInfoCard>
    </template>
  </template>
</template>

<style scoped>
.guest-wall{
  min-height: 70vh;
  display:grid;
  place-items:center;
}
.guest-card{
  width: min(520px, 92vw);
  border-radius: 18px;
  padding: 18px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
  color: rgba(0,0,0,0.85);
}
.guest-card h2{ margin: 0 0 6px; }
.guest-card p{ margin: 0 0 14px; color: rgba(0,0,0,0.6); }

.primary{
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
  color: white;
  font-weight: 800;
}

.loading{
  padding: 18px;
  color: rgba(0,0,0,0.65);
  font-weight: 700;
}

.error-box{
  width: min(520px, 92vw);
  margin: 0 auto;
  border-radius: 18px;
  padding: 18px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
  color: rgba(0,0,0,0.85);
}
.err-title{ font-weight: 900; margin-bottom: 6px; }
.err-msg{ color: rgba(0,0,0,0.6); margin-bottom: 12px; }
.retry{
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor:pointer;
  font-weight: 800;
}
</style>
