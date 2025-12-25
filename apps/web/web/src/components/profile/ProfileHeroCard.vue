<script setup lang="ts">
defineProps<{
  showEdit?: boolean;
}>();

defineEmits<{
  (e: "edit"): void;
}>();
</script>

<template>
  <section class="hero">
    <slot />

    <button
        v-if="showEdit"
        class="edit"
        type="button"
        aria-label="Modifier le profil"
        @click="$emit('edit')"
    >
      ✎
    </button>
  </section>
</template>

<style scoped>
  .hero{
    position: relative;
    border-radius: 18px;
    padding: 22px;
    color: rgba(255,255,255,0.92);
    background: linear-gradient(135deg, #ff9aa3 0%, #c54b6a 45%, #8a2b52 100%);
    box-shadow: 0 18px 45px rgba(0,0,0,0.16);
    overflow: hidden;
  }

  .hero::before{
    content:"";
    position:absolute;
    inset:-40%;
    background: radial-gradient(circle at 30% 20%, rgba(255,255,255,0.20), transparent 45%);
    transform: rotate(8deg);
    pointer-events:none;
  }

  .edit{
    position:absolute;
    top: 14px;
    right: 14px;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(0,0,0,0.18);
    color: rgba(255,255,255,0.9);
    cursor:pointer;
  }
  .edit:hover{ background: rgba(0,0,0,0.25); }
</style>
