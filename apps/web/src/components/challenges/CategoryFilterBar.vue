<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";
import CategoryChip from "./CategoryChip.vue";

export type ChallengeCategory = "all" | "creation" | "food" | "photo" | "group" | "style";

const props = defineProps<{ modelValue: ChallengeCategory }>();
const emit = defineEmits<{ (e: "update:modelValue", v: ChallengeCategory): void }>();

const items: Array<{ key: ChallengeCategory; label: string; icon: string }> = [
  { key: "all", label: "Tous", icon: "🎯" },
  { key: "creation", label: "Création", icon: "🎨" },
  { key: "food", label: "Nourriture", icon: "🍕" },
  { key: "photo", label: "Photo", icon: "📸" },
  { key: "group", label: "Groupe", icon: "👥" },
  { key: "style", label: "Style", icon: "🧪" },
];
</script>

<template>
  <BaseCard title="Filtrer par catégorie">
    <div class="chips">
      <CategoryChip
          v-for="it in items"
          :key="it.key"
          :label="it.label"
          :active="props.modelValue === it.key"
          @click="emit('update:modelValue', it.key)"
      >
        <template #icon>{{ it.icon }}</template>
      </CategoryChip>
    </div>
  </BaseCard>
</template>

<style scoped>
.chips{
  display:flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
