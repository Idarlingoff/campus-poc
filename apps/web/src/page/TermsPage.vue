<script setup lang="ts">
import { useRouter } from "vue-router";
const router = useRouter();
</script>

<template>
  <div class="card">
    <h2>Conditions d’utilisation</h2>
    <p>Page placeholder. Tu mettras ici le texte légal.</p>
    <button class="btn" type="button" @click="router.back()">Retour</button>
  </div>
</template>

<style scoped>
.card{
  width: min(680px, 92vw);
  border-radius: 18px;
  padding: 18px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
}
.btn{
  margin-top: 10px;
  height: 42px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  background: #fff;
  cursor: pointer;
}
</style>
