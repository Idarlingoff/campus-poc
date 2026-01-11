<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest } from "@/services/api";

import FeedSectionHeader from "@/components/feed/FeedSectionHeader.vue";
import FeedNewsCard, { type NewsItem } from "@/components/feed/FeedNewsCard.vue";
import FeedPostCard, { type PostItem } from "@/components/feed/FeedPostCard.vue";
import FeedCityNewsCard, { type CityNewsItem } from "@/components/feed/FeedCityNewsCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";
import { useFlashStore } from "@/stores/flash";

const router = useRouter();
const auth = useAuthStore();

// Onglet actif pour la navigation principale
type FeedTab = 'news' | 'publications' | 'local';
const activeTab = ref<FeedTab>('publications');

const tabOptions: { value: FeedTab; label: string; icon: string }[] = [
  { value: 'news', label: 'Actualités', icon: '📰' },
  { value: 'publications', label: 'Publications', icon: '✨' },
  { value: 'local', label: 'Autour de vous', icon: '📍' },
];

// États
const loading = ref(true);
const institutionalNews = ref<NewsItem[]>([]);
const memberPosts = ref<PostItem[]>([]);
const cityNews = ref<CityNewsItem[]>([]);

// Filtre actif (uniquement pour utilisateurs connectés)
type FeedFilter = 'following' | 'my_campus' | 'all_campuses' | 'public';
const activeFilter = ref<FeedFilter>('public');

const filterOptions: { value: FeedFilter; label: string; icon: string }[] = [
  { value: 'public', label: 'Public', icon: '🌍' },
  { value: 'my_campus', label: 'Mon campus', icon: '🏫' },
  { value: 'all_campuses', label: 'Tous les campus', icon: '🎓' },
  { value: 'following', label: 'Abonnements', icon: '👥' },
];

// Computed
const isGuest = computed(() => auth.isGuest);

const postsTitle = computed(() => {
  if (isGuest.value) return "Dernières publications";

  switch (activeFilter.value) {
    case "following": return "Publications de vos abonnements";
    case "my_campus": return "Publications de mon campus";
    case "all_campuses": return "Toutes les publications";
    case "public":
    default: return "Publications publiques";
  }
});

const openComposer = ref(false);
const composer = ref({
  type: "POST" as "POST" | "EVENT" | "CAMPUS_ANNOUNCEMENT",
  title: "",
  contentHtml: "",
  visibility: "PUBLIC" as "PUBLIC" | "CAMPUS_ONLY" | "PRIVATE",
  campusId: null as string | null,
  themeId: null as string | null,
  eventStartAt: "",
  eventEndAt: "",
});

// Report modal
const openReportModal = ref(false);
const reportingPost = ref<PostItem | null>(null);
const reportReason = ref("");
const reportCategory = ref<"inappropriate" | "spam" | "harassment" | "misinformation" | "other">("inappropriate");
const reportSubmitting = ref(false);

const reportCategories = [
  { value: "inappropriate", label: "Contenu inapproprié", icon: "🚫" },
  { value: "spam", label: "Spam / Publicité", icon: "📢" },
  { value: "harassment", label: "Harcèlement", icon: "⚠️" },
  { value: "misinformation", label: "Désinformation", icon: "❌" },
  { value: "other", label: "Autre", icon: "📝" },
];

type FeedResponse = {
  institutionalNews: NewsItem[];
  memberPosts: PostItem[];
  cityNews: (CityNewsItem & { url?: string | null })[];
};

function formatNewsTime(iso: string): string {
  const date = new Date(iso);
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

async function loadFeed() {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (!isGuest.value) {
      params.set('filter', activeFilter.value);
    }
    const url = `/feed${params.toString() ? `?${params.toString()}` : ''}`;

    const data = await apiRequest<FeedResponse>(url, {
      method: "GET",
      token: auth.token,
    });

    institutionalNews.value = (data.institutionalNews ?? []).map((n) => ({
      ...n,
      publishedAt: n.publishedAt ? formatNewsTime(n.publishedAt) : n.publishedAt,
    }));

    memberPosts.value = (data.memberPosts ?? []).map((p) => ({
      ...p,
      publishedAt: p.publishedAt,
    }));

    cityNews.value = (data.cityNews ?? []).map((n) => ({
      ...n,
      publishedAt: n.publishedAt ? formatNewsTime(n.publishedAt) : n.publishedAt,
    }));
  } catch (e: any) {
    console.error("Feed load error:", e);
    institutionalNews.value = [];
    memberPosts.value = [];
    cityNews.value = [];
  } finally {
    loading.value = false;
  }
}

