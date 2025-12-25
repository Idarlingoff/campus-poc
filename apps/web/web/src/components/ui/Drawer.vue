<template>
  <Teleport to="body">
    <div v-if="modelValue" class="overlay" @click.self="close">
      <div class="panel" :class="sideClass" role="dialog" aria-modal="true">
        <header v-if="$slots.header" class="header">
          <slot name="header" />
        </header>

        <div class="content">
          <slot />
        </div>

        <footer v-if="$slots.footer" class="footer">
          <slot name="footer" />
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";

const props = defineProps<{
  modelValue: boolean;
  side?: "right" | "left";
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "close"): void;
}>();

const sideClass = computed(() => (props.side ?? "right"));

function close() {
  emit("update:modelValue", false);
  emit("close");
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape" && props.modelValue) close();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));
</script>

<style scoped>
  .overlay{
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0,0,0,0.35);
    backdrop-filter: blur(6px);
    display:flex;
    justify-content:flex-end;
  }

  .panel{
    width: min(380px, 92vw);
    height: 100%;
    background: #ffffff;
    box-shadow: -20px 0 50px rgba(0,0,0,0.18);
    display:flex;
    flex-direction:column;
    animation: slideIn .16s ease-out;
  }

  .panel.left{
    margin-right:auto;
    box-shadow: 20px 0 50px rgba(0,0,0,0.18);
  }

  .header{
    padding: 16px 16px 10px;
    border-bottom: 1px solid rgba(0,0,0,0.06);
  }

  .content{
    padding: 12px 16px 16px;
    overflow:auto;
  }

  .footer{
    padding: 12px 16px 16px;
    border-top: 1px solid rgba(0,0,0,0.06);
  }

  @keyframes slideIn {
    from { transform: translateX(12px); opacity: 0.7; }
    to   { transform: translateX(0); opacity: 1; }
  }
</style>
