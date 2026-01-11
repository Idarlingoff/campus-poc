<script setup lang="ts">
import { RouterView } from 'vue-router'
import FlashToast from "@/components/ui/FlashToast.vue";
</script>

<template>
  <RouterView /><FlashToast />
</template>

<style>
html, body, #app {
  margin: 0;
  padding: 0;
  min-height: 100%;
}
</style>
