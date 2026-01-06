<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type LastNameVisibility = "FULL" | "INITIAL" | "HIDDEN";
type ProfileVisibility = "CAMPUS" | "PRIVATE";

/**
 * ✅ SEARCH API /users/search
 * On part sur une réponse "safe" :
 * - publicName déjà calculé côté back
 * - displayName dispo
 * - user_profile peut être absent => avatarText/city/schoolLine parfois vides
 */
type SearchItem = {
  id: string;
  displayName: string;
  publicName: string;
  avatarUrl: string | null;
  avatarText: string | null;
  city: string;
  schoolLine: string;

  // si tu as déjà ajouté ça côté back (optionnel)
  isFollowing?: boolean;
};

type SearchResponse = { items: SearchItem[] };

/**
 * DETAIL (tu gardes ton endpoint existant /profile/:id)
 */
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

    showEmail: boolean;
    showAge: boolean;
    age?: number | null;

    profileVisibility: ProfileVisibility;
  };
  follow?: {
    followersCount: number;
    followingCount: number;
    isFollowing: boolean;
  };
};

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const isGuest = computed(() => auth.isGuest || !auth.isAuthenticated);
const mode = computed<"search" | "detail">(() => (route.params.id ? "detail" : "search"));

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

function publicNameFromIdentity(i: {
  displayName: string;
  firstName?: string;
  lastName?: string;
  lastNameVisibility?: LastNameVisibility;
}) {
  const fn = (i.firstName ?? "").trim();
  const ln = (i.lastName ?? "").trim();
  if (!fn && !ln) return i.displayName;

  const vis = i.lastNameVisibility ?? "FULL";
  if (vis === "HIDDEN") return fn || i.displayName;
  if (vis === "INITIAL") return ln ? `${fn} ${ln[0]!.toUpperCase()}.` : (fn || i.displayName);
  return `${fn} ${ln}`.trim();
}

/**
 * SEARCH mode
 */
const q = ref<string>(String(route.query.q ?? ""));
const loadingSearch = ref(false);
const searchError = ref<string | null>(null);
const items = ref<SearchItem[]>([]);

let searchTimer: any = null;

async function runSearch() {
  if (!auth.token) return;

  const query = q.value.trim();

  if (query.length < 2) {
    items.value = [];
    return;
  }

  loadingSearch.value = true;
  searchError.value = null;

  try {
    // ✅ FIX : bonne route
    const resp = await apiRequest<SearchResponse>(`/users/search?q=${encodeURIComponent(query)}`, {
      token: auth.token,
    });

    items.value = resp.items ?? [];
  } catch (e: any) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      auth.logout();
      router.replace({ name: "login" });
      return;
    }
    searchError.value = e instanceof ApiError ? (e.body?.message ?? "Erreur recherche") : "Erreur recherche";
  } finally {
    loadingSearch.value = false;
  }
}

watch(
    q,
    () => {
      const query = q.value.trim();
      router.replace({ query: query ? { q: query } : {} });

      clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 250);
    },
    { immediate: false }
);

/**
 * DETAIL mode
 */
const loadingDetail = ref(false);
const detailError = ref<string | null>(null);
const profile = ref<ProfileResponse | null>(null);

async function fetchDetail() {
  if (!auth.token) return;
  const id = String(route.params.id ?? "");
  if (!id) return;

  loadingDetail.value = true;
  detailError.value = null;
  profile.value = null;

  try {
    profile.value = await apiRequest<ProfileResponse>(`/profile/${encodeURIComponent(id)}`, {
      token: auth.token,
    });
  } catch (e: any) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      if (e.status === 401) {
        auth.logout();
        router.replace({ name: "login" });
        return;
      }
      detailError.value = e.body?.message ?? "Profil privé";
      return;
    }
    detailError.value = e instanceof ApiError ? (e.body?.message ?? "Erreur profil") : "Erreur profil";
  } finally {
    loadingDetail.value = false;
  }
}

watch(
    () => route.params.id,
    () => {
      if (mode.value === "detail") fetchDetail();
    }
);

