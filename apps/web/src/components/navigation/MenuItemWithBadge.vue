<template>
  <button class="item" type="button" @click="$emit('click')">
    <span class="icon" aria-hidden="true">{{ icon }}</span>
    <span class="label">{{ label }}</span>
    <span class="badge">{{ badge }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ icon: string; label: string; badge: string }>();
defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
  .item{
    display:flex;
    align-items:center;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(0,0,0,0.06);
    background: rgba(0,0,0,0.02);
    cursor:pointer;
    text-align:left;
  }
  .item:hover{ background: rgba(0,0,0,0.035); }
  .icon{ width: 26px; text-align:center; }
  .label{ flex:1; font-weight: 600; color: rgba(0,0,0,0.78); }
  .badge{
    padding: 4px 10px;
    border-radius: 999px;
    background: #ff7b8d;
    color: white;
    font-weight: 700;
    font-size: 12px;
  }
</style>
