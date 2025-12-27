<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";

defineProps<{ rightLabel?: string }>();
</script>

<template>
  <BaseCard title="📈 Progression" :rightLabel="rightLabel">
    <slot />
  </BaseCard>
</template>
