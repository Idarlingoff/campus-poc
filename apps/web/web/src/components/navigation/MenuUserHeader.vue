<template>
  <div class="user">
    <div class="avatar" aria-hidden="true">👤</div>
    <div class="meta">
      <div class="name">{{ name }}</div>
      <div class="email">{{ email }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ name: string; email: string }>();
</script>

<style scoped>
  .user{
    display:flex;
    align-items:center;
    gap: 12px;
    padding: 6px 2px 14px;
  }
  .avatar{
    width: 44px;
    height: 44px;
    border-radius: 999px;
    display:grid;
    place-items:center;
    background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
    color: white;
    font-size: 18px;
  }
  .name{ font-weight: 700; color: rgba(0,0,0,0.88); }
  .email{ font-size: 13px; color: rgba(0,0,0,0.55); margin-top: 2px; }
</style>
