<script setup lang="ts">
defineProps<{
  title: string;
  icon?: string;
  actionLabel?: string;
}>();

defineEmits<{ (e: "action"): void }>();
</script>

<template>
  <div class="section-header">
    <div class="left">
      <span v-if="icon" class="icon">{{ icon }}</span>
      <h2 class="title">{{ title }}</h2>
    </div>

    <button
      v-if="actionLabel"
      class="action"
      type="button"
      @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.icon {
  font-size: 18px;
}

.title {
  margin: 0;
  font-size: 17px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.8);
}

.action {
  padding: 6px 12px;
  border: none;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: background 0.2s ease;
}

.action:hover {
  background: rgba(0, 0, 0, 0.08);
}
</style>
