<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const displayName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");

const error = ref<string | null>(null);

const isEmailValid = computed(() => {
  const v = email.value.trim();
  return !!v && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
});

function guessRoleLabel(e: string) {
  const v = e.toLowerCase().trim();
  if (v.endsWith("@mediaschool.me")) return "Étudiant (MediaSchool)";
  if (v.endsWith("@mediaschool.eu")) return "Intervenant / Équipe pédagogique";
  return "Externe";
}

const roleHint = computed(() => guessRoleLabel(email.value));

async function submit() {
  error.value = null;

  const dn = displayName.value.trim();
  const em = email.value.trim();
  const pw = password.value;
  const cpw = confirmPassword.value;

  if (!dn) {
    error.value = "Veuillez renseigner un nom affiché.";
    return;
  }
  if (!isEmailValid.value) {
    error.value = "Veuillez renseigner un email valide.";
    return;
  }
  if (!pw || pw.length < 6) {
    error.value = "Le mot de passe doit faire au moins 6 caractères.";
    return;
  }
  if (pw !== cpw) {
    error.value = "Les mots de passe ne correspondent pas.";
    return;
  }

  try {
    await auth.register({
      displayName: dn,
      email: em,
      password: pw,
    });

    router.replace("/app/feed");
  } catch (e: any) {
    error.value = auth.error ?? "Impossible de créer le compte.";
  }
}

function goBack() {
  router.push("/auth/login");
}
</script>

<template>
  <div class="card">
    <h2>Créer un compte</h2>
    <p class="hint">
      Ton rôle sera déterminé automatiquement selon ton email :
      <strong>{{ roleHint }}</strong>
    </p>

    <label class="field">
      <span>Nom affiché</span>
      <input v-model="displayName" type="text" placeholder="Ex: Alice Dupont" />
    </label>

    <label class="field">
      <span>Email</span>
      <input v-model="email" type="email" placeholder="prenom.nom@..." />
    </label>

    <label class="field">
      <span>Mot de passe</span>
      <input v-model="password" type="password" placeholder="Au moins 6 caractères" />
    </label>

    <label class="field">
      <span>Confirmer le mot de passe</span>
      <input v-model="confirmPassword" type="password" placeholder="••••••••" />
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="primary" type="button" :disabled="auth.loading" @click="submit">
      {{ auth.loading ? "Création..." : "Créer mon compte" }}
    </button>

    <button class="link" type="button" @click="goBack">Retour</button>
  </div>
</template>

<style scoped>
.card{
  width: min(520px, 92vw);
  border-radius: 18px;
  padding: 18px;
  background: rgba(255,255,255,0.92);
  box-shadow: 0 20px 50px rgba(0,0,0,0.18);
  color: rgba(0,0,0,0.85);
}

h2{ margin: 0 0 6px; }

.hint{
  margin: 0 0 14px;
  color: rgba(0,0,0,0.6);
  font-size: 13px;
}

.field{
  display:flex;
  flex-direction:column;
  gap:6px;
  margin: 12px 0;
}

.field span{
  font-size: 12px;
  font-weight: 700;
  color: rgba(0,0,0,0.65);
}

.field input{
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  outline: none;
}

.field input:focus{
  border-color: rgba(170,30,85,0.45);
}

.primary{
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
  color: white;
  font-weight: 800;
  margin-top: 10px;
}

.primary:disabled{
  opacity: 0.7;
  cursor: not-allowed;
}

.link{
  width: 100%;
  margin-top: 10px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(170,30,85,0.95);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.error{
  margin: 8px 0 0;
  color: rgba(210, 30, 60, 0.95);
  font-weight: 700;
  font-size: 13px;
}
</style>
