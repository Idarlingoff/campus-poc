<script setup lang="ts">
import EmptyState from "@/components/ui/EmptyState.vue";
import ChallengeListItem, { type ChallengeItem } from "./ChallengeListItem.vue";

defineProps<{ items: ChallengeItem[] }>();
defineEmits<{ (e: "open", id: number): void }>();
</script>

<template>
  <div class="list">
    <EmptyState
        v-if="items.length === 0"
        title="Aucun défi"
        description="Aucun défi ne correspond à ce filtre."
    >
      <template #icon>🎯</template>
    </EmptyState>

    <ChallengeListItem
        v-for="it in items"
        :key="it.id"
        :item="it"
        @open="$emit('open', $event)"
    />
  </div>
</template>

<style scoped>
.list{
  margin-top: 14px;
  display:flex;
  flex-direction:column;
  gap: 14px;
}
</style>
