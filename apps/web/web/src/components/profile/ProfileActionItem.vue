<script setup lang="ts">
defineProps<{
  icon?: string;
  label: string;
  danger?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button class="item" :class="{ danger }" type="button" @click="$emit('click')">
    <span class="ico" aria-hidden="true">{{ icon ?? "›" }}</span>
    <span class="lbl">{{ label }}</span>
    <span class="chev" aria-hidden="true">›</span>
  </button>
</template>

<style scoped>
  .item{
    width: 100%;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 10px;
    padding: 14px 12px;
    border-radius: 14px;
    border: none;
    background: transparent;
    cursor:pointer;
    text-align:left;
  }
  .item:hover{ background: rgba(0,0,0,0.03); }
  .ico{ width: 24px; text-align:center; opacity: 0.8; }
  .lbl{ flex:1; font-weight: 800; color: rgba(0,0,0,0.78); }
  .chev{ color: rgba(0,0,0,0.35); font-size: 20px; }
  .danger .lbl{ color: rgba(220,30,60,0.95); }
</style>