watch(activeFilter, () => {
  loadFeed();
});

const flash = useFlashStore();

onMounted(async () => {
  await loadFeed();
  flash.showWelcome(isGuest.value);
});

// Actions
function handleNewsClick(news: NewsItem) {
  console.log("News clicked:", news.id);
}

function handlePostLike(post: PostItem) {
  const idx = memberPosts.value.findIndex((p: PostItem) => p.id === post.id);
  if (idx !== -1) {
    const p = memberPosts.value[idx];
    if (p) {
      p.isLiked = !p.isLiked;
      p.likesCount += p.isLiked ? 1 : -1;
    }
  }
}

function handlePostComment(post: PostItem) {
  console.log("Comment on post:", post.id);
}

function handleAuthorClick(post: PostItem) {
  router.push(`/app/users/${post.author.id}`);
}

function handleCityNewsClick(news: CityNewsItem) {
  console.log("City news clicked:", news.id);
}

async function handlePostReport(post: PostItem) {
  reportingPost.value = post;
  reportReason.value = "";
  reportCategory.value = "inappropriate";
  openReportModal.value = true;
}

function cancelReport() {
  openReportModal.value = false;
  reportingPost.value = null;
  reportReason.value = "";
  reportCategory.value = "inappropriate";
}

async function submitReport() {
  if (!reportingPost.value) return;

  reportSubmitting.value = true;
  try {
    const fullReason = `[${reportCategories.find(c => c.value === reportCategory.value)?.label}] ${reportReason.value.trim()}`.trim();

    await apiRequest(`/publications/${reportingPost.value.id}/report`, {
      method: "POST",
      token: auth.token,
      body: {
        reason: fullReason || null,
        category: reportCategory.value
      },
    });

flash.show("Publication signalée avec succès", "success");

    cancelReport();
  } catch (e) {
    console.error("Report failed:", e);
    flash.show("Erreur lors du signalement", "error");
  } finally {
    reportSubmitting.value = false;
  }
}

async function submitPublication() {
  try {
    await apiRequest("/publications", {
      method: "POST",
      token: auth.token,
      body: {
        type: composer.value.type,
        title: composer.value.title,
        contentHtml: composer.value.contentHtml,
        visibility: composer.value.visibility,
        campusId: composer.value.campusId,
        themeId: composer.value.themeId,
        eventStartAt: composer.value.type === "EVENT" ? toIsoFromLocal(composer.value.eventStartAt) : null,
        eventEndAt: composer.value.type === "EVENT" ? toIsoFromLocal(composer.value.eventEndAt) : null,
      },
    });

    openComposer.value = false;
    composer.value = {
      type: "POST",
      title: "",
      contentHtml: "",
      visibility: "PUBLIC",
      campusId: null,
      themeId: null,
      eventStartAt: "",
      eventEndAt: "",
    };

    await loadFeed();
    flash.show("Publication créée avec succès !", "success");
  } catch (e: any) {
    console.error(e);
    flash.show(e.message || "Erreur lors de la création", "error");
  }
}

function toIsoFromLocal(v: string) {
  if (!v) return null;
  return new Date(v).toISOString();
}
</script>