/**
 * Follow / Unfollow (si ton API existe déjà)
 */
const followBusy = ref(false);

async function toggleFollow(targetId: string, currentlyFollowing: boolean) {
  if (!auth.token) return;

  followBusy.value = true;
  try {
    if (currentlyFollowing) {
      await apiRequest(`/profile/${encodeURIComponent(targetId)}/follow`, { method: "DELETE", token: auth.token });
    } else {
      await apiRequest(`/profile/${encodeURIComponent(targetId)}/follow`, { method: "POST", token: auth.token });
    }

    // update search list state (si isFollowing existe)
    items.value = items.value.map((it) =>
        it.id === targetId ? { ...it, isFollowing: !currentlyFollowing } : it
    );

    // update detail (si ouvert)
    if (profile.value?.identity.id === targetId) {
      await fetchDetail();
    }
  } catch (_e) {
  } finally {
    followBusy.value = false;
  }
}

function openUser(id: string) {
  router.push({ name: "profile-user", params: { id } });
}

function backToSearch() {
  router.push({ name: "users", query: route.query });
}

onMounted(async () => {
  if (isGuest.value) return;

  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }
  if (!auth.isAuthenticated) return router.replace({ name: "login" });

  if (mode.value === "search") {
    if (q.value.trim().length >= 2) await runSearch();
  } else {
    await fetchDetail();
  }
});
</script>

