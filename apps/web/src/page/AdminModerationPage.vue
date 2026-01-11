<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";
import { useFlashStore } from "@/stores/flash";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type MainTab = "challenges" | "publications";
const mainTab = ref<MainTab>("challenges");

type Challenge = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  points: number;
  duration_min: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  phase: "REGISTRATION" | "RUNNING" | "JUDGING" | "FINISHED";
  participation_mode: "SOLO" | "TEAM";
  requires_proof: boolean;
  podium_size: number;
  start_at: string | null;
  end_at: string | null;
  rejection_reason?: string | null;
  created_at: string;
};

type ChallengeTab = "STATUS" | "PHASE" | "JUDGING";

type JudgingParticipant = {
  participant_type: "USER" | "TEAM";
  status: string;
  registered_at: string;
  submitted_at: string | null;
  user_id: string | null;
  user_display_name: string | null;
  team_id: string | null;
  team_name: string | null;
};

type JudgingSubmission = {
  id: string;
  participant_type: "USER" | "TEAM";
  user_id: string | null;
  user_display_name: string | null;
  team_id: string | null;
  team_name: string | null;
  content: string | null;
  attachments: any;
  created_at: string;
};

type JudgingWinner = {
  rank: number;
  participant_type: "USER" | "TEAM";
  user_id: string | null;
  user_display_name: string | null;
  team_id: string | null;
  team_name: string | null;
};

type JudgingBundle = {
  challenge: Challenge;
  participants: JudgingParticipant[];
  submissions: JudgingSubmission[];
  winners: JudgingWinner[];
};

type WinnerDraftLine = { rank: number; userId?: string; teamId?: string };

type ReportedPublication = {
  id: string;
  publicationId: string;
  publicationTitle: string;
  publicationContent: string;
  publicationType: string;
  authorId: string;
  authorDisplayName: string;
  reporterDisplayName: string | null;
  reason: string | null;
  createdAt: string;
  reportsCount: number;
};

const auth = useAuthStore();
const router = useRouter();
const flash = useFlashStore();

const canModerate = computed(() => auth.can("challenges:moderate"));

const challengeLoading = ref(false);
const challengeError = ref<string | null>(null);
const allChallenges = ref<Challenge[]>([]);
const challengeTab = ref<ChallengeTab>("STATUS");
const statusFilter = ref<Challenge["status"]>("PENDING");
const phaseFilter = ref<Challenge["phase"]>("REGISTRATION");
const rejectOpenId = ref<string | null>(null);
const rejectReason = ref("");
const judgingLoadingId = ref<string | null>(null);
const judgingErrorId = ref<string | null>(null);
const judgingBundles = ref<Record<string, JudgingBundle>>({});
const winnersDraft = ref<Record<string, WinnerDraftLine[]>>({});

const publicationLoading = ref(false);
const publicationError = ref<string | null>(null);
const reportedPublications = ref<ReportedPublication[]>([]);
const expandedReportId = ref<string | null>(null);
const deleteConfirmId = ref<string | null>(null);

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
  const m: Record<string, string> = { facile: "Facile", moyen: "Moyen", difficile: "Difficile" };
  return m[v] ?? v;
}

function fmtStatus(v: Challenge["status"]) {
  const m: Record<string, string> = { PENDING: "En attente", APPROVED: "Approuvé", REJECTED: "Rejeté" };
  return m[v] ?? v;
}

function fmtPhase(v: Challenge["phase"]) {
  const m: Record<string, string> = {
    REGISTRATION: "Inscriptions",
    RUNNING: "En cours",
    JUDGING: "Jugement",
    FINISHED: "Terminé",
  };
  return m[v] ?? v;
}

function fmtDate(iso: string | null | undefined) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR");
}

