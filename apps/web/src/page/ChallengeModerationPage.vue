<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type PendingChallenge = {
  id: string; // uuid
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration_min: number;
  created_at: string;
  created_by: string;
};

const auth = useAuthStore();
const router = useRouter();

const canModerate = computed(() => auth.can("challenges:moderate"));

const loading = ref(false);
const error = ref<string | null>(null);
const items = ref<PendingChallenge[]>([]);

const rejectOpenId = ref<string | null>(null);
const rejectReason = ref("");

function fmtCategory(v: string) {
  const m: Record<string, string> = {
    creation: "Création",
    nourriture: "Nourriture",
    photo: "Photo",
    groupe: "Groupe",
    style: "Style",
    autre: "Autre",
  };
  return m[v] ?? v;
}
function fmtDifficulty(v: string) {
  const m: Record<string, string> = {
    facile: "Facile",
    moyen: "Moyen",
    difficile: "Difficile",
  };
  return m[v] ?? v;
}

async function loadPending() {
  loading.value = true;
  error.value = null;
  try {
    const token = auth.token ?? undefined;
    items.value = await apiRequest<PendingChallenge[]>("/challenges/pending", { token });
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Erreur chargement pending";
    else error.value = "Erreur chargement pending";
  } finally {
    loading.value = false;
  }
}

async function approve(id: string) {
  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/challenges/${id}/moderate`, {
      method: "PATCH",
      token,
      body: { action: "approve" },
    });

    // remove from list
    items.value = items.value.filter((x) => x.id !== id);
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur approve");
    else alert("Erreur approve");
  }
}

function openReject(id: string) {
  rejectOpenId.value = id;
  rejectReason.value = "";
}

function cancelReject() {
  rejectOpenId.value = null;
  rejectReason.value = "";
}

async function reject() {
  if (!rejectOpenId.value) return;
  if (rejectReason.value.trim().length < 3) {
    alert("Merci d’indiquer une raison (min 3 caractères).");
    return;
  }

  const id = rejectOpenId.value;

  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/challenges/${id}/moderate`, {
      method: "PATCH",
      token,
      body: { action: "reject", reason: rejectReason.value.trim() },
    });

    items.value = items.value.filter((x) => x.id !== id);
    cancelReject();
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur reject");
    else alert("Erreur reject");
  }
}

onMounted(async () => {
  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }

  if (!auth.isAuthenticated) return router.replace({ name: "login" });
  if (!canModerate.value) return router.replace({ name: "feed" });

  await loadPending();
});
</script>

<template>
  <div style="max-width: 860px; margin: 0 auto; display:flex; flex-direction:column; gap: 12px;">
    <h2 style="margin:0; font-weight: 900; color: rgba(0,0,0,0.80);">
      Modération des défis
    </h2>
    <p style="margin:0 0 6px; color: rgba(0,0,0,0.55); font-weight:700;">
      Valide ou rejette les propositions. Les défis approuvés deviennent visibles dans l’app.
    </p>

    <div v-if="loading">
      <EmptyState title="Chargement..." description="Récupération des défis en attente." />
    </div>

    <div v-else-if="error">
      <EmptyState
          title="Impossible de charger"
          :description="error"
          actionLabel="Réessayer"
          @action="loadPending"
      >
        <template #icon>⚠️</template>
      </EmptyState>
    </div>

    <div v-else-if="items.length === 0">
      <EmptyState
          title="Aucun défi en attente"
          description="Tout est à jour ✅"
      >
        <template #icon>🧹</template>
      </EmptyState>
    </div>

    <template v-else>
      <BaseCard v-for="c in items" :key="c.id" style="padding: 14px;">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <div style="flex:1; min-width:0;">
            <div style="font-weight: 900; color: rgba(0,0,0,0.80); font-size: 16px;">
              {{ c.title }}
            </div>
            <div style="margin-top: 6px; color: rgba(0,0,0,0.60); font-weight:700; line-height:1.35;">
              {{ c.description }}
            </div>

            <div style="margin-top: 10px; display:flex; gap:10px; flex-wrap:wrap; color: rgba(0,0,0,0.60); font-weight:800; font-size: 12px;">
              <span>🏷️ {{ fmtCategory(c.category) }}</span>
              <span>🎚️ {{ fmtDifficulty(c.difficulty) }}</span>
              <span>⭐ {{ c.points }} pts</span>
              <span>⏱️ {{ c.duration_min }} min</span>
            </div>
          </div>

          <div style="display:flex; flex-direction:column; gap:8px; width: 160px; flex:0 0 auto;">
            <button
                type="button"
                @click="approve(c.id)"
                style="height: 40px; border:none; border-radius: 12px; cursor:pointer;
                     background: rgba(40,170,90,0.12); color: rgba(20,120,60,0.95); font-weight:900;"
            >
              ✅ Approuver
            </button>

            <button
                type="button"
                @click="openReject(c.id)"
                style="height: 40px; border:none; border-radius: 12px; cursor:pointer;
                     background: rgba(220,40,70,0.10); color: rgba(200,30,60,0.95); font-weight:900;"
            >
              ❌ Rejeter
            </button>
          </div>
        </div>

        <!-- Reject box -->
        <div v-if="rejectOpenId === c.id" style="margin-top: 12px;">
          <div style="font-weight:900; color: rgba(0,0,0,0.75); margin-bottom:6px;">
            Raison du rejet
          </div>
          <textarea
              v-model="rejectReason"
              rows="3"
              placeholder="Explique brièvement pourquoi (ex: trop vague, points incohérents...)"
              style="width: 100%; border-radius: 12px; padding: 10px 12px; border: 1px solid rgba(0,0,0,0.12);"
          />
          <div style="display:flex; gap:10px; justify-content:flex-end; margin-top: 10px;">
            <button
                type="button"
                @click="cancelReject"
                style="height: 40px; padding:0 14px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.12);
                     background:#fff; cursor:pointer; font-weight:900;"
            >
              Annuler
            </button>
            <button
                type="button"
                @click="reject"
                style="height: 40px; padding:0 14px; border-radius: 12px; border:none;
                     background: rgba(220,40,70,0.95); color:white; cursor:pointer; font-weight:900;"
            >
              Confirmer le rejet
            </button>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
