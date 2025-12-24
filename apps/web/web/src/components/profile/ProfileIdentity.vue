<script setup lang="ts">
defineProps<{
  name: string;
  schoolLine?: string;
  bio?: string;
  city?: string;
  since?: string;
  avatarText?: string;
}>();
</script>

<template>
  <div class="id">
    <div class="avatar">
      <span class="emoji">{{ avatarText ?? "👩‍🎓" }}</span>
      <button class="photo" type="button" aria-label="Changer la photo">📷</button>
    </div>

    <div class="meta">
      <div class="name">{{ name }}</div>
      <div v-if="schoolLine" class="school">{{ schoolLine }}</div>

      <div v-if="bio" class="bio">{{ bio }}</div>

      <div class="facts">
        <span v-if="city" class="fact">📍 {{ city }}</span>
        <span v-if="since" class="fact">🗓️ {{ since }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .id{
    display:flex;
    gap: 16px;
    align-items:flex-start;
  }

  .avatar{
    position: relative;
    width: 84px;
    height: 84px;
    border-radius: 999px;
    background: rgba(255,255,255,0.18);
    border: 2px solid rgba(255,255,255,0.25);
    display:grid;
    place-items:center;
    flex: 0 0 auto;
  }

  .emoji{ font-size: 34px; }

  .photo{
    position:absolute;
    left: -6px;
    bottom: -6px;
    width: 38px;
    height: 38px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.15);
    cursor:pointer;
  }
  .photo:hover{ background: rgba(255,255,255,0.22); }

  .meta{ display:flex; flex-direction:column; gap: 6px; }
  .name{ font-weight: 800; font-size: 22px; }
  .school{ opacity: 0.9; font-weight: 700; font-size: 13px; }
  .bio{ opacity: 0.92; font-size: 13.5px; max-width: 640px; }

  .facts{ display:flex; gap: 12px; flex-wrap: wrap; margin-top: 2px; }
  .fact{ font-size: 12.5px; opacity: 0.9; }
</style>