function fmtRelativeTime(iso: string) {
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

async function loadChallenges() {
  challengeLoading.value = true;
  challengeError.value = null;
  try {
    const token = auth.token ?? undefined;
    allChallenges.value = await apiRequest<Challenge[]>("/challenges/moderation", { token });
  } catch (e: any) {
    if (e instanceof ApiError) challengeError.value = e.body?.message ?? "Erreur chargement modération";
    else challengeError.value = "Erreur chargement modération";
  } finally {
    challengeLoading.value = false;
  }
}

const filteredChallenges = computed(() => {
  if (challengeTab.value === "STATUS") return allChallenges.value.filter(c => c.status === statusFilter.value);
  if (challengeTab.value === "PHASE") return allChallenges.value.filter(c => c.phase === phaseFilter.value);
  return allChallenges.value.filter(c => c.phase === "JUDGING");
});

async function approveChallenge(id: string) {
  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/challenges/${id}/moderate`, { method: "PATCH", token, body: { action: "approve" } });
    allChallenges.value = allChallenges.value.map(c => (c.id === id ? { ...c, status: "APPROVED", rejection_reason: null } : c));
    flash.show("Défi approuvé", "success");
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

async function rejectChallenge() {
  if (!rejectOpenId.value) return;
  if (rejectReason.value.trim().length < 3) {
    alert("Merci d'indiquer une raison (min 3 caractères).");
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
    allChallenges.value = allChallenges.value.map(c =>
      c.id === id ? { ...c, status: "REJECTED", rejection_reason: rejectReason.value.trim() } : c
    );
    cancelReject();
    flash.show("Défi rejeté", "success");
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur reject");
    else alert("Erreur reject");
  }
}

// Judging helpers
function ensureDraft(challengeId: string, podiumSize: number) {
  if (winnersDraft.value[challengeId]) return;
  winnersDraft.value[challengeId] = Array.from({ length: podiumSize }, (_, i) => ({ rank: i + 1 }));
}

function hydrateDraftFromExistingWinners(challengeId: string, podiumSize: number, winners: JudgingWinner[]) {
  ensureDraft(challengeId, podiumSize);
  const draft = winnersDraft.value[challengeId];
  if (!draft) return;
  for (const line of draft) {
    const w = winners.find(x => x.rank === line.rank);
    if (!w) continue;
    if (w.participant_type === "USER" && w.user_id) line.userId = w.user_id;
    if (w.participant_type === "TEAM" && w.team_id) line.teamId = w.team_id;
  }
}

function participantLabel(p: JudgingParticipant) {
  if (p.participant_type === "USER") return p.user_display_name ?? p.user_id ?? "Utilisateur";
  return p.team_name ?? p.team_id ?? "Équipe";
}

function submissionForParticipant(bundle: JudgingBundle | undefined, p: JudgingParticipant) {
  if (!bundle) return null;
  if (p.participant_type === "USER" && p.user_id) {
    return bundle.submissions.find(s => s.participant_type === "USER" && s.user_id === p.user_id) ?? null;
  }
  if (p.participant_type === "TEAM" && p.team_id) {
    return bundle.submissions.find(s => s.participant_type === "TEAM" && s.team_id === p.team_id) ?? null;
  }
  return null;
}

function getBundle(challengeId: string): JudgingBundle | undefined {
  return judgingBundles.value[challengeId];
}

async function loadJudgingBundle(challengeId: string) {
  judgingLoadingId.value = challengeId;
  judgingErrorId.value = null;
  try {
    const token = auth.token ?? undefined;
    const bundle = await apiRequest<JudgingBundle>(`/challenges/${challengeId}/judging`, { token });
    judgingBundles.value[challengeId] = bundle;
    hydrateDraftFromExistingWinners(challengeId, bundle.challenge.podium_size, bundle.winners);
  } catch (e: any) {
    judgingErrorId.value = challengeId;
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur chargement judging");
    else alert("Erreur chargement judging");
  } finally {
    judgingLoadingId.value = null;
  }
}

function validateWinnersDraft(challengeId: string, mode: "SOLO" | "TEAM") {
  const draft = winnersDraft.value[challengeId] ?? [];
  const picked = new Set<string>();

  for (const w of draft) {
    const id = mode === "SOLO" ? (w.userId ?? "") : (w.teamId ?? "");
    if (!id) return `Rang ${w.rank} : sélection obligatoire.`;
    if (picked.has(id)) return `Doublon : le même ${mode === "SOLO" ? "utilisateur" : "team"} est sélectionné plusieurs fois.`;
    picked.add(id);
  }
  return null;
}

async function submitWinners(challengeId: string) {
  const bundle = judgingBundles.value[challengeId];
  if (!bundle) {
    alert("Charge d'abord le dossier de jugement.");
    return;
  }

  const mode = bundle.challenge.participation_mode;
  const err = validateWinnersDraft(challengeId, mode);
  if (err) {
    alert(err);
    return;
  }

  const draft = winnersDraft.value[challengeId] ?? [];
  const winnersPayload = draft.map(w => {
    if (mode === "SOLO") return { rank: w.rank, userId: w.userId };
    return { rank: w.rank, teamId: w.teamId };
  });

  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/challenges/${challengeId}/winners`, {
      method: "POST",
      token,
      body: { winners: winnersPayload },
    });
    await loadChallenges();
    flash.show("Gagnants enregistrés ✅", "success");
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur enregistrement gagnants");
    else alert("Erreur enregistrement gagnants");
  }
}

