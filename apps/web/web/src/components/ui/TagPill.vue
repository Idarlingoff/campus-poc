<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  tone?: "success" | "warning" | "neutral";
}>(), { tone: "neutral" });
</script>

<template>
  <span class="tag" :class="tone">{{ label }}</span>
</template>

<style scoped>
  .tag{
    display:inline-flex;
    align-items:center;
    justify-content:center;
    height: 28px;
    padding: 0 12px;
    border-radius: 999px;
    font-weight: 900;
    font-size: 12px;
    text-transform: lowercase;
  }
  .success{ background: rgba(70,190,110,0.16); color: rgba(35,140,75,0.95); }
  .warning{ background: rgba(255,170,60,0.18); color: rgba(200,110,20,0.95); }
  .neutral{ background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.65); }
</style>
