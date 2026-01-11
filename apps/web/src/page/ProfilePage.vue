<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
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
import SocialsCard from "../components/profile/SocialsCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type LastNameVisibility = "FULL" | "INITIAL" | "HIDDEN";
type ProfileVisibility = "CAMPUS" | "PRIVATE";

type ProfileResponse = {
  identity: {
    id: string;
    email: string;

    displayName: string;

    firstName: string;
    lastName: string;
    lastNameVisibility: LastNameVisibility;

    bio: string;
    city: string;
    schoolLine: string;
    sinceDate?: string | null;

    avatarText: string;
    avatarUrl?: string | null;

    birthDate?: string | null;
    age?: number | null;

    showEmail: boolean;
    showBirthDate: boolean;
    showAge: boolean;

    profileVisibility: ProfileVisibility;

    socials?: {
      show: boolean;
      instagramHandle: string;
      linkedinUrl: string;
      websiteUrl: string;
    };
    roles?: string[];
  };

  follow?: {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };

  stats?: {
    pointsTotal: number;
    challengesDone: number;
    ranking: number | null;
  };

  progression?: {
    current: number;
    max: number;
    hint: string;
  };

  badges?: Array<{ title: string; description: string; icon: string; unlocked: boolean }>;
  recentActivity?: Array<{ icon: string; title: string; meta: string; points?: number; createdAt: string }>;
};

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isGuest = computed(() => auth.isGuest || !auth.isAuthenticated);

const loading = ref(false);
const error = ref<string | null>(null);
const profile = ref<ProfileResponse | null>(null);

/**
 * Mode: my profile or other user profile
 */
const targetId = computed(() => String(route.params.id ?? ""));
const isOtherUser = computed(() => !!targetId.value && targetId.value !== auth.me?.id);

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
    const url = isOtherUser.value
        ? `/profile/${encodeURIComponent(targetId.value)}`
        : "/profile/me";

    profile.value = await apiRequest<ProfileResponse>(url, { token: auth.token });
  } catch (e: any) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      if (e.status === 401) {
        auth.logout();
        router.replace({ name: "login" });
        return;
      }
      error.value = e.body?.message ?? "Profil privé";
      return;
    }
    error.value = e instanceof ApiError ? (e.body?.message ?? "Erreur profil") : "Erreur profil";
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  if (isGuest.value) return;

  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }
  if (!auth.isAuthenticated) return;

  await fetchProfile();
});

watch(
    () => route.params.id,
    async () => {
      if (isGuest.value) return;
      await fetchProfile();
    }
);

/**
 * Helpers (name/avatar/date)
 */
function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "🙂";
  const a = parts[0]?.[0] ?? "";
  const b = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (a + b).toUpperCase() || "🙂";
}

const identity = computed(() => profile.value?.identity);
const displayName = computed(() => identity.value?.displayName ?? auth.me?.displayName ?? "");

const publicName = computed(() => {
  const i = identity.value;
  if (!i) return displayName.value;

  const fn = (i.firstName ?? "").trim();
  const ln = (i.lastName ?? "").trim();

  if (!fn && !ln) return displayName.value;

  if (i.lastNameVisibility === "HIDDEN") return fn || displayName.value;
  if (i.lastNameVisibility === "INITIAL") return ln.length > 0 ? `${fn} ${ln[0]!.toUpperCase()}.` : (fn || displayName.value);
  return `${fn} ${ln}`.trim();
});

const avatarText = computed(() => {
  const i = identity.value;
  const txt = i?.avatarText?.trim();
  if (txt) return txt;
  return initials(publicName.value);
});

const avatarUrl = computed(() => identity.value?.avatarUrl ?? null);

const schoolLine = computed(() => identity.value?.schoolLine ?? "");
const bio = computed(() => identity.value?.bio ?? "");
const city = computed(() => identity.value?.city ?? "");
const since = computed(() => identity.value?.sinceDate ?? "");

const showEmail = computed(() => !!identity.value?.showEmail);
const email = computed(() => identity.value?.email ?? auth.me?.email ?? "");

const showAge = computed(() => !!identity.value?.showAge);
const age = computed(() => identity.value?.age ?? null);