// ======================
// PUBLICATIONS LOGIC
// ======================
async function loadReportedPublications() {
  publicationLoading.value = true;
  publicationError.value = null;
  try {
    const token = auth.token ?? undefined;
    reportedPublications.value = await apiRequest<ReportedPublication[]>("/admin/publications/reports", { token });
  } catch (e: any) {
    if (e instanceof ApiError) publicationError.value = e.body?.message ?? "Erreur chargement signalements";
    else publicationError.value = "Erreur chargement signalements";
  } finally {
    publicationLoading.value = false;
  }
}

function toggleExpandReport(id: string) {
  expandedReportId.value = expandedReportId.value === id ? null : id;
}

function openDeleteConfirm(id: string) {
  deleteConfirmId.value = id;
}

function cancelDeleteConfirm() {
  deleteConfirmId.value = null;
}

async function deletePublication(publicationId: string) {
  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/admin/publications/${publicationId}`, { method: "DELETE", token });
    reportedPublications.value = reportedPublications.value.filter(r => r.publicationId !== publicationId);
    deleteConfirmId.value = null;
    flash.show("Publication supprimée", "success");
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur suppression");
    else alert("Erreur suppression");
  }
}

async function dismissReport(reportId: string) {
  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/admin/publications/reports/${reportId}/dismiss`, { method: "POST", token });
    reportedPublications.value = reportedPublications.value.filter(r => r.id !== reportId);
    flash.show("Signalement rejeté", "success");
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur rejet signalement");
    else alert("Erreur rejet signalement");
  }
}

onMounted(async () => {
  if (auth.token && !auth.me && !auth.loading) await auth.bootstrap();
  if (!auth.isAuthenticated) return router.replace({ name: "login" });
  if (!canModerate.value) return router.replace({ name: "feed" });
  await Promise.all([loadChallenges(), loadReportedPublications()]);
});
</script>

