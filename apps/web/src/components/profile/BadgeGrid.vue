<script setup lang="ts">
import BadgeTile from "./BadgeTile.vue";

export type Badge = {
  title: string;
  description: string;
  icon?: string;
  unlocked: boolean;
};

defineProps<{ badges: Badge[] }>();
</script>

<template>
  <div class="grid">
    <BadgeTile
        v-for="b in badges"
        :key="b.title"
        :title="b.title"
        :description="b.description"
        :icon="b.icon"
        :unlocked="b.unlocked"
    />
  </div>
</template>

<style scoped>
  .grid{
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }

  @media (max-width: 920px){
    .grid{ grid-template-columns: repeat(2, 1fr); }
  }
  @media (max-width: 620px){
    .grid{ grid-template-columns: 1fr; }
  }
</style>
