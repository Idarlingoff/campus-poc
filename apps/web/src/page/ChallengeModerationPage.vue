<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

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

type Tab = "STATUS" | "PHASE" | "JUDGING";

/** ✅ Bundle /challenges/:id/judging */
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

const auth = useAuthStore();
const router = useRouter();

const canModerate = computed(() => auth.can("challenges:moderate"));

const loading = ref(false);
const error = ref<string | null>(null);

const all = ref<Challenge[]>([]);

const tab = ref<Tab>("STATUS");
const statusFilter = ref<Challenge["status"]>("PENDING");
const phaseFilter = ref<Challenge["phase"]>("REGISTRATION");

const rejectOpenId = ref<string | null>(null);
const rejectReason = ref("");

const judgingLoadingId = ref<string | null>(null);
const judgingErrorId = ref<string | null>(null);
const judgingBundles = ref<Record<string, JudgingBundle>>({});

const winnersDraft = ref<Record<string, WinnerDraftLine[]>>({});

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
  return d.toLocaleString();
}

async function loadAll() {
  loading.value = true;
  error.value = null;
  try {
    const token = auth.token ?? undefined;
    all.value = await apiRequest<Challenge[]>("/challenges/moderation", { token });
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Erreur chargement modération";
    else error.value = "Erreur chargement modération";
  } finally {
    loading.value = false;
  }
}

const filtered = computed(() => {
  if (tab.value === "STATUS") return all.value.filter(c => c.status === statusFilter.value);
  if (tab.value === "PHASE") return all.value.filter(c => c.phase === phaseFilter.value);
  return all.value.filter(c => c.phase === "JUDGING");
});

async function approve(id: string) {
  try {
    const token = auth.token ?? undefined;
    await apiRequest(`/challenges/${id}/moderate`, { method: "PATCH", token, body: { action: "approve" } });
    all.value = all.value.map(c => (c.id === id ? { ...c, status: "APPROVED", rejection_reason: null } : c));
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
    all.value = all.value.map(c =>
        c.id === id ? { ...c, status: "REJECTED", rejection_reason: rejectReason.value.trim() } : c
    );
    cancelReject();
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur reject");
    else alert("Erreur reject");
  }
}

/** ---------- Judging helpers ---------- */

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

    // initialise draft + hydrate winners existants
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
    alert("Charge d’abord le dossier de jugement.");
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

    // reload list + refresh bundle (phase FINISHED)
    await loadAll();
    if (tab.value === "JUDGING") {
    }

    alert("Gagnants enregistrés ✅");
  } catch (e: any) {
    if (e instanceof ApiError) alert(e.body?.message ?? "Erreur enregistrement gagnants");
    else alert("Erreur enregistrement gagnants");
  }
}

onMounted(async () => {
  if (auth.token && !auth.me && !auth.loading) await auth.bootstrap();
  if (!auth.isAuthenticated) return router.replace({ name: "login" });
  if (!canModerate.value) return router.replace({ name: "feed" });
  await loadAll();
});
</script>