<template>
  <div class="moderation-page">
    <h2 class="page-title">🛡️ Modération</h2>

    <!-- Main tabs -->
    <div class="main-tabs">
      <button
        type="button"
        class="main-tab-btn"
        :class="{ active: mainTab === 'challenges' }"
        @click="mainTab = 'challenges'"
      >
        <span class="tab-icon">🎯</span>
        <span>Défis</span>
        <span v-if="allChallenges.filter(c => c.status === 'PENDING').length > 0" class="badge">
          {{ allChallenges.filter(c => c.status === 'PENDING').length }}
        </span>
      </button>

      <button
        type="button"
        class="main-tab-btn"
        :class="{ active: mainTab === 'publications' }"
        @click="mainTab = 'publications'"
      >
        <span class="tab-icon">📝</span>
        <span>Publications</span>
        <span v-if="reportedPublications.length > 0" class="badge danger">
          {{ reportedPublications.length }}
        </span>
      </button>
    </div>

    <!-- CHALLENGES SECTION -->
    <template v-if="mainTab === 'challenges'">
      <BaseCard class="sub-menu-card">
        <div class="sub-menu-row">
          <button
            type="button"
            @click="challengeTab='STATUS'"
            class="sub-tab-btn"
            :class="{ active: challengeTab === 'STATUS' }"
          >
            Par statut
          </button>
          <button
            type="button"
            @click="challengeTab='PHASE'"
            class="sub-tab-btn"
            :class="{ active: challengeTab === 'PHASE' }"
          >
            Par phase
          </button>
          <button
            type="button"
            @click="challengeTab='JUDGING'"
            class="sub-tab-btn judging"
            :class="{ active: challengeTab === 'JUDGING' }"
          >
            Jugement
          </button>
          <div style="flex:1;"></div>
          <button type="button" @click="loadChallenges" class="refresh-btn">↻ Rafraîchir</button>
        </div>

        <!-- Filtres secondaires -->
        <div v-if="challengeTab === 'STATUS'" class="sub-filters">
          <span class="filter-label">Statut :</span>
          <select v-model="statusFilter" class="filter-select">
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvé</option>
            <option value="REJECTED">Rejeté</option>
          </select>
        </div>

        <div v-else-if="challengeTab === 'PHASE'" class="sub-filters">
          <span class="filter-label">Phase :</span>
          <select v-model="phaseFilter" class="filter-select">
            <option value="REGISTRATION">Inscriptions</option>
            <option value="RUNNING">En cours</option>
            <option value="JUDGING">Jugement</option>
            <option value="FINISHED">Terminé</option>
          </select>
        </div>

        <div v-else class="sub-filters">
          <span class="filter-hint">Liste des défis en phase <b>Jugement</b>. Charge le dossier pour voir les preuves et choisir le podium.</span>
        </div>
      </BaseCard>

      <!-- Loading / Error states -->
      <div v-if="challengeLoading">
        <EmptyState title="Chargement..." description="Récupération des défis." />
      </div>
      <div v-else-if="challengeError">
        <EmptyState title="Impossible de charger" :description="challengeError" actionLabel="Réessayer" @action="loadChallenges">
          <template #icon>⚠️</template>
        </EmptyState>
      </div>
      <div v-else-if="filteredChallenges.length === 0">
        <EmptyState title="Aucun défi" description="Rien à afficher pour ce filtre.">
          <template #icon>🧹</template>
        </EmptyState>
      </div>

      <!-- Challenge list -->
      <template v-else>
        <BaseCard v-for="c in filteredChallenges" :key="c.id" class="challenge-card">
          <div class="challenge-header">
            <div class="challenge-info">
              <div class="challenge-title-row">
                <div class="challenge-title">{{ c.title }}</div>
                <span class="status-badge">{{ fmtStatus(c.status) }}</span>
                <span class="phase-badge">{{ fmtPhase(c.phase) }}</span>
              </div>
              <div class="challenge-desc">{{ c.description }}</div>
              <div class="challenge-meta">
                <span>🏷️ {{ fmtCategory(c.category) }}</span>
                <span>🎚️ {{ fmtDifficulty(c.difficulty) }}</span>
                <span>⭐ {{ c.points }} pts</span>
                <span>⏱️ {{ c.duration_min }} min</span>
                <span>👥 {{ c.participation_mode === 'TEAM' ? 'Équipe' : 'Solo' }}</span>
                <span v-if="c.requires_proof">📎 Preuve requise</span>
                <span>🏆 Podium {{ c.podium_size }}</span>
                <span v-if="c.start_at || c.end_at">🕒 {{ fmtDate(c.start_at) }} → {{ fmtDate(c.end_at) }}</span>
              </div>
              <div v-if="c.status==='REJECTED' && c.rejection_reason" class="rejection-reason">
                Rejet : {{ c.rejection_reason }}
              </div>
            </div>

            <!-- Actions moderation (pending only, hors Judging) -->
            <div v-if="challengeTab !== 'JUDGING' && c.status === 'PENDING'" class="challenge-actions">
              <button type="button" @click="approveChallenge(c.id)" class="btn-approve">✅ Approuver</button>
              <button type="button" @click="openReject(c.id)" class="btn-reject">❌ Rejeter</button>
            </div>
          </div>

          <!-- Reject box -->
          <div v-if="rejectOpenId === c.id" class="reject-box">
            <div class="reject-title">Raison du rejet</div>
            <textarea
              v-model="rejectReason"
              rows="3"
              placeholder="Explique brièvement pourquoi (ex: trop vague, points incohérents...)"
              class="reject-textarea"
            />
            <div class="reject-actions">
              <button type="button" @click="cancelReject" class="btn-cancel">Annuler</button>
              <button type="button" @click="rejectChallenge" class="btn-confirm-reject">Confirmer le rejet</button>
            </div>
          </div>

          <!-- Judging box -->
          <div v-if="challengeTab === 'JUDGING'" class="judging-box">
            <div class="judging-header">
              <div class="judging-title">Dossier de jugement</div>
              <button
                type="button"
                @click="loadJudgingBundle(c.id)"
                :disabled="judgingLoadingId === c.id"
                class="btn-load-bundle"
              >
                {{ judgingLoadingId === c.id ? "Chargement..." : "Charger" }}
              </button>
            </div>

            <div v-if="getBundle(c.id)" class="judging-content">
              <div class="participants-title">Participants ({{ getBundle(c.id)!.participants.length }}) & soumissions</div>

              <div class="participants-list">
                <div
                  v-for="p in getBundle(c.id)!.participants"
                  :key="(p.participant_type==='USER' ? p.user_id : p.team_id) ?? p.registered_at"
                  class="participant-item"
                >
                  <div class="participant-header">
                    <div class="participant-name">
                      {{ participantLabel(p) }}
                      <span class="participant-type">({{ p.participant_type }})</span>
                    </div>
                    <div class="participant-dates">
                      Inscrit: {{ fmtDate(p.registered_at) }}
                      <span v-if="p.submitted_at"> • Soumis: {{ fmtDate(p.submitted_at) }}</span>
                    </div>
                  </div>
                  <div class="submission-info">
                    <template v-if="submissionForParticipant(getBundle(c.id), p)">
                      <div class="submission-label">Soumission :</div>
                      <div class="submission-content">{{ submissionForParticipant(getBundle(c.id), p)?.content || "—" }}</div>
                    </template>
                    <template v-else>Aucune soumission.</template>
                  </div>
                </div>
              </div>

              <!-- Podium selection -->
              <div class="podium-section">
                <div class="podium-title">
                  Podium ({{ getBundle(c.id)!.challenge.participation_mode === "TEAM" ? "Équipes" : "Utilisateurs" }})
                </div>

                <div v-if="winnersDraft[c.id]" class="podium-form">
                  <div
                    v-for="line in winnersDraft[c.id]"
                    :key="line.rank"
                    class="podium-line"
                  >
                    <div class="podium-rank">#{{ line.rank }}</div>
                    <select
                      v-if="getBundle(c.id)!.challenge.participation_mode === 'SOLO'"
                      v-model="line.userId"
                      class="podium-select"
                    >
                      <option value="" disabled>Choisir un utilisateur…</option>
                      <option
                        v-for="p in getBundle(c.id)!.participants.filter(x => x.participant_type==='USER' && x.user_id)"
                        :key="p.user_id!"
                        :value="p.user_id!"
                      >
                        {{ p.user_display_name ?? p.user_id }}
                      </option>
                    </select>
                    <select
                      v-else
                      v-model="line.teamId"
                      class="podium-select"
                    >
                      <option value="" disabled>Choisir une équipe…</option>
                      <option
                        v-for="p in getBundle(c.id)!.participants.filter(x => x.participant_type==='TEAM' && x.team_id)"
                        :key="p.team_id!"
                        :value="p.team_id!"
                      >
                        {{ p.team_name ?? p.team_id }}
                      </option>
                    </select>
                  </div>

                  <div class="podium-actions">
                    <button type="button" @click="submitWinners(c.id)" class="btn-submit-winners">
                      Enregistrer les gagnants
                    </button>
                  </div>

                  <div v-if="getBundle(c.id)?.winners?.length" class="winners-note">
                    Winners existants détectés : le podium a été pré-rempli.
                  </div>
                </div>

                <div v-else class="no-draft-note">
                  (Draft non initialisé — clique "Charger")
                </div>
              </div>
            </div>

            <div v-else class="no-bundle-note">
              Charge le dossier pour voir participants + soumissions + choisir le podium.
            </div>
          </div>
        </BaseCard>
      </template>
    </template>

    <!-- PUBLICATIONS SECTION -->
    <template v-if="mainTab === 'publications'">
      <BaseCard class="sub-menu-card">
        <div class="sub-menu-row">
          <div class="section-title">📋 Publications signalées</div>
          <div style="flex:1;"></div>
          <button type="button" @click="loadReportedPublications" class="refresh-btn">↻ Rafraîchir</button>
        </div>
      </BaseCard>

      <!-- Loading / Error states -->
      <div v-if="publicationLoading">
        <EmptyState title="Chargement..." description="Récupération des signalements." />
      </div>
      <div v-else-if="publicationError">
        <EmptyState title="Impossible de charger" :description="publicationError" actionLabel="Réessayer" @action="loadReportedPublications">
          <template #icon>⚠️</template>
        </EmptyState>
      </div>
      <div v-else-if="reportedPublications.length === 0">
        <EmptyState title="Aucun signalement" description="Aucune publication signalée pour le moment.">
          <template #icon>✨</template>
        </EmptyState>
      </div>

      <!-- Publications list -->
      <template v-else>
        <BaseCard v-for="report in reportedPublications" :key="report.id" class="report-card">
          <div class="report-header" @click="toggleExpandReport(report.id)">
            <div class="report-info">
              <div class="report-title-row">
                <span class="report-flag">🚩</span>
                <span class="report-pub-title">{{ report.publicationTitle }}</span>
                <span class="report-type-badge">{{ report.publicationType }}</span>
                <span v-if="report.reportsCount > 1" class="report-count-badge">
                  {{ report.reportsCount }} signalements
                </span>
              </div>
              <div class="report-meta">
                <span>👤 Auteur : <strong>{{ report.authorDisplayName }}</strong></span>
                <span>•</span>
                <span>🕒 {{ fmtRelativeTime(report.createdAt) }}</span>
                <span v-if="report.reporterDisplayName">• Signalé par : {{ report.reporterDisplayName }}</span>
              </div>
              <div v-if="report.reason" class="report-reason">
                <strong>Motif :</strong> {{ report.reason }}
              </div>
            </div>
            <div class="expand-icon">{{ expandedReportId === report.id ? '▲' : '▼' }}</div>
          </div>

          <div v-if="expandedReportId === report.id" class="report-details">
            <div class="publication-preview">
              <div class="preview-label">Contenu de la publication :</div>
              <div class="preview-content" v-html="report.publicationContent"></div>
            </div>

            <div class="report-actions">
              <button type="button" @click="dismissReport(report.id)" class="btn-dismiss">
                ✓ Rejeter le signalement
              </button>
              <button type="button" @click="openDeleteConfirm(report.id)" class="btn-delete-pub">
                🗑️ Supprimer la publication
              </button>
            </div>

            <!-- Delete confirmation -->
            <div v-if="deleteConfirmId === report.id" class="delete-confirm">
              <p>Êtes-vous sûr de vouloir supprimer cette publication ? Cette action est irréversible.</p>
              <div class="confirm-actions">
                <button type="button" @click="cancelDeleteConfirm" class="btn-cancel">Annuler</button>
                <button type="button" @click="deletePublication(report.publicationId)" class="btn-confirm-delete">
                  Confirmer la suppression
                </button>
              </div>
            </div>
          </div>
        </BaseCard>
      </template>
    </template>
  </div>
