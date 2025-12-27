<template>
  <button
      type="button"
      class="card"
      :class="{ selected, disabled }"
      :disabled="disabled"
      @click="$emit('select')"
  >
    <div class="icon" :class="{ selected }" aria-hidden="true">
      <slot name="icon">
        <!-- fallback icon -->
        <span>👤</span>
      </slot>
    </div>

    <div class="content">
      <div class="name">{{ title }}</div>
      <div class="desc">{{ description }}</div>
    </div>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  selected?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  (e: "select"): void
}>();
</script>

<style scoped>
  .card{
    width: min(640px, 92vw);
    display:flex;
    align-items:center;
    gap:16px;
    padding: 18px 18px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.10);
    color: rgba(255,255,255,0.92);
    cursor:pointer;
    transition: transform .08s ease, background .12s ease, border-color .12s ease;
    text-align:left;
  }
  .card:hover{
    transform: translateY(-1px);
    background: rgba(255,255,255,0.13);
  }
  .card.selected{
    background: rgba(255,255,255,0.92);
    color: #1b1b1b;
    border-color: rgba(255,255,255,0.75);
  }
  .card.disabled{
    opacity: 0.55;
    cursor:not-allowed;
  }

  .icon{
    width: 54px;
    height: 54px;
    border-radius: 16px;
    display:grid;
    place-items:center;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.20);
    font-size: 20px;
  }
  .icon.selected{
    background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
    border-color: rgba(255,120,140,0.40);
    color: white;
  }

  .content{ display:flex; flex-direction:column; gap:4px; }
  .name{
    font-weight: 700;
    font-size: 18px;
    line-height: 1.2;
  }
  .desc{
    font-size: 14px;
    opacity: 0.85;
  }
</style>
