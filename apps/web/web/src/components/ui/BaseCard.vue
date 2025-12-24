<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  rightLabel?: string;

  padded?: boolean;
  elevated?: boolean;

  variant?: "surface" | "ghost";
}>(), {
  padded: true,
  elevated: true,
  variant: "surface",
});
</script>

<template>
  <section class="card" :class="[variant, { padded, elevated }]">
    <header v-if="title || subtitle || rightLabel || $slots['header-right']" class="head">
      <div class="left">
        <div v-if="title" class="title">{{ title }}</div>
        <div v-if="subtitle" class="subtitle">{{ subtitle }}</div>
      </div>

      <div class="right">
        <div v-if="rightLabel" class="rightLabel">{{ rightLabel }}</div>
        <slot name="header-right" />
      </div>
    </header>

    <div class="body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
  .card{
    border-radius: 18px;
    border: 1px solid rgba(0,0,0,0.05);
  }

  .surface{
    background: rgba(255,255,255,0.92);
  }

  .ghost{
    background: rgba(0,0,0,0.02);
    border-style: dashed;
    border-color: rgba(0,0,0,0.10);
  }

  .padded{ padding: 16px; }
  .elevated{ box-shadow: 0 14px 35px rgba(0,0,0,0.08); }

  .head{
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap: 12px;
    margin-bottom: 12px;
  }

  .title{
    font-weight: 900;
    color: rgba(0,0,0,0.78);
  }

  .subtitle{
    margin-top: 4px;
    font-size: 12.5px;
    color: rgba(0,0,0,0.52);
    font-weight: 700;
  }

  .right{
    display:flex;
    align-items:center;
    gap: 10px;
  }

  .rightLabel{
    font-weight: 800;
    color: rgba(0,0,0,0.45);
    font-size: 12px;
    white-space: nowrap;
  }
</style>
