<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon?: string;
  unlocked: boolean;
}>();
</script>

<template>
  <div class="tile" :class="{ locked: !unlocked }">
    <div class="icon">{{ icon ?? "🏅" }}</div>
    <div class="t">{{ title }}</div>
    <div class="d">{{ description }}</div>
  </div>
</template>

<style scoped>
  .tile{
    border-radius: 16px;
    padding: 16px 14px;
    background: rgba(255,255,255,0.88);
    border: 2px solid rgba(255,120,140,0.55);
    box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    text-align:center;
  }
  .icon{ font-size: 28px; margin-bottom: 8px; }
  .t{ font-weight: 900; color: rgba(0,0,0,0.78); }
  .d{ margin-top: 4px; font-size: 12px; color: rgba(0,0,0,0.55); }

  .locked{
    opacity: 0.45;
    border-color: rgba(0,0,0,0.08);
  }
</style>
