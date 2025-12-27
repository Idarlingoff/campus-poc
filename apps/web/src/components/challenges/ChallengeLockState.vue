<script setup lang="ts">
import EmptyState from "@/components/ui/EmptyState.vue";

defineProps<{ message?: string }>();
</script>

<template>
  <EmptyState
      title="Défi verrouillé"
      :description="message ?? 'Complétez le défi précédent pour débloquer celui-ci.'"
  >
    <template #icon>🔒</template>
  </EmptyState>
</template>

<style scoped>
:deep(.empty){
  padding: 12px;
}
</style>
