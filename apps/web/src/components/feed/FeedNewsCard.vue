<script lang="ts">
export type NewsItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  category: string;
  publishedAt: string;
  isImportant?: boolean;
};
</script>

<script setup lang="ts">
defineProps<{
  news: NewsItem;
}>();

defineEmits<{ (e: "click"): void }>();
</script>

<template>
  <article class="news-card" :class="{ important: news.isImportant }" @click="$emit('click')">
    <div v-if="news.imageUrl" class="image-wrapper">
      <img :src="news.imageUrl" :alt="news.title" class="image" />
      <span v-if="news.isImportant" class="badge-important">⭐ Important</span>
    </div>

    <div class="content">
      <div class="meta">
        <span class="category">{{ news.category }}</span>
        <span class="date">{{ news.publishedAt }}</span>
      </div>

      <h3 class="title">{{ news.title }}</h3>
      <p class="summary">{{ news.summary }}</p>
    </div>
  </article>
</template>

<style scoped>
.news-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.news-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.10);
}

.news-card.important {
  border: 2px solid rgba(53, 92, 73, 0.3);
  box-shadow: 0 10px 28px rgba(53, 92, 73, 0.12);
}

.image-wrapper {
  position: relative;
  width: 100%;
  height: 160px;
  overflow: hidden;
}

.image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-important {
  position: absolute;
  top: 12px;
  left: 12px;
  background: linear-gradient(135deg, #355c49, #4a7c63);
  color: white;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
}

.content {
  padding: 16px;
}

.meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.category {
  background: rgba(53, 92, 73, 0.12);
  color: #2d4a3a;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}

.date {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  font-weight: 600;
}

.title {
  margin: 0 0 8px 0;
  font-size: 17px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.82);
  line-height: 1.3;
}

.summary {
  margin: 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
