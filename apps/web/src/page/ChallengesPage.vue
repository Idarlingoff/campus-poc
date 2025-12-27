<script setup lang="ts">
import { computed, ref } from "vue";

import ChallengesStatsRow from "@/components/challenges/ChallengesStatsRow.vue";
import CategoryFilterBar, { type ChallengeCategory } from "@/components/challenges/CategoryFilterBar.vue";
import ChallengeList from "@/components/challenges/ChallengeList.vue";
import type { ChallengeItem } from "@/components/challenges/ChallengeListItem.vue";

/**
 * MVP data (à remplacer par ton API plus tard)
 * Ajoute category pour filtrer côté UI.
 */
type ChallengeWithCategory = ChallengeItem & { category: ChallengeCategory };

const pointsTotal = ref("0/1500");
const completed = ref("0/10");
const streak = ref(0);

const category = ref<ChallengeCategory>("all");

const challenges = ref<ChallengeWithCategory[]>([
  {
    id: 1,
    title: "Cocktail le plus moche",
    description: "Créer le cocktail sans alcool le plus laid mais buvable. Photo obligatoire.",
    difficulty: "facile",
    time: "09:00",
    points: 100,
    durationMin: 120,
    remaining: "119:49",
    locked: false,
    category: "food",
  },
  {
    id: 2,
    title: "Look de soirée improbable",
    description: "Créer une tenue avec 3 vêtements + 1 accessoire inattendu. Photo finale demandée.",
    difficulty: "moyen",
    time: "10:00",
    points: 150,
    durationMin: 120,
    locked: true,
    category: "style",
  },
  {
    id: 3,
    title: "Mini-interview",
    description: "Interviewer un étudiant en 30 secondes sur sa journée. Vidéo ou audio.",
    difficulty: "facile",
    time: "11:30",
    points: 120,
    durationMin: 60,
    locked: true,
    category: "group",
  },
  {
    id: 4,
    title: "Photo du campus",
    description: "Prendre une photo originale d’un lieu du campus (angle créatif).",
    difficulty: "facile",
    time: "14:00",
    points: 80,
    durationMin: 45,
    locked: true,
    category: "photo",
  },
  {
    id: 5,
    title: "Création d’un sticker",
    description: "Créer un sticker fun lié à ton école et le partager.",
    difficulty: "moyen",
    time: "16:00",
    points: 160,
    durationMin: 90,
    locked: true,
    category: "creation",
  },
]);

const filtered = computed(() => {
  if (category.value === "all") return challenges.value;
  return challenges.value.filter((c) => c.category === category.value);
});

function openChallenge(id: number) {
  // MVP : plus tard -> router.push(`/app/challenges/${id}`) ou modal
  console.log("open challenge", id);
}
</script>

<template>
  <div class="page">
    <ChallengesStatsRow :points="pointsTotal" :completed="completed" :streak="streak" />

    <div class="spacer" />

    <CategoryFilterBar v-model="category" />

    <ChallengeList :items="filtered" @open="openChallenge" />
  </div>
</template>

<style scoped>
.page{
  display:flex;
  flex-direction:column;
  gap: 14px;
}

.spacer{ height: 2px; }
</style>
