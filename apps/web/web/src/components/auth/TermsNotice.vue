<script setup lang="ts">
const emit = defineEmits<{ (e: "open-terms"): void }>();
</script>

<template>
  <p class="terms">
    En vous connectant, vous acceptez nos
    <a href="#" @click.prevent="emit('open-terms')">conditions d'utilisation</a>
  </p>
</template>

<style scoped>
.terms{
  margin-top: 18px;
  font-size: 12.5px;
  color: rgba(255,255,255,0.75);
  text-align:center;
}
.terms a{
  color: rgba(255,255,255,0.90);
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
