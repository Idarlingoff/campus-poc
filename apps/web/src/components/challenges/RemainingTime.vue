<script setup lang="ts">
defineProps<{ label?: string; value: string }>();
</script>

<template>
  <div class="remain">
    <span aria-hidden="true">⏰</span>
    <span class="t">{{ label ?? "Temps restant" }} :</span>
    <span class="v">{{ value }}</span>
  </div>
</template>

<style scoped>
.remain{
  margin-top: 10px;
  display:flex;
  align-items:center;
  gap: 8px;
  font-weight: 900;
  color: rgba(150,20,75,0.95);
}
</style>
