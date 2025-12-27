<script setup lang="ts">
const props = defineProps<{
  current: number;
  max: number;
  hint?: string;
}>();

const percent = Math.min(100, Math.max(0, (props.current / props.max) * 100));
</script>

<template>
  <div class="wrap">
    <div class="row">
      <div class="label">Niveau actuel</div>
      <div class="value">{{ current }} / {{ max }} pts</div>
    </div>

    <div class="bar">
      <div class="fill" :style="{ width: percent + '%' }" />
    </div>

    <div v-if="hint" class="hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
  .wrap{ display:flex; flex-direction:column; gap: 8px; }

  .row{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 10px;
  }
  .label{ font-size: 12px; font-weight: 800; color: rgba(0,0,0,0.55); }
  .value{ font-size: 12px; font-weight: 900; color: rgba(0,0,0,0.55); }

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

  .hint{
    font-size: 12px;
    color: rgba(0,0,0,0.55);
  }
</style>
