<template>
  <nav class="bottom">
    <button
        v-for="t in visibleTabs"
        :key="t.key"
        class="item"
        :class="{ active: activeKey === t.key }"
        type="button"
        @click="$emit('go', t.key)"
    >
      <div class="ico">{{ t.icon }}</div>
      <div class="lbl">{{ t.label }}</div>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";

export type TabKey = "feed" | "challenges" | "propose" | "activity" | "search";

export type BottomTab = {
  key: TabKey;
  label: string;
  icon: string;
};

const props = defineProps<{
  activeKey: TabKey;
  tabs: BottomTab[];
  isGuest?: boolean;
}>();

defineEmits<{
  (e: "go", key: TabKey): void;
}>();

const visibleTabs = computed(() => {
  if (props.isGuest) return props.tabs.filter((t) => t.key !== "search");
  return props.tabs;
});
</script>

<style scoped>
  .bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 78px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(0, 0, 0, 0.06);
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 50;
  }
  .item {
    width: 110px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    cursor: pointer;
    color: rgba(30, 30, 30, 0.7);
  }
  .item .ico {
    font-size: 22px;
  }
  .item .lbl {
    font-size: 12px;
  }
  .item.active {
    color: #d43b6e;
  }
</style>
