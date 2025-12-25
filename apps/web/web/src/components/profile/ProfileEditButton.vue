<script setup lang="ts">
defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button class="btn" type="button" @click="$emit('click')" aria-label="Modifier">
    ✎
  </button>
</template>

<style scoped>
  .btn{
    width: 38px;
    height: 38px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(0,0,0,0.18);
    color: rgba(255,255,255,0.9);
    cursor:pointer;
  }
  .btn:hover{ background: rgba(0,0,0,0.25); }
</style>