</template>

<style scoped>
.moderation-page {
  max-width: 920px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.80);
  font-size: 24px;
}

/* Main tabs */
.main-tabs {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.04);
  padding: 6px;
  border-radius: 16px;
}

.main-tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 16px;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-size: 14px;
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  cursor: pointer;
  transition: all 0.2s ease;
}

.main-tab-btn:hover {
  background: rgba(255, 255, 255, 0.5);
  color: rgba(0, 0, 0, 0.75);
}

.main-tab-btn.active {
  background: white;
  color: rgba(0, 0, 0, 0.85);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.tab-icon {
  font-size: 18px;
}

.badge {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(30, 90, 200, 0.15);
  color: rgba(30, 90, 200, 0.95);
  font-size: 12px;
  font-weight: 900;
}

.badge.danger {
  background: rgba(220, 40, 70, 0.15);
  color: rgba(200, 30, 60, 0.95);
}

/* Sub menu */
.sub-menu-card {
  padding: 12px 14px;
}

.sub-menu-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.sub-tab-btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 900;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.65);
  transition: all 0.2s ease;
}

.sub-tab-btn:hover {
  background: rgba(0, 0, 0, 0.1);
}

.sub-tab-btn.active {
  background: rgba(30, 90, 200, 0.12);
  color: rgba(30, 90, 200, 0.95);
}

