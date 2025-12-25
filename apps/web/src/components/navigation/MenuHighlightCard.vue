<template>
  <button class="card" type="button" @click="$emit('click')">
    <div class="left">
      <div class="icon" aria-hidden="true">🧳</div>
      <div class="txt">
        <div class="title">{{ title }}</div>
        <div class="sub">{{ subtitle }}</div>
      </div>
    </div>
    <span class="pill">{{ badge }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle: string; badge: string }>();
defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
  .card{
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 14px 12px;
    border-radius: 14px;
    border: 2px solid rgba(170, 30, 85, 0.55);
    background: #fff;
    cursor:pointer;
  }
  .left{ display:flex; align-items:center; gap: 12px; }
  .icon{
    width: 34px; height: 34px; border-radius: 12px;
    display:grid; place-items:center;
    background: rgba(170, 30, 85, 0.08);
  }
  .title{ font-weight: 800; color: rgba(0,0,0,0.84); }
  .sub{ font-size: 12px; color: rgba(170, 30, 85, 0.75); margin-top: 2px; }
  .pill{
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(170, 30, 85, 0.92);
    color: white;
    font-weight: 800;
    font-size: 12px;
  }
</style>
