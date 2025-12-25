<template>
  <button class="card" type="button" @click="$emit('click')">
    <div class="icon" aria-hidden="true">🔗</div>
    <div class="txt">
      <div class="title">{{ title }}</div>
      <div class="sub">{{ subtitle }}</div>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string }>();
defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
  .card{
    display:flex;
    align-items:center;
    gap: 12px;
    padding: 14px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,120,140,0.28);
    background: rgba(255,120,140,0.08);
    cursor:pointer;
    text-align:left;
  }
  .icon{
    width: 34px; height: 34px; border-radius: 12px;
    display:grid; place-items:center;
    background: rgba(255,120,140,0.16);
  }
  .title{ font-weight: 800; color: rgba(0,0,0,0.82); }
  .sub{ font-size: 12px; color: rgba(0,0,0,0.55); margin-top: 2px; }
</style>