function formatFrMonthYear(iso: string | null | undefined) {
  if (!iso) return "";
  const s = String(iso);
  const yyyyMm = s.slice(0, 7);
  const [y, m] = yyyyMm.split("-");
  if (!y || !m) return yyyyMm;
  const date = new Date(Number(y), Number(m) - 1, 1);
  const out = new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(date);
  return out.charAt(0).toUpperCase() + out.slice(1);
}

const stats = computed(() => {
  const s = profile.value?.stats;
  if (!s) return [];
  return [
    { value: s.pointsTotal, label: "Points totaux" },
    { value: s.challengesDone, label: "Défis" },
    { value: s.ranking ? `#${s.ranking}` : "—", label: "Classement actuel" },
  ];
});

const progressionCurrent = computed(() => profile.value?.progression?.current ?? 0);
const progressionMax = computed(() => profile.value?.progression?.max ?? 1000);
const progressHint = computed(() => profile.value?.progression?.hint ?? "");

const badges = computed<Badge[]>(() =>
    (profile.value?.badges ?? []).map((b) => ({
      title: b.title,
      description: b.description,
      icon: b.icon,
      unlocked: b.unlocked,
    }))
);

const badgeCountLabel = computed(() => {
  const allCount = badges.value.length;
  const unlocked = badges.value.filter((b) => b.unlocked).length;
  return `${unlocked}/${allCount}`;
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
 * Follow / unfollow
 * (requires backend endpoints POST/DELETE /profile/:id/follow)
 */
const followBusy = ref(false);

async function toggleFollow() {
  if (!auth.token || !profile.value) return;
  const id = profile.value.identity.id;
  const currentlyFollowing = !!profile.value.follow?.isFollowing;

  followBusy.value = true;
  try {
    if (currentlyFollowing) {
      await apiRequest(`/profile/${encodeURIComponent(id)}/follow`, { method: "DELETE", token: auth.token });
    } else {
      await apiRequest(`/profile/${encodeURIComponent(id)}/follow`, { method: "POST", token: auth.token });
    }
    // refresh to get exact counters
    await fetchProfile();
  } catch (_e) {
    // optional: toast
  } finally {
    followBusy.value = false;
  }
}

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
  router.push({ name: "profile-edit" });
}
function backToSearch() {
  router.push({ name: "users" }); // adapte si ton nom de route diffère
}
</script>

<template>
  <!-- invité -->
  <div v-if="isGuest" class="guest-wall">
    <div class="guest-card">
      <h2>Profil indisponible en mode invité</h2>
      <p>Connecte-toi pour accéder aux profils.</p>
      <button class="primary" type="button" @click="goLogin">Se connecter</button>
    </div>
  </div>

  <!-- connecté -->
  <template v-else>
    <div v-if="loading" class="loading">Chargement du profil...</div>

    <div v-else-if="error" class="error-box">
      <div class="err-title">Impossible de charger le profil</div>
      <div class="err-msg">{{ error }}</div>
      <div style="display:flex; gap:10px; margin-top:12px;">
        <button class="retry" type="button" @click="fetchProfile">Réessayer</button>
        <button
            v-if="isOtherUser"
            class="retry"
            type="button"
            @click="backToSearch"
        >
          Retour recherche
        </button>
      </div>
    </div>

    <template v-else-if="profile">
      <ProfileHeroCard :showEdit="!isOtherUser" @edit="editProfile">
        <ProfileIdentity
            :name="publicName"
            :schoolLine="schoolLine"
            :bio="bio"
            :city="showAge && age ? `${city} · ${age} ans` : city"
            :since="formatFrMonthYear(since)"
            :avatarText="avatarText"
            :avatarUrl="avatarUrl"
        />

        <!-- follow counters + follow btn (other user only) -->
        <div style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; color: rgba(0,0,0,0.6); font-weight:900;">
          <div>👥 Abonnés : {{ profile.follow?.followersCount ?? 0 }}</div>
          <div>➡️ Abonnements : {{ profile.follow?.followingCount ?? 0 }}</div>

          <button
              v-if="isOtherUser"
              type="button"
              :disabled="followBusy"
              @click="toggleFollow"
              style="margin-left:auto; height:40px; padding:0 14px; border-radius:12px; border:none; cursor:pointer;
            background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
            color:white; font-weight:900;"
          >
            {{ profile.follow?.isFollowing ? "Ne plus suivre" : "Suivre" }}
          </button>
        </div>

        <ProfileStatsRow :stats="stats" />
      </ProfileHeroCard>

      <!-- Réseaux sociaux -->
      <SocialsCard
        v-if="profile.identity.socials?.show && (
          profile.identity.socials.instagramHandle ||
          profile.identity.socials.linkedinUrl ||
          profile.identity.socials.websiteUrl
        )"
        :instagramHandle="profile.identity.socials.instagramHandle"
        :linkedinUrl="profile.identity.socials.linkedinUrl"
        :websiteUrl="profile.identity.socials.websiteUrl"
      />

      <ProfileProgressCard rightLabel=" ">
        <LevelProgressBar :current="progressionCurrent" :max="progressionMax" :hint="progressHint" />
      </ProfileProgressCard>

      <BadgesCard :countLabel="badgeCountLabel">
        <template v-if="badges.length > 0">
          <BadgeGrid :badges="badges" />
        </template>
        <template v-else>
          <EmptyState icon="🏅" title="Aucun badge pour le moment" description="Complète ton premier défi pour débloquer un badge." />
        </template>
      </BadgesCard>

      <RecentActivityCard>
        <template v-if="activity.length > 0">
          <ActivityList :items="activity" />
        </template>
        <template v-else>
          <EmptyState icon="📭" title="Aucune activité récente" description="La participation apparaîtra ici." />
        </template>
      </RecentActivityCard>

      <ContactInfoCard>
        <ContactLine v-if="showEmail" icon="✉️" label="Email" :value="email" />
        <template v-else>
          <ContactLine icon="🔒" label="Email" value="Masqué" />
        </template>
      </ContactInfoCard>

      <!-- Actions: only for my profile -->
      <ProfileActionsCard v-if="!isOtherUser">
        <ProfileActionItem icon="👤" label="Modifier le profil" @click="editProfile" />
        <ProfileActionItem icon="🔗" label="Partager mon profil" @click="goShare" />
        <ProfileActionItem icon="⚙️" label="Paramètres" @click="goSettings" />
        <ProfileActionItem icon="⎋" label="Déconnexion" danger @click="logout" />
      </ProfileActionsCard>

      <!-- Back button (other user only) -->
      <div v-else style="margin-top:12px;">
        <button
            type="button"
            @click="backToSearch"
            style="width:100%; height:44px; border-radius:12px; border:1px solid rgba(0,0,0,0.12);
          background:#fff; cursor:pointer; font-weight:900;"
        >
          ← Retour à la recherche
        </button>
      </div>

    </template>

    <template v-else>
      <EmptyState
          icon="⚠️"
          title="Profil indisponible"
          description="Impossible de lire les données du profil."
          actionLabel="Réessayer"
          @action="fetchProfile"
      />
    </template>
  </template>
