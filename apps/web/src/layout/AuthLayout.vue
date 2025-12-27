<template>
  <div class="auth-bg">
    <main class="auth-main">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.auth-bg{
  min-height: 100vh;
  position: relative;
  overflow: hidden;

  background:
      radial-gradient(1200px 700px at 20% 15%, rgba(255,255,255,0.08), transparent 60%),
      radial-gradient(900px 600px at 85% 85%, rgba(255, 0, 120, 0.20), transparent 60%),
      linear-gradient(135deg, #2f5b4a 0%, #3d6b55 30%, #6f4b55 70%, #7a1f4d 100%);
}

.auth-main{
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px 16px;
}
</style>
