<script setup lang="ts">
import ActivityListItem, { type ActivityItem } from "./ActivityListItem.vue";

defineProps<{ items: ActivityItem[] }>();
</script>

<template>
  <div class="list">
    <ActivityListItem v-for="(it, idx) in items" :key="idx" :item="it" />
  </div>
</template>

<style scoped>
  .list{
    display:flex;
    flex-direction:column;
    gap: 10px;
  }
</style>
