<script setup lang="ts">
import StatGradientTile from "./StatGradientTile.vue";

defineProps<{
  points: string | number;
  completed: string | number;
  streak: string | number;
}>();
</script>

<template>
  <div class="row">
    <StatGradientTile title="Points" :value="points" icon="🏆" variant="pink" />
    <StatGradientTile title="Complétés" :value="completed" icon="✅" variant="green" />
    <StatGradientTile title="Série" :value="streak" icon="🔥" variant="red" />
  </div>
</template>

<style scoped>
.row{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14px;
}
@media (max-width: 900px){
  .row{ grid-template-columns: 1fr; }
}
</style>
