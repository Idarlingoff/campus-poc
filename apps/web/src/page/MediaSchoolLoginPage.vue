<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref<string | null>(null);

function isMediaSchoolEmail(e: string) {
  const v = e.toLowerCase().trim();
  return v.endsWith("@mediaschool.me") || v.endsWith("@mediaschool.eu");
}

async function submit() {
  error.value = null;

  const e = email.value.trim();
  const p = password.value;

  if (!e || !p) {
    error.value = "Veuillez renseigner l'email et le mot de passe.";
    return;
  }

  if (!isMediaSchoolEmail(e)) {
    error.value = "Veuillez utiliser un email MediaSchool (@mediaschool.me ou @mediaschool.eu).";
    return;
  }

  try {
    await auth.login({ email: e, password: p });

    router.replace("/app/feed"); // ou /app/feed selon ton routing
  } catch (err: any) {
    error.value = auth.error ?? "Identifiants invalides.";
  }
}

function goRegister() {
  router.push("/auth/register");
}
</script>

<template>
  <div class="card">
    <h2>Connexion MediaSchool</h2>
    <p class="hint">Connecte-toi avec tes identifiants MediaSchool.</p>

    <label class="field">
      <span>Email</span>
      <input v-model="email" type="email" placeholder="prenom.nom@mediaschool.me" />
    </label>

    <label class="field">
      <span>Mot de passe</span>
      <input v-model="password" type="password" placeholder="••••••••" />
    </label>

    <p v-if="error" class="error">{{ error }}</p>

    <button class="primary" type="button" :disabled="auth.loading" @click="submit">
      {{ auth.loading ? "Connexion..." : "Se connecter" }}
    </button>

    <button class="link" type="button" @click="goRegister">
      Créer un compte
    </button>
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
.hint{ margin: 0 0 14px; color: rgba(0,0,0,0.6); font-size: 13px; }

.field{ display:flex; flex-direction:column; gap:6px; margin: 12px 0; }
.field span{ font-size: 12px; font-weight: 700; color: rgba(0,0,0,0.65); }
.field input{
  height: 42px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.12);
  outline: none;
}
.field input:focus{ border-color: rgba(170,30,85,0.45); }

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