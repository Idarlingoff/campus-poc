<template>
  <div class="auth-bg">
    <div class="top-right">
      <slot name="top-right" />
    </div>

    <main class="auth-main">
      <slot />
    </main>

    <div class="bottom-left">
      <slot name="bottom-left" />
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
  .auth-bg{
    min-height: 100vh;
    display: grid;
    grid-template-rows: 1fr;
    position: relative;
    overflow: hidden;

    /* fond type capture */
    background:
        radial-gradient(1200px 700px at 20% 15%, rgba(255,255,255,0.08), transparent 60%),
        radial-gradient(900px 600px at 85% 85%, rgba(255, 0, 120, 0.20), transparent 60%),
        linear-gradient(135deg, #2f5b4a 0%, #3d6b55 30%, #6f4b55 70%, #7a1f4d 100%);
  }

  .top-right{
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 5;
  }

  .bottom-left{
    position: absolute;
    left: 14px;
    bottom: 14px;
    z-index: 5;
  }

  .auth-main{
    display: grid;
    place-items: center;
    padding: 32px 16px;
  }
</style>
