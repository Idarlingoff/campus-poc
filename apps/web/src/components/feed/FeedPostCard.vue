<script lang="ts">
export type PostItem = {
  id: string;
  author: {
    id: string;
    displayName: string;
    avatarUrl?: string;
    isFollowed?: boolean;
  };
  content: string;
  imageUrl?: string;
  likesCount: number;
  commentsCount: number;
  publishedAt: string;
  isLiked?: boolean;
};
</script>

<script setup lang="ts">
defineProps<{
  post: PostItem;
}>();

defineEmits<{
  (e: "like"): void;
  (e: "comment"): void;
  (e: "author-click"): void;
  (e: "report"): void;
}>();


function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days < 7) return `Il y a ${days}j`;

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
</script>

<template>
  <article class="post-card">
    <header class="header" @click="$emit('author-click')">
      <div class="avatar">
        <img
          v-if="post.author.avatarUrl"
          :src="post.author.avatarUrl"
          :alt="post.author.displayName"
        />
        <span v-else class="avatar-placeholder">
          {{ post.author.displayName.charAt(0).toUpperCase() }}
        </span>
      </div>

      <div class="author-info">
        <div class="author-name">{{ post.author.displayName }}</div>
        <div class="post-time">{{ formatRelativeTime(post.publishedAt) }}</div>
      </div>

      <div v-if="post.author.isFollowed" class="follow-badge">
        <span class="follow-icon">✓</span> Abonné
      </div>
    </header>

    <div class="body">
      <p class="content">{{ post.content }}</p>

      <div v-if="post.imageUrl" class="post-image-wrapper">
        <img :src="post.imageUrl" :alt="'Image de ' + post.author.displayName" class="post-image" />
      </div>
    </div>

    <footer class="footer">
      <button
        class="action-btn"
        :class="{ liked: post.isLiked }"
        type="button"
        @click="$emit('like')"
      >
        <span class="action-icon">{{ post.isLiked ? '❤️' : '🤍' }}</span>
        <span class="action-count">{{ post.likesCount }}</span>
      </button>

      <button class="action-btn" type="button" @click="$emit('comment')">
        <span class="action-icon">💬</span>
        <span class="action-count">{{ post.commentsCount }}</span>
      </button>

      <button class="action-btn" type="button" @click="$emit('report')">
        <span class="action-icon">🚩</span>
      </button>

      <button class="action-btn share-btn" type="button">
        <span class="action-icon">↗</span>
      </button>
    </footer>
  </article>
</template>

<style scoped>
.post-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 18px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.header:hover .author-name {
  color: #355c49;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(255, 150, 150, 0.8), rgba(150, 20, 75, 0.8));
  color: white;
  font-weight: 800;
  font-size: 18px;
}

.author-info {
  flex: 1;
  min-width: 0;
}

.author-name {
  font-weight: 800;
  font-size: 15px;
  color: rgba(0, 0, 0, 0.82);
  transition: color 0.2s ease;
}

.post-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  margin-top: 2px;
}

.follow-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: rgba(53, 92, 73, 0.08);
  color: #355c49;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.follow-icon {
  font-size: 10px;
}

.body {
  padding: 0 16px;
}

.content {
  margin: 0 0 14px 0;
  font-size: 15px;
  line-height: 1.55;
  color: rgba(0, 0, 0, 0.75);
  white-space: pre-wrap;
  word-break: break-word;
}

.post-image-wrapper {
  margin: 0 -16px 0 -16px;
  max-height: 320px;
  overflow: hidden;
}

.post-image {
  width: 100%;
  height: auto;
  display: block;
}

.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 14px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.2s ease;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.07);
}

.action-btn.liked {
  background: rgba(255, 100, 100, 0.1);
}

.action-icon {
  font-size: 16px;
}

.action-count {
  font-size: 13px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.6);
}

.share-btn {
  margin-left: auto;
  padding: 8px 12px;
}
</style>
