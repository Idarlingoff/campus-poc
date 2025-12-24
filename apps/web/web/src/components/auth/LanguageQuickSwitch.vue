<template>
  <button class="lang" type="button" @click="cycle" :aria-label="`Langue: ${modelValue}`">
    <span class="globe" aria-hidden="true">🌐</span>
    <span class="flag" aria-hidden="true">{{ flag }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from "vue";

type Lang = "fr" | "en" | "es";

const props = defineProps<{
  modelValue: Lang
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: Lang): void
}>();

const flag = computed(() => {
  if (props.modelValue === "fr") return "🇫🇷";
  if (props.modelValue === "en") return "🇬🇧";
  return "🇪🇸";
});

function cycle() {
  const next: Lang =
      props.modelValue === "fr" ? "en" :
          props.modelValue === "en" ? "es" : "fr";
  emit("update:modelValue", next);
}
</script>

<style scoped>
  .lang{
    display:flex;
    align-items:center;
    gap:10px;
    padding: 10px 12px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.22);
    background: rgba(0,0,0,0.10);
    color: rgba(255,255,255,0.92);
    cursor:pointer;
    box-shadow: 0 10px 25px rgba(0,0,0,0.10);
  }
  .lang:hover{
    background: rgba(0,0,0,0.14);
  }
  .globe{ font-size: 18px; }
  .flag{ font-size: 18px; }
</style>
