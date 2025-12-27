<script setup lang="ts">
defineProps<{
  icon?: string;
  label: string;
  value: string;
}>();
</script>

<template>
  <div class="line">
    <div class="left">
      <span class="ico">{{ icon ?? "✉️" }}</span>
      <span class="lbl">{{ label }}</span>
    </div>
    <div class="val">{{ value }}</div>
  </div>
</template>

<style scoped>
  .line{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 14px;
    background: rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.05);
  }
  .left{ display:flex; align-items:center; gap: 10px; }
  .ico{ width: 22px; text-align:center; }
  .lbl{ font-weight: 800; color: rgba(0,0,0,0.68); font-size: 13px; }
  .val{ color: rgba(0,0,0,0.62); font-weight: 700; font-size: 13px; }
</style>
