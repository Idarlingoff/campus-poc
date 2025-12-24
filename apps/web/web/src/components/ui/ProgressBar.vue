<script setup lang="ts">
const props = withDefaults(defineProps<{
  value: number;
  max: number;
  showLabel?: boolean;
}>(), { showLabel: true });

const pct = Math.min(100, Math.max(0, (props.value / props.max) * 100));
</script>

<template>
  <div class="wrap">
    <div v-if="showLabel" class="row">
      <span class="l">Progression</span>
      <span class="r">{{ value }} / {{ max }}</span>
    </div>

    <div class="bar">
      <div class="fill" :style="{ width: pct + '%' }" />
    </div>
  </div>
</template>

<style scoped>
  .wrap{ display:flex; flex-direction:column; gap: 8px; }
  .row{
    display:flex;
    justify-content:space-between;
    font-weight: 900;
    font-size: 12px;
    color: rgba(0,0,0,0.55);
  }
  .bar{
    height: 10px;
    border-radius: 999px;
    background: rgba(0,0,0,0.10);
    overflow:hidden;
  }
  .fill{
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(255,150,140,0.95), rgba(255,90,140,0.95));
  }
</style>
