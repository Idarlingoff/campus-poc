<script setup lang="ts">
import Chip from "@/components/ui/Chip.vue";

defineProps<{
  label: string;
  active?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <Chip :label="label" :active="active" @click="$emit('click')">
    <template #icon><slot name="icon" /></template>
  </Chip>
</template>
