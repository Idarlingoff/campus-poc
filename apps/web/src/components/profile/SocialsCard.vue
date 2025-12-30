<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";

defineProps<{
  instagramHandle?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
}>();

function normalizeUrl(url: string) {
  const s = (url || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return `https://${s}`;
}

function instagramUrl(handle: string) {
  return `https://instagram.com/${handle.replace("@", "").trim()}`;
}

function formatWebsiteLabel(url: string) {
  try {
    const u = new URL(normalizeUrl(url));
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
</script>

<template>
  <BaseCard title="🔗 Réseaux sociaux">
    <div class="socials-list">
      <a
        v-if="instagramHandle"
        :href="instagramUrl(instagramHandle)"
        target="_blank"
        rel="noopener"
        class="social-link instagram"
      >
        <span class="social-icon">📸</span>
        <span class="social-info">
          <span class="social-platform">Instagram</span>
          <span class="social-handle">@{{ instagramHandle.replace("@", "").trim() }}</span>
        </span>
        <span class="social-arrow">→</span>
      </a>

      <a
        v-if="linkedinUrl"
        :href="normalizeUrl(linkedinUrl)"
        target="_blank"
        rel="noopener"
        class="social-link linkedin"
      >
        <span class="social-icon">💼</span>
        <span class="social-info">
          <span class="social-platform">LinkedIn</span>
          <span class="social-handle">Voir le profil</span>
        </span>
        <span class="social-arrow">→</span>
      </a>

      <a
        v-if="websiteUrl"
        :href="normalizeUrl(websiteUrl)"
        target="_blank"
        rel="noopener"
        class="social-link website"
      >
        <span class="social-icon">🌐</span>
        <span class="social-info">
          <span class="social-platform">Site web</span>
          <span class="social-handle">{{ formatWebsiteLabel(websiteUrl) }}</span>
        </span>
        <span class="social-arrow">→</span>
      </a>
    </div>
  </BaseCard>
</template>

<style scoped>
.socials-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  text-decoration: none;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.social-link:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.social-link.instagram {
  background: linear-gradient(135deg, rgba(225, 48, 108, 0.08), rgba(131, 58, 180, 0.08));
}
.social-link.instagram:hover {
  background: linear-gradient(135deg, rgba(225, 48, 108, 0.14), rgba(131, 58, 180, 0.14));
}

.social-link.linkedin {
  background: rgba(10, 102, 194, 0.08);
}
.social-link.linkedin:hover {
  background: rgba(10, 102, 194, 0.14);
}

.social-link.website {
  background: rgba(0, 0, 0, 0.04);
}
.social-link.website:hover {
  background: rgba(0, 0, 0, 0.08);
}

.social-icon {
  font-size: 1.4rem;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.social-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.social-platform {
  font-weight: 800;
  font-size: 0.95rem;
  color: rgba(0, 0, 0, 0.85);
}

.social-handle {
  font-size: 0.82rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.5);
}

.social-link.instagram .social-platform {
  color: #c13584;
}

.social-link.linkedin .social-platform {
  color: #0a66c2;
}

.social-arrow {
  font-size: 1.1rem;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease;
}

.social-link:hover .social-arrow {
  transform: translateX(3px);
  color: rgba(0, 0, 0, 0.4);
}
</style>

