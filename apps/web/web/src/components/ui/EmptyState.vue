<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  actionLabel?: string;
}>();

defineEmits<{ (e: "action"): void }>();
</script>

<template>
  <div class="empty">
    <div class="icon"><slot name="icon">◎</slot></div>
    <div class="title">{{ title }}</div>
    <div v-if="description" class="desc">{{ description }}</div>

    <button
        v-if="actionLabel"
        class="action"
        type="button"
        @click="$emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>

<style scoped>
  .empty{
    padding: 18px;
    border-radius: 18px;
    background: rgba(0,0,0,0.02);
    border: 1px dashed rgba(0,0,0,0.10);
    text-align:center;
  }
  .icon{
    width: 44px; height: 44px;
    margin: 0 auto 10px;
    border-radius: 999px;
    display:grid; place-items:center;
    background: rgba(255,120,140,0.12);
    font-size: 18px;
  }
  .title{
    font-weight: 900;
    color: rgba(0,0,0,0.78);
  }
  .desc{
    margin-top: 6px;
    font-size: 13px;
    color: rgba(0,0,0,0.55);
  }
  .action{
    margin-top: 12px;
    height: 40px;
    padding: 0 14px;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.10);
    background: #fff;
    cursor:pointer;
    font-weight: 900;
  }
  .action:hover{ background: rgba(0,0,0,0.03); }
</style>
