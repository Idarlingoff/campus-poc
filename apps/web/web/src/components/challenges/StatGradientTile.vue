<script setup lang="ts">
import GradientCard from "@/components/ui/GradientCard.vue";

defineProps<{
  title: string;
  value: string | number;
  icon?: string;
  variant?: "pink" | "green" | "red";
}>();
</script>

<template>
  <GradientCard
      :title="title"
      :value="value"
      :icon="icon"
      :gradient="variant ?? 'pink'"
  />
</template>