<template>
  <div style="max-width: 860px; margin: 0 auto;">
    <div v-if="isGuest">
      <EmptyState
          icon="⛔"
          title="Indisponible en invité"
          description="Connecte-toi pour rechercher et suivre des profils."
          actionLabel="Se connecter"
          @action="router.push({ name: 'login' })"
      />
    </div>

    <template v-else>
      <!-- SEARCH MODE -->
      <template v-if="mode === 'search'">
        <BaseCard style="padding: 14px;">
          <h2 style="margin:0 0 6px;">Trouver des profils</h2>
          <p style="margin:0 0 12px; color: rgba(0,0,0,0.55); font-weight:700;">
            Recherche par nom, prénom, ville ou nom d’affichage.
          </p>

          <input
              v-model="q"
              type="text"
              placeholder="Ex: Lilian, Sarah, Paris..."
              style="height:42px; width:100%; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);"
          />

          <div style="margin-top:12px;">
            <div v-if="loadingSearch" style="color: rgba(0,0,0,0.6); font-weight:800;">Recherche...</div>

            <div v-else-if="searchError" style="color: rgba(210,30,60,0.95); font-weight:900;">
              {{ searchError }}
            </div>

            <template v-else>
              <div v-if="q.trim().length < 2" style="color: rgba(0,0,0,0.55); font-weight:700; margin-top:10px;">
                Tape au moins 2 caractères.
              </div>

              <template v-else-if="items.length === 0">
                <EmptyState icon="🔎" title="Aucun résultat" description="Essaie avec un autre nom." />
              </template>

              <template v-else>
                <div style="display:flex; flex-direction:column; gap:10px;">
                  <div
                      v-for="u in items"
                      :key="u.id"
                      style="display:flex; gap:12px; align-items:center; padding:12px;
                    border:1px solid rgba(0,0,0,0.08); border-radius:14px; background:#fff; cursor:pointer;"
                      @click="openUser(u.id)"
                  >
                    <div style="width:46px; height:46px; border-radius:14px; overflow:hidden; background: rgba(0,0,0,0.06); display:grid; place-items:center;">
                      <img v-if="u.avatarUrl" :src="u.avatarUrl" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
                      <div v-else style="font-weight:900; color: rgba(0,0,0,0.75);">
                        {{ (u.avatarText ?? '').trim() || initials(u.publicName || u.displayName) }}
                      </div>
                    </div>

                    <div style="flex:1; min-width:0;">
                      <div style="font-weight:900; color: rgba(0,0,0,0.86); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                        {{ u.publicName || u.displayName }}
                      </div>
                      <div style="color: rgba(0,0,0,0.55); font-weight:800; font-size:12.5px;">
                        {{ u.schoolLine }} <span v-if="u.city">· {{ u.city }}</span>
                      </div>
                    </div>

                    <!-- bouton follow (optionnel si backend renvoie isFollowing) -->
                    <button
                        v-if="u.isFollowing !== undefined"
                        type="button"
                        :disabled="followBusy || u.id === auth.me?.id"
                        @click.stop="toggleFollow(u.id, !!u.isFollowing)"
                        style="height:38px; padding:0 12px; border-radius:12px; border:1px solid rgba(0,0,0,0.12);
                      background:#fff; cursor:pointer; font-weight:900;"
                    >
                      {{ u.id === auth.me?.id ? "Moi" : (u.isFollowing ? "Suivi ✓" : "Suivre") }}
                    </button>
                  </div>
                </div>
              </template>
            </template>
          </div>
        </BaseCard>
      </template>

      <!-- DETAIL MODE -->
      <template v-else>
        <BaseCard style="padding: 14px;">
          <button
              type="button"
              @click="backToSearch"
              style="height:36px; padding:0 10px; border-radius:10px; border:1px solid rgba(0,0,0,0.12);
            background:#fff; cursor:pointer; font-weight:900; margin-bottom:10px;"
          >
            ← Retour à la recherche
          </button>

          <div v-if="loadingDetail" style="color: rgba(0,0,0,0.6); font-weight:800;">Chargement du profil...</div>

          <div v-else-if="detailError" style="color: rgba(210,30,60,0.95); font-weight:900;">
            {{ detailError }}
          </div>

          <template v-else-if="profile">
            <div style="display:flex; gap:12px; align-items:center;">
              <div style="width:72px; height:72px; border-radius:18px; overflow:hidden; background: rgba(0,0,0,0.06); display:grid; place-items:center;">
                <img v-if="profile.identity.avatarUrl" :src="profile.identity.avatarUrl" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
                <div v-else style="font-weight:900; font-size: 22px; color: rgba(0,0,0,0.75);">
                  {{ (profile.identity.avatarText || '').trim() || initials(publicNameFromIdentity(profile.identity)) }}
                </div>
              </div>

              <div style="flex:1;">
                <div style="font-weight: 900; font-size:18px;">
                  {{ publicNameFromIdentity(profile.identity) }}
                </div>
                <div style="color: rgba(0,0,0,0.55); font-weight:800;">
                  {{ profile.identity.schoolLine }}
                  <span v-if="profile.identity.city"> · {{ profile.identity.city }}</span>
                  <span v-if="profile.identity.showAge && profile.identity.age"> · {{ profile.identity.age }} ans</span>
                </div>
              </div>

              <button
                  v-if="profile.identity.id !== auth.me?.id && profile.follow"
                  type="button"
                  :disabled="followBusy"
                  @click="toggleFollow(profile.identity.id, !!profile.follow.isFollowing)"
                  style="height:42px; padding:0 14px; border-radius:12px; border:none; cursor:pointer;
                background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
                color:white; font-weight:900;"
              >
                {{ profile.follow.isFollowing ? "Ne plus suivre" : "Suivre" }}
              </button>
            </div>

            <div v-if="profile.follow" style="margin-top:12px; display:flex; gap:10px; flex-wrap:wrap; color: rgba(0,0,0,0.6); font-weight:900;">
              <div>👥 Abonnés : {{ profile.follow.followersCount }}</div>
              <div>➡️ Abonnements : {{ profile.follow.followingCount }}</div>
            </div>

            <div v-if="profile.identity.bio" style="margin-top:12px; color: rgba(0,0,0,0.72); font-weight:800;">
              {{ profile.identity.bio }}
            </div>
          </template>

          <template v-else>
            <EmptyState icon="⚠️" title="Profil indisponible" description="Impossible de lire ce profil." />
          </template>
        </BaseCard>
      </template>
    </template>
  </div>
</template>
