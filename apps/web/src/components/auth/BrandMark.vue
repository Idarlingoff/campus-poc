<template>
  <div class="brand">
    <div class="logo-wrap" aria-hidden="true">
      <!-- Logo simple (tu pourras remplacer par ton SVG) -->
      <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
        <rect x="0" y="0" width="44" height="44" rx="10" fill="rgba(0,0,0,0.10)"/>
        <path d="M14 30 L18.5 14 L22 24 L25.5 14 L30 30"
              stroke="#FF8A8A" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>

    <h1 class="title">L'Essentiel</h1>
    <p class="subtitle">by MediaSchool</p>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .brand{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:10px;
    color: rgba(255,255,255,0.92);
    text-align:center;
  }
  .logo-wrap{
    width: 78px;
    height: 78px;
    display:grid;
    place-items:center;
    border-radius: 18px;
    background: rgba(0,0,0,0.10);
    box-shadow: 0 10px 30px rgba(0,0,0,0.12);
  }
  .title{
    margin:0;
    font-weight: 700;
    font-size: 36px;
    letter-spacing: -0.02em;
  }
  .subtitle{
    margin:0;
    opacity: 0.85;
    font-size: 16px;
  }
</style>
