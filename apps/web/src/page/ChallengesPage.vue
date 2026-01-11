<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import ChallengesStatsRow from "@/components/challenges/ChallengesStatsRow.vue";
import CategoryFilterBar, { type ChallengeCategory } from "@/components/challenges/CategoryFilterBar.vue";
import ChallengeList from "@/components/challenges/ChallengeList.vue";
import type { ChallengeItem } from "@/components/challenges/ChallengeListItem.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type ApiChallenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration_min: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
};

type ProfileMe = {
  stats?: {
    pointsTotal?: number;
    challengesDone?: number;
    ranking?: string;
  };
};

type ChallengeWithCategory = ChallengeItem & {
  category: ChallengeCategory;
  realId: string;
};

const auth = useAuthStore();
const router = useRouter();

const loading = ref(false);
const error = ref<string | null>(null);

const category = ref<ChallengeCategory>("all");

const pointsTotal = ref("0/1500");
const completed = ref("0/0");
const streak = ref(0);

const challenges = ref<ChallengeWithCategory[]>([]);

function mapCategoryToFront(cat: string): ChallengeCategory {
  const v = (cat ?? "").toLowerCase();
  if (v === "creation") return "creation";
  if (v === "nourriture" || v === "food") return "food";
  if (v === "photo") return "photo";
  if (v === "groupe" || v === "group") return "group";
  if (v === "style") return "style";
  return "all";
}

function mapDifficultyLabel(d: string): string {
  const v = (d ?? "").toLowerCase();
  if (v === "facile") return "facile";
  if (v === "moyen") return "moyen";
  if (v === "difficile") return "difficile";
  return "moyen";
}

async function loadChallenges() {
  loading.value = true;
  error.value = null;

  try {
    const token = auth.token ?? undefined;

    const apiItems = await apiRequest<ApiChallenge[]>("/challenges", {
      method: "GET",
      token,
    });

    challenges.value = apiItems.map((c, idx) => ({
      id: idx + 1,
      realId: c.id,

      title: c.title,
      description: c.description,

      difficulty: mapDifficultyLabel(c.difficulty),
      points: c.points,
      durationMin: c.duration_min,

      time: undefined,
      remaining: undefined,
      locked: false,

      category: mapCategoryToFront(c.category),
    }));

    completed.value = `0/${challenges.value.length}`;
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Impossible de charger les défis.";
    else error.value = "Impossible de charger les défis.";
  } finally {
    loading.value = false;
  }
}

async function loadStats() {
  try {
    const token = auth.token ?? undefined;
    const me = await apiRequest<ProfileMe>("/profile/me", { token });

    const pts = me?.stats?.pointsTotal ?? 0;
    const done = me?.stats?.challengesDone ?? 0;
    const max = challenges.value.length;

    pointsTotal.value = `${pts}/1500`;
    completed.value = `${done}/${max}`;
    streak.value = 0;
  } catch {
  }
}

const filtered = computed(() => {
  if (category.value === "all") return challenges.value;
  return challenges.value.filter((c) => c.category === category.value);
});

function openChallenge(uiId: number) {
  const item = challenges.value.find((c) => c.id === uiId);
  if (!item) return;

  router.push({ name: "challenge-detail", params: { id: item.realId } });
}

function goLogin() {
  router.push({ name: "login" });
}

watch(
    () => auth.token,
    async () => {
      await loadChallenges();
      await loadStats();
    }
);

onMounted(async () => {
  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }

  await loadChallenges();
  await loadStats();
});
</script>

<template>
  <div class="page">
    <ChallengesStatsRow :points="pointsTotal" :completed="completed" :streak="streak" />

    <div class="spacer" />

    <CategoryFilterBar v-model="category" />

    <!-- Loading -->
    <div v-if="loading" class="state">
      <EmptyState title="Chargement des défis..." description="Patiente une seconde." />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="state">
      <EmptyState
          title="Impossible de charger les défis"
          :description="error"
          actionLabel="Réessayer"
          @action="loadChallenges"
      >
        <template #icon>⚠️</template>
      </EmptyState>

      <!-- si l'erreur est un 401/403, ça veut dire "pas connecté / pas de droits" -->
      <div style="margin-top: 12px" v-if="!auth.isAuthenticated">
        <EmptyState
            title="Connexion requise"
            description="Connecte-toi pour accéder aux défis."
            actionLabel="Se connecter"
            @action="goLogin"
        >
          <template #icon>🔒</template>
        </EmptyState>
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="filtered.length === 0" class="state">
      <EmptyState
          title="Aucun défi dans cette catégorie"
          description="Essaie une autre catégorie ou reviens plus tard."
      >
        <template #icon>🗂️</template>
      </EmptyState>
    </div>

    <!-- List -->
    <ChallengeList v-else :items="filtered" @open="openChallenge" />
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.spacer {
  height: 2px;
}
.state {
  margin-top: 6px;
}
</style>
