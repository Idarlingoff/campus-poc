<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

const router = useRouter();
const auth = useAuthStore();

const canCreate = computed(() => auth.can("challenges:create") && auth.isAuthenticated);
const loading = ref(false);
const error = ref<string | null>(null);

const title = ref("");
const description = ref("");

const category = ref<"creation"|"nourriture"|"photo"|"groupe"|"style"|"autre">("creation");
const difficulty = ref<"facile"|"moyen"|"difficile">("moyen");
const points = ref(100);
const durationMin = ref(120);

async function submit() {
  error.value = null;

  if (!title.value.trim() || title.value.trim().length < 3) {
    error.value = "Titre trop court (min 3 caractères).";
    return;
  }
  if (!description.value.trim() || description.value.trim().length < 10) {
    error.value = "Description trop courte (min 10 caractères).";
    return;
  }

  loading.value = true;
  try {
    await apiRequest("/challenges", {
      method: "POST",
      token: auth.token ?? undefined,
      body: {
        title: title.value,
        description: description.value,
        category: category.value,
        difficulty: difficulty.value,
        points: points.value,
        durationMin: durationMin.value,
      },
    });

    // pending direct => feedback + redirection
    router.push("/app/challenges");
  } catch (e: any) {
    if (e instanceof ApiError) error.value = e.body?.message ?? "Erreur création défi";
    else error.value = "Erreur création défi";
  } finally {
    loading.value = false;
  }
}

function goLogin() {
  router.push({ name: "login" });
}
</script>

<template>
  <!-- Pas le droit -->
  <div v-if="!canCreate" style="max-width: 720px; margin: 0 auto;">
    <EmptyState
        title="Tu n’as pas accès à la proposition de défi"
        description="Connecte-toi ou demande l’accès si tu fais partie d’un rôle autorisé."
        :actionLabel="auth.isAuthenticated ? 'Retour aux défis' : 'Se connecter'"
        @action="auth.isAuthenticated ? router.push('/app/challenges') : goLogin()"
    >
      <template #icon>⛔</template>
    </EmptyState>
  </div>

  <!-- Form -->
  <div v-else style="max-width: 720px; margin: 0 auto;">
    <BaseCard>
      <h2 style="margin:0 0 6px;">Proposer un défi</h2>
      <p style="margin:0 0 14px; color: rgba(0,0,0,0.55); font-weight:700;">
        Ton défi sera soumis à validation avant publication.
      </p>

      <label style="display:flex; flex-direction:column; gap:6px; margin: 10px 0;">
        <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Titre</span>
        <input v-model="title" type="text" placeholder="Ex: Cocktail le plus moche"
               style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
      </label>

      <label style="display:flex; flex-direction:column; gap:6px; margin: 10px 0;">
        <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Description</span>
        <textarea v-model="description" rows="4" placeholder="Décris les règles, preuves demandées..."
                  style="border-radius:12px; padding:10px 12px; border:1px solid rgba(0,0,0,0.12);"></textarea>
      </label>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Catégorie</span>
          <select v-model="category" style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);">
            <option value="creation">Création</option>
            <option value="nourriture">Nourriture</option>
            <option value="photo">Photo</option>
            <option value="groupe">Groupe</option>
            <option value="style">Style</option>
            <option value="autre">Autre</option>
          </select>
        </label>

        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Difficulté</span>
          <select v-model="difficulty" style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);">
            <option value="facile">Facile</option>
            <option value="moyen">Moyen</option>
            <option value="difficile">Difficile</option>
          </select>
        </label>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top:10px;">
        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Points</span>
          <input v-model.number="points" type="number" min="0" max="5000"
                 style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
        </label>

        <label style="display:flex; flex-direction:column; gap:6px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Durée (min)</span>
          <input v-model.number="durationMin" type="number" min="5" max="1440"
                 style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
        </label>
      </div>

      <p v-if="error" style="margin: 10px 0 0; color: rgba(210,30,60,0.95); font-weight:900;">
        {{ error }}
      </p>

      <button
          type="button"
          :disabled="loading"
          @click="submit"
          style="margin-top: 12px; width:100%; height:44px; border:none; border-radius:12px; cursor:pointer;
               background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
               color:white; font-weight:900;"
      >
        {{ loading ? "Envoi..." : "Soumettre à validation" }}
      </button>
    </BaseCard>
  </div>
</template>
