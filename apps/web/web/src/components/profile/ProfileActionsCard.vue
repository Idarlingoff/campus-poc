<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";
</script>

<template>
  <BaseCard :padded="false">
    <div style="padding: 8px;">
      <slot />
    </div>
  </BaseCard>
</template>