<template>
  <div style="max-width: 920px; margin: 0 auto; display:flex; flex-direction:column; gap: 12px;">
    <h2 style="margin:0; font-weight: 900; color: rgba(0,0,0,0.80);">Modération des défis</h2>

    <!-- Sous-menu -->
    <BaseCard style="padding: 10px;">
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button
            type="button"
            @click="tab='STATUS'"
            :style="{
            height:'38px', padding:'0 12px', borderRadius:'12px', border:'none', cursor:'pointer',
            fontWeight:'900',
            background: tab==='STATUS' ? 'rgba(30,90,200,0.12)' : 'rgba(0,0,0,0.06)',
            color: tab==='STATUS' ? 'rgba(30,90,200,0.95)' : 'rgba(0,0,0,0.65)'
          }"
        >
          Par statut
        </button>

        <button
            type="button"
            @click="tab='PHASE'"
            :style="{
            height:'38px', padding:'0 12px', borderRadius:'12px', border:'none', cursor:'pointer',
            fontWeight:'900',
            background: tab==='PHASE' ? 'rgba(30,90,200,0.12)' : 'rgba(0,0,0,0.06)',
            color: tab==='PHASE' ? 'rgba(30,90,200,0.95)' : 'rgba(0,0,0,0.65)'
          }"
        >
          Par phase
        </button>

        <button
            type="button"
            @click="tab='JUDGING'"
            :style="{
            height:'38px', padding:'0 12px', borderRadius:'12px', border:'none', cursor:'pointer',
            fontWeight:'900',
            background: tab==='JUDGING' ? 'rgba(180,40,90,0.12)' : 'rgba(0,0,0,0.06)',
            color: tab==='JUDGING' ? 'rgba(180,40,90,0.95)' : 'rgba(0,0,0,0.65)'
          }"
        >
          Jugement
        </button>

        <div style="flex:1;"></div>

        <button
            type="button"
            @click="loadAll"
            style="height:38px; padding:0 12px; border-radius:12px; border:1px solid rgba(0,0,0,0.12);
            background:#fff; cursor:pointer; font-weight:900;"
        >
          ↻ Rafraîchir
        </button>
      </div>

      <!-- Filtres secondaires -->
      <div v-if="tab==='STATUS'" style="margin-top: 10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <span style="font-weight:900; color: rgba(0,0,0,0.60); font-size: 12px;">Statut :</span>
        <select v-model="statusFilter" style="height:38px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;">
          <option value="PENDING">En attente</option>
          <option value="APPROVED">Approuvé</option>
          <option value="REJECTED">Rejeté</option>
        </select>
      </div>

      <div v-else-if="tab==='PHASE'" style="margin-top: 10px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <span style="font-weight:900; color: rgba(0,0,0,0.60); font-size: 12px;">Phase :</span>
        <select v-model="phaseFilter" style="height:38px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;">
          <option value="REGISTRATION">Inscriptions</option>
          <option value="RUNNING">En cours</option>
          <option value="JUDGING">Jugement</option>
          <option value="FINISHED">Terminé</option>
        </select>
      </div>

      <div v-else style="margin-top: 10px; color: rgba(0,0,0,0.60); font-weight:800; font-size: 12px;">
        Liste des défis en phase <b>Jugement</b>. Charge le dossier pour voir les preuves et choisir le podium.
      </div>
    </BaseCard>

    <!-- states -->
    <div v-if="loading">
      <EmptyState title="Chargement..." description="Récupération des défis." />
    </div>

    <div v-else-if="error">
      <EmptyState title="Impossible de charger" :description="error" actionLabel="Réessayer" @action="loadAll">
        <template #icon>⚠️</template>
      </EmptyState>
    </div>

    <div v-else-if="filtered.length === 0">
      <EmptyState title="Aucun défi" description="Rien à afficher pour ce filtre.">
        <template #icon>🧹</template>
      </EmptyState>
    </div>

    <!-- list -->
    <template v-else>
      <BaseCard v-for="c in filtered" :key="c.id" style="padding: 14px;">
        <div style="display:flex; justify-content:space-between; gap:12px; align-items:flex-start;">
          <div style="flex:1; min-width:0;">
            <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
              <div style="font-weight: 900; color: rgba(0,0,0,0.80); font-size: 16px;">
                {{ c.title }}
              </div>

              <span style="font-weight:900; font-size: 12px; padding:4px 10px; border-radius:999px; background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.70);">
                {{ fmtStatus(c.status) }}
              </span>

              <span style="font-weight:900; font-size: 12px; padding:4px 10px; border-radius:999px; background: rgba(0,0,0,0.06); color: rgba(0,0,0,0.70);">
                {{ fmtPhase(c.phase) }}
              </span>
            </div>

            <div style="margin-top: 6px; color: rgba(0,0,0,0.60); font-weight:700; line-height:1.35;">
              {{ c.description }}
            </div>

            <div style="margin-top: 10px; display:flex; gap:10px; flex-wrap:wrap; color: rgba(0,0,0,0.60); font-weight:800; font-size: 12px;">
              <span>🏷️ {{ fmtCategory(c.category) }}</span>
              <span>🎚️ {{ fmtDifficulty(c.difficulty) }}</span>
              <span>⭐ {{ c.points }} pts</span>
              <span>⏱️ {{ c.duration_min }} min</span>
              <span>👥 {{ c.participation_mode === 'TEAM' ? 'Équipe' : 'Solo' }}</span>
              <span v-if="c.requires_proof">📎 Preuve requise</span>
              <span>🏆 Podium {{ c.podium_size }}</span>
              <span v-if="c.start_at || c.end_at">🕒 {{ fmtDate(c.start_at) }} → {{ fmtDate(c.end_at) }}</span>
            </div>

            <div v-if="c.status==='REJECTED' && c.rejection_reason" style="margin-top:10px; font-weight:900; color: rgba(200,30,60,0.95);">
              Rejet : {{ c.rejection_reason }}
            </div>
          </div>

          <!-- Actions moderation (pending only, hors Judging) -->
          <div v-if="tab !== 'JUDGING' && c.status === 'PENDING'"
               style="display:flex; flex-direction:column; gap:8px; width: 160px; flex:0 0 auto;">
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
          <div style="font-weight:900; color: rgba(0,0,0,0.75); margin-bottom:6px;">Raison du rejet</div>
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

        <!-- Judging box -->
        <div v-if="tab==='JUDGING'" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08);">
          <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap;">
            <div style="font-weight:900; color: rgba(0,0,0,0.75);">
              Dossier de jugement
            </div>

            <button
                type="button"
                @click="loadJudgingBundle(c.id)"
                :disabled="judgingLoadingId===c.id"
                style="height: 38px; padding:0 12px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.12);
                background:#fff; cursor:pointer; font-weight:900;"
            >
              {{ judgingLoadingId===c.id ? "Chargement..." : "Charger" }}
            </button>
          </div>

          <div v-if="getBundle(c.id)" style="margin-top: 12px;">
            <div style="font-weight:900; color: rgba(0,0,0,0.70); margin-bottom: 6px;">
              Participants ({{ getBundle(c.id)!.participants.length }}) & soumissions
            </div>

            <div style="display:flex; flex-direction:column; gap:10px;">
              <div
                  v-for="p in getBundle(c.id)!.participants"
                  :key="(p.participant_type==='USER' ? p.user_id : p.team_id) ?? p.registered_at"
                  style="border: 1px solid rgba(0,0,0,0.08); border-radius: 12px; padding: 10px 12px;"
              >
                <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
                  <div style="font-weight:900; color: rgba(0,0,0,0.80);">
                    {{ participantLabel(p) }}
                    <span style="font-weight:800; color: rgba(0,0,0,0.55); font-size: 12px; margin-left:8px;">
                      ({{ p.participant_type }})
                    </span>
                  </div>
                  <div style="font-weight:800; color: rgba(0,0,0,0.55); font-size: 12px;">
                    Inscrit: {{ fmtDate(p.registered_at) }}
                    <span v-if="p.submitted_at"> • Soumis: {{ fmtDate(p.submitted_at) }}</span>
                  </div>
                </div>

                <div style="margin-top: 8px; color: rgba(0,0,0,0.65); font-weight:800; font-size: 12px;">
                  <template v-if="submissionForParticipant(getBundle(c.id), p)">
                    <div style="margin-top: 6px; font-weight:900; color: rgba(0,0,0,0.70);">Soumission :</div>
                    <div style="white-space:pre-wrap; font-weight:700;">
                      {{ submissionForParticipant(getBundle(c.id), p)?.content || "—" }}
                    </div>
                  </template>
                  <template v-else>
                    Aucune soumission.
                  </template>
                </div>
              </div>
            </div>

            <!-- Podium selection -->
            <div style="margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.08);">
              <div style="font-weight:900; color: rgba(0,0,0,0.75); margin-bottom: 6px;">
                Podium ({{ getBundle(c.id)!.challenge.participation_mode === "TEAM" ? "Équipes" : "Utilisateurs" }})
              </div>

              <div v-if="winnersDraft[c.id]" style="display:flex; flex-direction:column; gap:10px;">
                <div
                    v-for="line in winnersDraft[c.id]"
                    :key="line.rank"
                    style="display:grid; grid-template-columns: 80px 1fr; gap:10px; align-items:center;"
                >
                  <div style="font-weight:900;">#{{ line.rank }}</div>

                  <select
                      v-if="getBundle(c.id)!.challenge.participation_mode === 'SOLO'"
                      v-model="line.userId"
                      style="height:40px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;"
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
                      style="height:40px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;"
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

                <div style="display:flex; justify-content:flex-end; gap:10px; margin-top: 8px;">
                  <button
                      type="button"
                      @click="submitWinners(c.id)"
                      style="height: 40px; padding:0 14px; border-radius: 12px; border:none;
                      background: rgba(180,40,90,0.95); color:white; cursor:pointer; font-weight:900;"
                  >
                    Enregistrer les gagnants
                  </button>
                </div>

                <div v-if="getBundle(c.id)?.winners?.length" style="margin-top: 10px; color: rgba(0,0,0,0.55); font-weight:800; font-size: 12px;">
                  Winners existants détectés : le podium a été pré-rempli.
                </div>
              </div>

              <div v-else style="color: rgba(0,0,0,0.60); font-weight:800; font-size: 12px;">
                (Draft non initialisé — clique "Charger")
              </div>
            </div>
          </div>

          <div v-else style="margin-top: 10px; color: rgba(0,0,0,0.60); font-weight:800; font-size: 12px;">
            Charge le dossier pour voir participants + soumissions + choisir le podium.
          </div>
        </div>
      </BaseCard>
    </template>
  </div>
</template>