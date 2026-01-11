<script setup lang="ts">
import { useFlashStore } from "@/stores/flash";
const flash = useFlashStore();
</script>

<template>
  <div v-if="flash.visible && flash.message" class="toast" :class="flash.type">
    <span>{{ flash.message }}</span>
    <button class="x" @click="flash.hide()">×</button>
  </div>
</template>

<style scoped>
.toast{
  position: fixed;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  width: min(520px, calc(100% - 24px));
  padding: 12px 14px;
  border-radius: 14px;
  box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  display:flex;
  align-items:center;
  justify-content: space-between;
  gap: 12px;
  z-index: 80;
  background: white;
  border: 1px solid rgba(0,0,0,0.08);
}
.toast.success { border-color: rgba(53,92,73,0.35); }
.toast.info { border-color: rgba(0,0,0,0.12); }
.toast.error { border-color: rgba(200,30,30,0.35); }
.x{ border:none; background: transparent; font-size: 18px; cursor: pointer; opacity: .6; }
</style>
