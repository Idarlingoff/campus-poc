<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type Phase = "REGISTRATION" | "RUNNING" | "JUDGING" | "FINISHED";
type ParticipationMode = "SOLO" | "TEAM";

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration_min: number;

  participation_mode: ParticipationMode;
  requires_proof: boolean;
  podium_size: number;

  start_at: string | null;
  end_at: string | null;
  phase: Phase;
};

type Winner = {
  rank: number;
  participant_type: "USER" | "TEAM";
  user_id?: string | null;
  user_display_name?: string | null;
  team_id?: string | null;
  team_name?: string | null;
};

type MyParticipation =
    | null
    | { type: "USER"; status: string; registered_at: string; submitted_at?: string | null }
    | { type: "TEAM"; team_id: string; team_name: string; status: string; registered_at: string; submitted_at?: string | null };

type ApiDetail = {
  challenge: Challenge;
  winners: Winner[];
  myParticipation: MyParticipation;
};

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

const id = computed(() => String(route.params.id ?? ""));

const loading = ref(false);
const error = ref<string | null>(null);
const detail = ref<ApiDetail | null>(null);

const teamName = ref("");

const challenge = computed(() => detail.value?.challenge ?? null);
const winners = computed(() => detail.value?.winners ?? []);
const myParticipation = computed(() => detail.value?.myParticipation ?? null);

const phaseLabel = computed(() => {
  const p = challenge.value?.phase;
  if (p === "REGISTRATION") return "Inscriptions";
  if (p === "RUNNING") return "En cours";
  if (p === "JUDGING") return "En attente du jury";
  if (p === "FINISHED") return "Terminé";
  return "";
});

const isTeam = computed(() => challenge.value?.participation_mode === "TEAM");

const canRegister = computed(() => {
  if (!auth.isAuthenticated) return false;
  if (!auth.can("challenges:participate")) return false;
  if (!challenge.value) return false;
  return challenge.value.phase === "REGISTRATION" && !myParticipation.value;
});

const alreadyRegistered = computed(() => !!myParticipation.value);

function formatDt(v: string | null) {
  if (!v) return "";
  const d = new Date(v);
  return d.toLocaleString();
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    const token = auth.token ?? undefined;
    detail.value = await apiRequest<ApiDetail>(`/challenges/${id.value}`, { token });
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Impossible de charger le défi.";
    else error.value = "Impossible de charger le défi.";
  } finally {
    loading.value = false;
  }
}

async function register() {
  if (!challenge.value) return;

  error.value = null;
  try {
    const token = auth.token ?? undefined;

    const body =
        challenge.value.participation_mode === "TEAM"
            ? { teamName: teamName.value }
            : {};

    if (challenge.value.participation_mode === "TEAM") {
      if (!teamName.value.trim() || teamName.value.trim().length < 2) {
        error.value = "Nom d'équipe trop court (min 2 caractères).";
        return;
      }
    }

    await apiRequest(`/challenges/${challenge.value.id}/register`, {
      method: "POST",
      token,
      body,
    });

    await load(); // refresh myParticipation
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Inscription impossible";
    else error.value = "Inscription impossible";
  }
}

function goLogin() {
  router.push({ name: "login" });
}

onMounted(async () => {
  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }
  await load();
});
</script>

