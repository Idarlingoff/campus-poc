<script setup lang="ts">
defineProps<{
  label: string;
  active?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button class="chip" :class="{ active }" type="button" @click="$emit('click')">
    <span class="ico"><slot name="icon" /></span>
    <span class="lbl">{{ label }}</span>
  </button>
</template>

<style scoped>
  .chip{
    display:inline-flex;
    align-items:center;
    gap: 8px;
    height: 38px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid rgba(0,0,0,0.06);
    background: rgba(0,0,0,0.03);
    cursor:pointer;
    font-weight: 800;
    color: rgba(0,0,0,0.70);
  }
  .chip:hover{ background: rgba(0,0,0,0.05); }
  .ico{ opacity: 0.9; }
  .active{
    background: linear-gradient(135deg, rgba(255,150,150,0.95), rgba(150,20,75,0.95));
    border-color: rgba(150,20,75,0.15);
    color: rgba(255,255,255,0.92);
  }
</style>
