<script setup lang="ts">
defineProps<{
  value: string | number;
  label: string;
}>();
</script>

<template>
  <div class="tile">
    <div class="value">{{ value }}</div>
    <div class="label">{{ label }}</div>
  </div>
</template>

<style scoped>
  .tile{
    border-radius: 14px;
    padding: 14px 12px;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.18);
    text-align:center;
  }
  .value{
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }
  .label{
    margin-top: 4px;
    font-size: 12px;
    opacity: 0.92;
    font-weight: 700;
  }
</style>
