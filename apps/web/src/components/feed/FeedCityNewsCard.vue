<script lang="ts">
export type CityNewsItem = {
  id: string;
  title: string;
  summary: string;
  imageUrl?: string;
  source: string;
  city: string;
  publishedAt: string;
  category: "event" | "culture" | "transport" | "food" | "sport" | "other";
};
</script>

<script setup lang="ts">
defineProps<{
  news: CityNewsItem;
}>();

defineEmits<{ (e: "click"): void }>();

const categoryIcons: Record<CityNewsItem["category"], string> = {
  event: "🎉",
  culture: "🎭",
  transport: "🚇",
  food: "🍽️",
  sport: "⚽",
  other: "📰",
};

const categoryLabels: Record<CityNewsItem["category"], string> = {
  event: "Événement",
  culture: "Culture",
  transport: "Transport",
  food: "Restauration",
  sport: "Sport",
  other: "Actualité",
};
</script>

<template>
  <article class="city-news-card" @click="$emit('click')">
    <div class="icon-badge">
      {{ categoryIcons[news.category] }}
    </div>

    <div class="content">
      <div class="meta">
        <span class="category">{{ categoryLabels[news.category] }}</span>
        <span class="separator">•</span>
        <span class="city">📍 {{ news.city }}</span>
      </div>

      <h4 class="title">{{ news.title }}</h4>
      <p class="summary">{{ news.summary }}</p>

      <div class="footer">
        <span class="source">{{ news.source }}</span>
        <span class="date">{{ news.publishedAt }}</span>
      </div>
    </div>

    <div v-if="news.imageUrl" class="thumbnail">
      <img :src="news.imageUrl" :alt="news.title" />
    </div>
  </article>
</template>

<style scoped>
.city-news-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: background 0.2s ease;
}

.city-news-card:hover {
  background: rgba(255, 255, 255, 1);
}

.icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 200, 100, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.content {
  flex: 1;
  min-width: 0;
}

.meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.category {
  font-size: 11px;
  font-weight: 800;
  color: rgba(170, 110, 30, 1);
  text-transform: uppercase;
}

.separator {
  color: rgba(0, 0, 0, 0.2);
  font-size: 10px;
}

.city {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.title {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.8);
  line-height: 1.3;
}

.summary {
  margin: 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}

.source {
  font-size: 11px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.4);
}

.date {
  font-size: 11px;
  color: rgba(0, 0, 0, 0.35);
}

.thumbnail {
  width: 72px;
  height: 72px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