.sub-tab-btn.judging.active {
  background: rgba(180, 40, 90, 0.12);
  color: rgba(180, 40, 90, 0.95);
}

.refresh-btn {
  height: 38px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}

.section-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.75);
  font-size: 15px;
}

.sub-filters {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-label {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.60);
  font-size: 12px;
}

.filter-select {
  height: 38px;
  border-radius: 12px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-weight: 800;
}

.filter-hint {
  color: rgba(0, 0, 0, 0.60);
  font-weight: 800;
  font-size: 12px;
}

/* Challenge cards */
.challenge-card {
  padding: 16px;
}

.challenge-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.challenge-info {
  flex: 1;
  min-width: 0;
}

.challenge-title-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.challenge-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.80);
  font-size: 16px;
}

.status-badge,
.phase-badge {
  font-weight: 900;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.70);
}

.challenge-desc {
  margin-top: 6px;
  color: rgba(0, 0, 0, 0.60);
  font-weight: 700;
  line-height: 1.35;
}

.challenge-meta {
  margin-top: 10px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  color: rgba(0, 0, 0, 0.60);
  font-weight: 800;
  font-size: 12px;
}

.rejection-reason {
  margin-top: 10px;
  font-weight: 900;
  color: rgba(200, 30, 60, 0.95);
}

