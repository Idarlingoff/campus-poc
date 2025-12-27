<script setup lang="ts">
import ProfileStatTile from "./ProfileStatTile.vue";

defineProps<{
  stats: Array<{ value: string | number; label: string }>;
}>();
</script>

<template>
  <div class="row">
    <ProfileStatTile
        v-for="(s, idx) in stats"
        :key="idx"
        :value="s.value"
        :label="s.label"
    />
  </div>
</template>

<style scoped>
  .row{
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
    margin-top: 18px;
  }

  @media (max-width: 720px){
    .row{ grid-template-columns: 1fr; }
  }
</style>
