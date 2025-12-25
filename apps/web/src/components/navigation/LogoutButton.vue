<template>
  <button class="logout" type="button" @click="$emit('click')">
    <span class="ico" aria-hidden="true">⎋</span>
    <span>Déconnexion</span>
  </button>
</template>

<script setup lang="ts">
defineEmits<{ (e: "click"): void }>();
</script>

<style scoped>
  .logout{
    width: 100%;
    display:flex;
    align-items:center;
    gap: 10px;
    padding: 12px 10px;
    border-radius: 14px;
    border: 1px solid rgba(220, 30, 60, 0.25);
    background: rgba(220, 30, 60, 0.06);
    color: rgba(220, 30, 60, 0.95);
    font-weight: 800;
    cursor:pointer;
  }
  .logout:hover{ background: rgba(220, 30, 60, 0.09); }
  .ico{ font-size: 18px; }
</style>
