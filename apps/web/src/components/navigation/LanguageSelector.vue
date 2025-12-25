<template>
  <div>
    <div class="label">
      <span aria-hidden="true">🌐</span>
      <span>Langue</span>
    </div>

    <div class="grid">
      <button class="lang" :class="{ active: modelValue === 'fr' }" type="button"
              @click="$emit('update:modelValue', 'fr')">
        🇫🇷 <span>Français</span>
      </button>

      <button class="lang" :class="{ active: modelValue === 'en' }" type="button"
              @click="$emit('update:modelValue', 'en')">
        🇬🇧 <span>English</span>
      </button>

      <button class="lang" :class="{ active: modelValue === 'es' }" type="button"
              @click="$emit('update:modelValue', 'es')">
        🇪🇸 <span>Español</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: "fr" | "en" | "es" }>();
defineEmits<{ (e: "update:modelValue", v: "fr" | "en" | "es"): void }>();
</script>

<style scoped>
  .label{
    display:flex;
    align-items:center;
    gap: 10px;
    color: rgba(0,0,0,0.62);
    font-weight: 700;
    margin-bottom: 10px;
  }
  .grid{
    display:grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }
  .lang{
    padding: 10px 10px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.10);
    background: #fff;
    cursor:pointer;
    font-weight: 700;
    color: rgba(0,0,0,0.70);
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    font-size: 16px;
  }
  .lang span{ font-size: 12px; font-weight: 700; }
  .lang.active{
    border: 2px solid rgba(255,120,140,0.75);
    background: rgba(255,120,140,0.08);
    color: rgba(170, 30, 85, 0.95);
  }
</style>
