<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: string | number;
  icon?: string;
  gradient?: "pink" | "green" | "red" | "custom";
  customGradient?: string;
}>();

const bg = (() => {
  if (props.gradient === "custom" && props.customGradient) return props.customGradient;
  if (props.gradient === "green") return "linear-gradient(135deg, rgba(45,90,70,0.95), rgba(55,110,85,0.95))";
  if (props.gradient === "red") return "linear-gradient(135deg, rgba(140,25,45,0.95), rgba(255,120,120,0.85))";
  return "linear-gradient(135deg, rgba(255,150,150,0.95), rgba(150,20,75,0.95))";
})();
</script>

<template>
  <div class="gcard" :style="{ background: bg }">
    <div class="left">
      <div v-if="icon" class="icon" aria-hidden="true">{{ icon }}</div>
      <div class="meta">
        <div class="title">{{ title }}</div>
        <div class="value">{{ value }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .gcard{
    border-radius: 18px;
    padding: 18px 18px;
    color: rgba(255,255,255,0.92);
    box-shadow: 0 18px 45px rgba(0,0,0,0.14);
    min-height: 84px;
    display:flex;
    align-items:center;
  }
  .left{ display:flex; align-items:center; gap: 14px; }
  .icon{
    width: 44px; height: 44px;
    border-radius: 14px;
    display:grid; place-items:center;
    background: rgba(255,255,255,0.16);
    border: 1px solid rgba(255,255,255,0.18);
  }
  .title{ font-weight: 800; font-size: 14px; opacity: 0.9; }
  .value{ font-weight: 900; font-size: 32px; letter-spacing: -0.02em; margin-top: 2px; }
</style>