<template>
  <div class="feed-page">
    <!-- Navigation par onglets -->
    <nav class="feed-tabs">
      <button
        v-for="tab in tabOptions"
        :key="tab.value"
        class="tab-btn"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </nav>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Chargement...</p>
    </div>

    <template v-else>
      <!-- TAB 1: Actualités MediaSchool -->
      <section v-if="activeTab === 'news'" class="feed-section">
        <FeedSectionHeader
          title="Actualités MediaSchool"
          icon="🎓"
        />
        <p class="section-subtitle">Journal Stratégie • CNews</p>

        <div class="news-list">
          <FeedNewsCard
            v-for="news in institutionalNews"
            :key="news.id"
            :news="news"
            @click="handleNewsClick(news)"
          />
        </div>

        <EmptyState
          v-if="institutionalNews.length === 0"
          title="Pas d'actualités"
          description="Aucune actualité MediaSchool pour le moment."
        />
      </section>

      <!-- TAB 2: Publications des membres -->
      <section v-if="activeTab === 'publications'" class="feed-section">
        <FeedSectionHeader
          :title="postsTitle"
          icon="✨"
        />

        <!-- Filtres (uniquement si connecté) -->
        <div v-if="!isGuest" class="filter-bar">
          <button
            v-for="opt in filterOptions"
            :key="opt.value"
            class="filter-chip"
            :class="{ active: activeFilter === opt.value }"
            @click="activeFilter = opt.value"
          >
            <span class="filter-icon">{{ opt.icon }}</span>
            <span class="filter-label">{{ opt.label }}</span>
          </button>
        </div>

        <div v-if="!isGuest" style="display:flex; justify-content:flex-end; margin: 8px 0 12px;">
          <button class="publish-btn" type="button" @click="openComposer = true">
            ＋ Publier
          </button>
        </div>

        <!-- Modal de publication -->
        <div v-if="openComposer" class="modal-backdrop" @click.self="openComposer=false">
          <div class="modal">
            <h3>Nouvelle publication</h3>

            <label class="field">
              <span>Type</span>
              <select v-model="composer.type">
                <option value="POST">Publication</option>
                <option value="EVENT">Événement</option>
                <option value="CAMPUS_ANNOUNCEMENT">Annonce campus</option>
              </select>
            </label>

            <label class="field">
              <span>Titre *</span>
              <input v-model="composer.title" placeholder="Titre de votre publication" />
            </label>

            <label class="field">
              <span>Contenu *</span>
              <textarea v-model="composer.contentHtml" rows="5" placeholder="Écrivez votre contenu ici..."></textarea>
            </label>

            <label class="field">
              <span>Visibilité</span>
              <select v-model="composer.visibility">
                <option value="PUBLIC">Public (tout le monde)</option>
                <option value="CAMPUS_ONLY">Campus uniquement</option>
                <option value="PRIVATE">Abonnés uniquement</option>
              </select>
            </label>

            <template v-if="composer.type === 'EVENT'">
              <label class="field">
                <span>Début de l'événement *</span>
                <input v-model="composer.eventStartAt" type="datetime-local" />
              </label>
              <label class="field">
                <span>Fin de l'événement *</span>
                <input v-model="composer.eventEndAt" type="datetime-local" />
              </label>
            </template>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="openComposer=false">Annuler</button>
              <button
                type="button"
                class="btn-primary"
                :disabled="!composer.title.trim() || !composer.contentHtml.trim()"
                @click="submitPublication"
              >
                Publier
              </button>
            </div>
          </div>
        </div>

        <!-- Modal de signalement -->
        <div v-if="openReportModal" class="modal-backdrop" @click.self="cancelReport">
          <div class="modal report-modal">
            <h3>🚩 Signaler la publication</h3>
            <p class="report-subtitle">Aidez-nous à maintenir une communauté saine.</p>

            <div class="field">
              <span>Catégorie du signalement</span>
              <div class="report-categories">
                <button
                  v-for="cat in reportCategories"
                  :key="cat.value"
                  type="button"
                  class="report-category-btn"
                  :class="{ active: reportCategory === cat.value }"
                  @click="reportCategory = cat.value as typeof reportCategory"
                >
                  <span class="category-icon">{{ cat.icon }}</span>
                  <span class="category-label">{{ cat.label }}</span>
                </button>
              </div>
            </div>

            <label class="field">
              <span>Détails supplémentaires (optionnel)</span>
              <textarea
                v-model="reportReason"
                rows="3"
                placeholder="Décrivez le problème en quelques mots..."
              ></textarea>
            </label>

            <div class="modal-actions">
              <button type="button" class="btn-secondary" @click="cancelReport">Annuler</button>
              <button
                type="button"
                class="btn-danger"
                :disabled="reportSubmitting"
                @click="submitReport"
              >
                {{ reportSubmitting ? 'Envoi...' : 'Signaler' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Info pour invités -->
        <div v-if="isGuest" class="guest-info">
          <span class="info-icon">ℹ️</span>
          <span>Connectez-vous pour voir les publications de vos abonnements</span>
        </div>

        <div class="posts-list">
          <FeedPostCard
            v-for="post in memberPosts"
            :key="post.id"
            :post="post"
            @like="handlePostLike(post)"
            @comment="handlePostComment(post)"
            @author-click="handleAuthorClick(post)"
            @report="handlePostReport(post)"
          />
        </div>

        <EmptyState
          v-if="memberPosts.length === 0"
          title="Aucune publication"
          description="Suivez des membres pour voir leurs publications ici."
          action-label="Découvrir des profils"
          @action="router.push('/app/users')"
        />
      </section>

      <!-- TAB 3: Actualités de la ville -->
      <section v-if="activeTab === 'local'" class="feed-section">
        <FeedSectionHeader
          title="Autour de vous"
          icon="📍"
        />
        <p class="section-subtitle">Actualités de votre ville</p>

        <div class="city-news-list">
          <FeedCityNewsCard
            v-for="news in cityNews"
            :key="news.id"
            :news="news"
            @click="handleCityNewsClick(news)"
          />
        </div>

        <EmptyState
          v-if="cityNews.length === 0"
          title="Pas d'actualités locales"
          description="Aucune actualité de votre ville pour le moment."
        />
      </section>
    </template>
  </div>
</template>

<style scoped>
.feed-page {
  padding: 18px;
  padding-bottom: 100px;
  max-width: 680px;
  margin: 0 auto;
  background: linear-gradient(180deg, rgba(245, 245, 247, 1) 0%, rgba(250, 250, 252, 1) 100%);
  min-height: 100vh;
}

/* Navigation par onglets */
.feed-tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.04);
  padding: 4px;
  border-radius: 16px;
  margin-bottom: 20px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 12px 8px;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: rgba(0, 0, 0, 0.7);
  background: rgba(255, 255, 255, 0.5);
}

