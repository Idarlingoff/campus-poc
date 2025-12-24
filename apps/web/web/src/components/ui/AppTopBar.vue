<template>
  <header class="topbar">
    <div class="left">
      <slot name="left">
        <div class="brand">
          <span class="mark" aria-hidden="true">M</span>
          <div class="titles">
            <div class="title">L'Essentiel</div>
            <div class="subtitle">by MediaSchool</div>
          </div>
        </div>
      </slot>
    </div>

    <div class="right">
      <slot name="right">
        <button class="icon-btn" type="button" @click="$emit('menu')"
                aria-label="Ouvrir le menu">
          ☰
        </button>
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{ (e: "menu"): void }>();
</script>

<style scoped>
  .topbar{
    height: 74px;
    background: #355c49; /* proche capture */
    color: rgba(255,255,255,0.92);
    display:flex;
    align-items:center;
    justify-content:space-between;
    padding: 0 18px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.10);
  }
  .brand{
    display:flex;
    align-items:center;
    gap: 12px;
  }
  .mark{
    width: 28px;
    height: 28px;
    border-radius: 10px;
    display:grid;
    place-items:center;
    background: rgba(0,0,0,0.18);
    font-weight: 800;
  }
  .titles{ line-height: 1.1; }
  .title{ font-weight: 700; }
  .subtitle{ opacity: 0.8; font-size: 12px; margin-top: 2px; }

  .icon-btn{
    border: 1px solid rgba(255,255,255,0.20);
    background: rgba(0,0,0,0.12);
    color: rgba(255,255,255,0.92);
    width: 44px;
    height: 44px;
    border-radius: 12px;
    cursor:pointer;
    font-size: 20px;
  }
  .icon-btn:hover{ background: rgba(0,0,0,0.18); }
</style>
