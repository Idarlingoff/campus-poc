<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";

defineProps<{ countLabel?: string }>();
</script>

<template>
  <BaseCard title="🏅 Badges" :rightLabel="countLabel">
    <slot />
  </BaseCard>
</template>