.tab-btn.active {
  background: white;
  color: #355c49;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.tab-icon {
  font-size: 16px;
}

.tab-label {
  font-size: 12px;
}

@media (min-width: 400px) {
  .tab-label {
    font-size: 13px;
  }
}

/* Loading */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: rgba(0, 0, 0, 0.5);
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(53, 92, 73, 0.2);
  border-top-color: #355c49;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Sections */
.feed-section {
  margin-bottom: 28px;
}

.section-subtitle {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  margin: -8px 0 16px;
  padding-left: 2px;
}

/* News list (vertical pour l'onglet dédié) */
.news-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Posts list */
.posts-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* Filter bar */
.filter-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 0 12px;
  margin: 0 -18px;
  padding-left: 18px;
  padding-right: 18px;
  -webkit-overflow-scrolling: touch;
}

.filter-bar::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: rgba(53, 92, 73, 0.05);
  border-color: rgba(53, 92, 73, 0.2);
}

.filter-chip.active {
  background: #355c49;
  border-color: #355c49;
  color: white;
}

.filter-icon {
  font-size: 14px;
}

.filter-label {
  font-size: 13px;
}

/* Guest info */
.guest-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  background: rgba(255, 200, 100, 0.15);
  border: 1px solid rgba(255, 200, 100, 0.3);
  border-radius: 12px;
  font-size: 13px;
  color: rgba(180, 120, 30, 0.9);
  margin-bottom: 14px;
}

.info-icon {
  flex-shrink: 0;
}

/* City news list */
.city-news-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Mobile first - ajustements tablette/desktop */
@media (min-width: 640px) {
  .feed-page {
    padding: 24px;
    padding-bottom: 120px;
  }
}

.publish-btn {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(53, 92, 73, 0.25);
  background: rgba(53, 92, 73, 0.08);
  color: #355c49;
  font-weight: 800;
  cursor: pointer;
}

.publish-btn:hover {
  background: rgba(53, 92, 73, 0.12);
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  z-index: 50;
}

.modal {
  width: min(520px, 100%);
  background: white;
  border-radius: 18px;
  padding: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 12px 0;
}

.field span {
  font-size: 12px;
  opacity: 0.7;
  font-weight: 700;
}

.field textarea,
.field input,
.field select {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  padding: 10px 12px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

.btn-primary {
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: #355c49;
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.btn-secondary {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: white;
  font-weight: 800;
  cursor: pointer;
}

/* Report modal styles */
.report-modal h3 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 900;
}

.report-subtitle {
  margin: 0 0 16px 0;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}

.report-categories {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.report-category-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.03);
  font-size: 13px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
}

.report-category-btn:hover {
  background: rgba(0, 0, 0, 0.06);
}

.report-category-btn.active {
  background: rgba(220, 40, 70, 0.1);
  border-color: rgba(220, 40, 70, 0.3);
  color: rgba(200, 30, 60, 0.95);
}

.category-icon {
  font-size: 14px;
}

.btn-danger {
  padding: 10px 14px;
  border-radius: 12px;
  border: none;
  background: rgba(220, 40, 70, 0.95);
  color: white;
  font-weight: 800;
  cursor: pointer;
}

.btn-danger:hover {
  background: rgba(200, 30, 60, 0.95);
}

.btn-danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
