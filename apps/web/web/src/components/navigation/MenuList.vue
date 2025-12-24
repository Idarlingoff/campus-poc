<template>
  <div class="list">
    <slot />
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .list{
    display:flex;
    flex-direction:column;
    gap: 10px;
  }
</style>
