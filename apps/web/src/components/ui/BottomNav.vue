<template>
  <nav class="bottom">
    <button class="item" :class="{ active: activeKey === 'challenges' }"
            type="button" @click="$emit('go', 'challenges')">
      <div class="ico">◎</div>
      <div class="lbl">Défis</div>
    </button>

    <button class="item" :class="{ active: activeKey === 'propose' }"
            type="button" @click="$emit('go', 'propose')">
      <div class="ico">＋</div>
      <div class="lbl">Proposer</div>
    </button>

    <button class="item" :class="{ active: activeKey === 'activity' }"
            type="button" @click="$emit('go', 'activity')">
      <div class="ico">〰</div>
      <div class="lbl">Activité</div>
    </button>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  activeKey: "feed" | "challenges" | "propose" | "activity";
}>();

defineEmits<{
  (e: "go", key: "challenges" | "propose" | "activity"): void;
}>();
</script>

<style scoped>
  .bottom{
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: 78px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(8px);
    border-top: 1px solid rgba(0,0,0,0.06);
    display:flex;
    justify-content:space-around;
    align-items:center;
    z-index: 50;
  }
  .item{
    width: 110px;
    display:flex;
    flex-direction:column;
    align-items:center;
    gap:6px;
    border:none;
    background: transparent;
    cursor:pointer;
    color: rgba(30,30,30,0.70);
  }
  .item .ico{ font-size: 22px; }
  .item .lbl{ font-size: 12px; }
  .item.active{
    color: #d43b6e;
  }
</style>
