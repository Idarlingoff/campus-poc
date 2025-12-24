<script setup lang="ts">
withDefaults(defineProps<{
  ariaLabel: string;
  variant?: "solid" | "ghost";
  size?: "sm" | "md";
  disabled?: boolean;
}>(), {
  variant: "ghost",
  size: "md",
  disabled: false,
});

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
      class="btn"
      :class="[variant, size]"
      type="button"
      :aria-label="ariaLabel"
      :disabled="disabled"
      @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<style scoped>
  .btn{
    border-radius: 14px;
    border: 1px solid transparent;
    cursor: pointer;
    display:inline-grid;
    place-items:center;
    color: inherit;
  }
  .md{ width: 44px; height: 44px; }
  .sm{ width: 38px; height: 38px; }

  .ghost{
    background: rgba(255,255,255,0.10);
    border-color: rgba(255,255,255,0.18);
  }
  .ghost:hover{ background: rgba(255,255,255,0.14); }

  .solid{
    background: rgba(0,0,0,0.10);
    border-color: rgba(0,0,0,0.10);
  }
  .solid:hover{ background: rgba(0,0,0,0.14); }

  .btn:disabled{
    opacity: 0.5;
    cursor:not-allowed;
  }
</style>