.challenge-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 160px;
  flex: 0 0 auto;
}

.btn-approve {
  height: 40px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(40, 170, 90, 0.12);
  color: rgba(20, 120, 60, 0.95);
  font-weight: 900;
}

.btn-reject {
  height: 40px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: rgba(220, 40, 70, 0.10);
  color: rgba(200, 30, 60, 0.95);
  font-weight: 900;
}

/* Reject box */
.reject-box {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.reject-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 6px;
}

.reject-textarea {
  width: 100%;
  border-radius: 12px;
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  resize: vertical;
}

.reject-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-cancel {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}

.btn-confirm-reject {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  background: rgba(220, 40, 70, 0.95);
  color: white;
  cursor: pointer;
  font-weight: 900;
}

/* Judging box */
.judging-box {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.judging-header {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.judging-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.75);
}

.btn-load-bundle {
  height: 38px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
}

.judging-content {
  margin-top: 12px;
}

.participants-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.70);
  margin-bottom: 6px;
}

.participants-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.participant-item {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 10px 12px;
}

.participant-header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.participant-name {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.80);
}

.participant-type {
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
  margin-left: 8px;
}

.participant-dates {
  font-weight: 800;
  color: rgba(0, 0, 0, 0.55);
  font-size: 12px;
}

.submission-info {
  margin-top: 8px;
  color: rgba(0, 0, 0, 0.65);
  font-weight: 800;
  font-size: 12px;
}