</template>

<style scoped>
  .guest-wall{ min-height: 70vh; display:grid; place-items:center; }
  .guest-card{ width: min(520px, 92vw); border-radius: 18px; padding: 18px; background: rgba(255,255,255,0.92);
    box-shadow: 0 20px 50px rgba(0,0,0,0.18); color: rgba(0,0,0,0.85); }
  .guest-card h2{ margin: 0 0 6px; }
  .guest-card p{ margin: 0 0 14px; color: rgba(0,0,0,0.6); }

  .primary{ width: 100%; height: 44px; border: none; border-radius: 12px; cursor: pointer;
    background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
    color: white; font-weight: 800; }

  .loading{ padding: 18px; color: rgba(0,0,0,0.65); font-weight: 700; }

  .error-box{ width: min(520px, 92vw); margin: 0 auto; border-radius: 18px; padding: 18px;
    background: rgba(255,255,255,0.92); box-shadow: 0 20px 50px rgba(0,0,0,0.18); color: rgba(0,0,0,0.85); }
  .err-title{ font-weight: 900; margin-bottom: 6px; }
  .err-msg{ color: rgba(0,0,0,0.6); margin-bottom: 12px; }
  .retry{ height: 42px; padding: 0 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.12);
    background: #fff; cursor:pointer; font-weight: 800; }
</style>
