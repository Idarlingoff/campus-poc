<script setup lang="ts">
export type ActivityItem = {
  icon?: string;
  title: string;
  meta?: string;
  points?: number;
};

defineProps<{ item: ActivityItem }>();
</script>

<template>
  <div class="item">
    <div class="left">
      <div class="ico">{{ item.icon ?? "◎" }}</div>
      <div class="txt">
        <div class="t">{{ item.title }}</div>
        <div v-if="item.meta" class="m">{{ item.meta }}</div>
      </div>
    </div>

    <div v-if="typeof item.points === 'number'" class="pts">
      +{{ item.points }} pts
    </div>
  </div>
</template>

<style scoped>
  .item{
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap: 12px;
    padding: 12px 12px;
    border-radius: 14px;
    background: rgba(0,0,0,0.02);
    border: 1px solid rgba(0,0,0,0.05);
  }
  .left{ display:flex; align-items:center; gap: 12px; }
  .ico{
    width: 36px; height: 36px;
    border-radius: 999px;
    display:grid; place-items:center;
    background: rgba(255,120,140,0.14);
  }
  .t{ font-weight: 900; color: rgba(0,0,0,0.78); }
  .m{ font-size: 12px; color: rgba(0,0,0,0.50); margin-top: 2px; }
  .pts{ font-weight: 900; color: rgba(60,120,60,0.85); }
</style>