.submission-label {
  margin-top: 6px;
  font-weight: 900;
  color: rgba(0, 0, 0, 0.70);
}

.submission-content {
  white-space: pre-wrap;
  font-weight: 700;
}

/* Podium */
.podium-section {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.podium-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.75);
  margin-bottom: 6px;
}

.podium-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.podium-line {
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: 10px;
  align-items: center;
}

.podium-rank {
  font-weight: 900;
}

.podium-select {
  height: 40px;
  border-radius: 12px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  font-weight: 800;
}

.podium-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.btn-submit-winners {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  background: rgba(180, 40, 90, 0.95);
  color: white;
  cursor: pointer;
  font-weight: 900;
}

.winners-note,
.no-draft-note,
.no-bundle-note {
  margin-top: 10px;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 800;
  font-size: 12px;
}

/* Publication reports */
.report-card {
  padding: 0;
  overflow: hidden;
}

.report-header {
  padding: 16px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  transition: background 0.2s ease;
}

.report-header:hover {
  background: rgba(0, 0, 0, 0.02);
}

.report-info {
  flex: 1;
  min-width: 0;
}

.report-title-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.report-flag {
  font-size: 16px;
}

.report-pub-title {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.80);
  font-size: 15px;
}

.report-type-badge {
  font-weight: 900;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.60);
}

.report-count-badge {
  font-weight: 900;
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(220, 40, 70, 0.12);
  color: rgba(200, 30, 60, 0.95);
}

.report-meta {
  margin-top: 6px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  color: rgba(0, 0, 0, 0.55);
  font-weight: 700;
  font-size: 12px;
}

.report-reason {
  margin-top: 8px;
  padding: 8px 12px;
  background: rgba(220, 40, 70, 0.06);
  border-radius: 8px;
  color: rgba(0, 0, 0, 0.70);
  font-size: 13px;
  font-weight: 700;
}

.expand-icon {
  color: rgba(0, 0, 0, 0.4);
  font-size: 12px;
}

.report-details {
  padding: 0 16px 16px 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

.publication-preview {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.03);
  border-radius: 12px;
}

.preview-label {
  font-weight: 900;
  color: rgba(0, 0, 0, 0.65);
  font-size: 12px;
  margin-bottom: 8px;
}

.preview-content {
  color: rgba(0, 0, 0, 0.75);
  font-size: 14px;
  line-height: 1.5;
}

.report-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.btn-dismiss {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: 1px solid rgba(40, 170, 90, 0.3);
  background: rgba(40, 170, 90, 0.08);
  color: rgba(20, 120, 60, 0.95);
  font-weight: 900;
  cursor: pointer;
}

.btn-delete-pub {
  height: 40px;
  padding: 0 16px;
  border-radius: 12px;
  border: none;
  background: rgba(220, 40, 70, 0.12);
  color: rgba(200, 30, 60, 0.95);
  font-weight: 900;
  cursor: pointer;
}

.delete-confirm {
  margin-top: 14px;
  padding: 14px;
  background: rgba(220, 40, 70, 0.06);
  border-radius: 12px;
  border: 1px solid rgba(220, 40, 70, 0.15);
}

.delete-confirm p {
  margin: 0 0 12px 0;
  color: rgba(0, 0, 0, 0.75);
  font-weight: 700;
}

.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-confirm-delete {
  height: 40px;
  padding: 0 14px;
  border-radius: 12px;
  border: none;
  background: rgba(220, 40, 70, 0.95);
  color: white;
  cursor: pointer;
  font-weight: 900;
}
</style>

