<script setup lang="ts">
import TagPill from "@/components/ui/TagPill.vue";

const props = defineProps<{ label: string }>();

const tone = props.label.toLowerCase().includes("fac")
    ? "success"
    : props.label.toLowerCase().includes("moy")
        ? "warning"
        : "neutral";
</script>

<template>
  <TagPill :label="label" :tone="tone" />
</template>
