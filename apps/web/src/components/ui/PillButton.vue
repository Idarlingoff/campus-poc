<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  selected?: boolean;
  disabled?: boolean;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <button
      class="pill"
      :class="{ selected, disabled }"
      type="button"
      :disabled="disabled"
      @click="$emit('click')"
  >
    <div class="icon">
      <slot name="icon" />
    </div>

    <div class="txt">
      <div class="t">{{ title }}</div>
      <div v-if="description" class="d">{{ description }}</div>
    </div>

    <div class="right">
      <slot name="right" />
    </div>
  </button>
</template>

<style scoped>
  .pill{
    width: min(680px, 92vw);
    display:flex;
    align-items:center;
    gap: 14px;
    padding: 16px 16px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.22);
    background: rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.92);
    cursor:pointer;
    text-align:left;
    backdrop-filter: blur(8px);
  }
  .pill:hover{ background: rgba(255,255,255,0.18); }

  .icon{
    width: 46px; height: 46px;
    border-radius: 14px;
    display:grid; place-items:center;
    background: rgba(0,0,0,0.15);
    border: 1px solid rgba(255,255,255,0.18);
  }

  .t{ font-weight: 900; font-size: 16px; }
  .d{ margin-top: 2px; font-size: 13px; opacity: 0.86; }
  .right{ margin-left:auto; }

  .selected{
    background: rgba(255,255,255,0.92);
    color: rgba(0,0,0,0.82);
    border-color: rgba(255,255,255,0.55);
  }
  .selected .icon{
    background: rgba(255,120,140,0.18);
    border-color: rgba(255,120,140,0.30);
  }

  .disabled{
    opacity: 0.55;
    cursor:not-allowed;
  }
</style>