<template>
  <div style="max-width: 720px; margin: 0 auto; display:flex; flex-direction:column; gap:14px;">
    <div v-if="loading">
      <EmptyState title="Chargement..." description="On récupère le détail du défi." />
    </div>

    <div v-else-if="error">
      <EmptyState title="Erreur" :description="error" actionLabel="Réessayer" @action="load">
        <template #icon>⚠️</template>
      </EmptyState>

      <div v-if="!auth.isAuthenticated" style="margin-top: 12px;">
        <EmptyState
            title="Connexion requise"
            description="Connecte-toi pour voir ce défi."
            actionLabel="Se connecter"
            @action="goLogin"
        >
          <template #icon>🔒</template>
        </EmptyState>
      </div>
    </div>

    <template v-else-if="challenge">
      <BaseCard>
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <div style="min-width:0;">
            <h2 style="margin:0 0 6px;">{{ challenge.title }}</h2>
            <p style="margin:0; color: rgba(0,0,0,0.6); font-weight:700;">
              {{ challenge.description }}
            </p>
          </div>

          <div style="flex:0 0 auto; text-align:right;">
            <div style="font-weight:900; color: rgba(170,30,85,0.95);">{{ phaseLabel }}</div>
            <div style="font-size:12px; color: rgba(0,0,0,0.55); font-weight:800;">
              {{ isTeam ? "Équipe" : "Solo" }}
            </div>
          </div>
        </div>

        <div style="margin-top: 12px; display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div style="background: rgba(0,0,0,0.03); border-radius: 14px; padding: 10px 12px;">
            <div style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.55);">Points</div>
            <div style="font-size:16px; font-weight:900;">{{ challenge.points }}</div>
          </div>

          <div style="background: rgba(0,0,0,0.03); border-radius: 14px; padding: 10px 12px;">
            <div style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.55);">Durée</div>
            <div style="font-size:16px; font-weight:900;">{{ challenge.duration_min }} min</div>
          </div>
        </div>

        <div style="margin-top: 12px; font-size: 13px; color: rgba(0,0,0,0.6); font-weight:800;">
          <div v-if="challenge.start_at">Ouverture : {{ formatDt(challenge.start_at) }}</div>
          <div v-if="challenge.end_at">Fermeture : {{ formatDt(challenge.end_at) }}</div>
          <div v-if="challenge.requires_proof">Preuve requise : oui</div>
          <div v-else>Preuve requise : non</div>
        </div>

        <p v-if="error" style="margin: 10px 0 0; color: rgba(210,30,60,0.95); font-weight:900;">
          {{ error }}
        </p>

        <!-- ✅ CTA inscription -->
        <div style="margin-top: 14px;">
          <template v-if="canRegister">
            <div v-if="isTeam" style="display:flex; flex-direction:column; gap:8px;">
              <label style="display:flex; flex-direction:column; gap:6px;">
                <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Nom de l'équipe</span>
                <input
                    v-model="teamName"
                    type="text"
                    placeholder="Ex: Les Dragons"
                    style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);"
                />
              </label>

              <button
                  type="button"
                  @click="register"
                  style="width:100%; height:44px; border:none; border-radius:12px; cursor:pointer;
                       background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
                       color:white; font-weight:900;"
              >
                Créer mon équipe & m’inscrire
              </button>
            </div>

            <button
                v-else
                type="button"
                @click="register"
                style="width:100%; height:44px; border:none; border-radius:12px; cursor:pointer;
                     background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
                     color:white; font-weight:900;"
            >
              S’inscrire au défi
            </button>
          </template>

          <!-- Déjà inscrit -->
          <div v-else-if="alreadyRegistered" style="padding: 12px; border-radius: 14px; background: rgba(0,0,0,0.03);">
            <div style="font-weight:900; color: rgba(0,0,0,0.75);">
              ✅ Inscrit
              <span v-if="myParticipation?.type === 'TEAM'"> (équipe : {{ (myParticipation as any).team_name }})</span>
            </div>
            <div style="font-size:13px; color: rgba(0,0,0,0.55); font-weight:800;">
              Statut: {{ (myParticipation as any).status }}
            </div>
          </div>

          <!-- Pas connecté -->
          <div v-else-if="!auth.isAuthenticated">
            <EmptyState
                title="Connecte-toi pour t’inscrire"
                description="L’inscription au défi nécessite un compte."
                actionLabel="Se connecter"
                @action="goLogin"
            >
              <template #icon>🔒</template>
            </EmptyState>
          </div>
        </div>
      </BaseCard>

      <!-- ✅ Winners si terminé -->
      <BaseCard v-if="challenge.phase === 'FINISHED'">
        <h3 style="margin:0 0 10px;">Podium</h3>

        <div v-if="winners.length === 0">
          <EmptyState title="Pas de vainqueur affiché" description="Le podium n’a pas encore été publié." />
        </div>

        <div v-else style="display:flex; flex-direction:column; gap:10px;">
          <div
              v-for="w in winners"
              :key="w.rank"
              style="display:flex; justify-content:space-between; align-items:center;
                   padding: 10px 12px; border-radius: 14px; background: rgba(0,0,0,0.03);"
          >
            <div style="font-weight:900;">#{{ w.rank }}</div>
            <div style="font-weight:900; color: rgba(0,0,0,0.75);">
              <span v-if="w.participant_type === 'USER'">{{ w.user_display_name ?? w.user_id }}</span>
              <span v-else>{{ w.team_name ?? w.team_id }}</span>
            </div>
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>
