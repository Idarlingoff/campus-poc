<script setup lang="ts">
defineProps<{
  time?: string;
  points?: number;
  durationMin?: number;
}>();
</script>

<template>
  <div class="meta">
    <div v-if="time" class="item">🕘 <span>{{ time }}</span></div>
    <div v-if="typeof points === 'number'" class="item">🏆 <span>{{ points }} points</span></div>
    <div v-if="typeof durationMin === 'number'" class="item">⏱️ <span>{{ durationMin }} min</span></div>
  </div>
</template>

<style scoped>
.meta{
  display:flex;
  gap: 16px;
  flex-wrap: wrap;
  color: rgba(0,0,0,0.55);
  font-weight: 800;
  font-size: 12.5px;
}
.item{ display:inline-flex; align-items:center; gap: 6px; }
</style>
