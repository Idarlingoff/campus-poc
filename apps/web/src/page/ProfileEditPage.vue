<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { apiRequest, ApiError } from "@/services/api";

import BaseCard from "@/components/ui/BaseCard.vue";
import EmptyState from "@/components/ui/EmptyState.vue";

type LastNameVisibility = "FULL" | "INITIAL" | "HIDDEN";
type ProfileVisibility = "CAMPUS" | "PRIVATE";

type ProfileMeResponse = {
  identity: {
    id: string;
    email: string;

    displayName: string;

    firstName: string;
    lastName: string;
    lastNameVisibility: LastNameVisibility;

    bio: string;
    city: string;
    schoolLine: string;
    sinceDate?: string | null;

    avatarText: string;
    avatarUrl?: string | null;

    birthDate?: string | null; // YYYY-MM-DD
    age?: number | null;

    showEmail: boolean;
    showBirthDate: boolean;
    showAge: boolean;

    profileVisibility: ProfileVisibility;

    socials: {
      show: boolean;
      instagramHandle: string;
      linkedinUrl: string;
      websiteUrl: string;
    };

    roles?: string[];
  };
};

const auth = useAuthStore();
const router = useRouter();

const loading = ref(false);
const saving = ref(false);
const uploading = ref(false);
const error = ref<string | null>(null);

const profile = ref<ProfileMeResponse | null>(null);

// form fields
const displayName = ref("");

const firstName = ref("");
const lastName = ref("");
const lastNameVisibility = ref<LastNameVisibility>("FULL");

const birthDate = ref(""); // YYYY-MM-DD
const showEmail = ref(false);
const showBirthDate = ref(false);
const showAge = ref(false);

const profileVisibility = ref<ProfileVisibility>("CAMPUS");

const avatarText = ref("");
const avatarUrl = ref<string | null>(null);
const avatarInputRef = ref<HTMLInputElement | null>(null);

const schoolLine = ref("");
const city = ref("");
const sinceDate = ref(""); // YYYY-MM ou YYYY-MM-DD
const bio = ref("");

const showSocials = ref(true);
const instagramHandle = ref("");
const linkedinUrl = ref("");
const websiteUrl = ref("");

const isGuest = computed(() => auth.isGuest || !auth.isAuthenticated);

function toDateInputValue(v: string | null | undefined): string {
  if (!v) return "";
  return String(v).slice(0, 10);
}

function toMonthInputValue(v: string | null | undefined): string {
  if (!v) return "";
  return String(v).slice(0, 7);
}

async function fetchMe() {
  if (!auth.token) return;
  loading.value = true;
  error.value = null;

  try {
    profile.value = await apiRequest<ProfileMeResponse>("/profile/me", { token: auth.token });
    const i = profile.value.identity;

    displayName.value = i.displayName ?? "";

    firstName.value = i.firstName ?? "";
    lastName.value = i.lastName ?? "";
    lastNameVisibility.value = i.lastNameVisibility ?? "FULL";

    birthDate.value = toDateInputValue(i.birthDate);

    showEmail.value = !!i.showEmail;
    showBirthDate.value = !!i.showBirthDate;
    showAge.value = !!i.showAge;

    profileVisibility.value = i.profileVisibility ?? "CAMPUS";

    avatarText.value = i.avatarText ?? "";
    avatarUrl.value = i.avatarUrl ?? null;

    schoolLine.value = i.schoolLine ?? "";
    city.value = i.city ?? "";
    sinceDate.value = toMonthInputValue(i.sinceDate);
    bio.value = i.bio ?? "";

    showSocials.value = i.socials?.show ?? true;
    instagramHandle.value = i.socials?.instagramHandle ?? "";
    linkedinUrl.value = i.socials?.linkedinUrl ?? "";
    websiteUrl.value = i.socials?.websiteUrl ?? "";
  } catch (e: any) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 403)) {
      auth.logout();
      router.replace({ name: "login" });
      return;
    }
    error.value = e instanceof ApiError ? (e.body?.message ?? "Erreur chargement profil") : "Erreur chargement profil";
  } finally {
    loading.value = false;
  }
}

function cancel() {
  router.push("/app/profile");
}

function triggerAvatarInput() {
  avatarInputRef.value?.click();
}

function localValidate(): string | null {
  const dn = displayName.value.trim();
  if (dn.length < 2) return "Nom d’affichage trop court (min 2).";
  if (dn.length > 40) return "Nom d’affichage trop long (max 40).";

  if (firstName.value.trim().length > 40) return "Prénom trop long (max 40).";
  if (lastName.value.trim().length > 40) return "Nom trop long (max 40).";

  if (bio.value.length > 280) return "Bio trop longue (max 280).";
  if (city.value.length > 60) return "Ville trop longue (max 60).";
  if (schoolLine.value.length > 80) return "Formation trop longue (max 80).";

  if (avatarText.value.trim().length > 3) return "Avatar texte trop long (max 3 caractères).";

  if (sinceDate.value.trim() && !/^\d{4}-\d{2}$/.test(sinceDate.value.trim())) {
    return "Date d’arrivée invalide (format YYYY-MM).";
  }

  if (birthDate.value.trim() && !/^(\d{4})-(\d{2})-(\d{2})$/.test(birthDate.value.trim())) {
    return "Date de naissance invalide (format YYYY-MM-DD).";
  }

  if (instagramHandle.value.length > 50) return "Instagram trop long (max 50).";
  if (linkedinUrl.value.length > 200) return "Lien LinkedIn trop long (max 200).";
  if (websiteUrl.value.length > 200) return "Site web trop long (max 200).";

  return null;
}

async function save() {
  const msg = localValidate();
  if (msg) {
    error.value = msg;
    return;
  }
  if (!auth.token) return;

  saving.value = true;
  error.value = null;

  const sinceDateDb = sinceDate.value.trim()
      ? `${sinceDate.value.trim()}-01`
      : "";

  try {
    await apiRequest("/profile/me", {
      method: "PATCH",
      token: auth.token,
      body: {
        displayName: displayName.value.trim(),

        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        lastNameVisibility: lastNameVisibility.value,

        birthDate: birthDate.value ? birthDate.value.trim() : "",
        showEmail: showEmail.value,
        showBirthDate: showBirthDate.value,
        showAge: showAge.value,

        profileVisibility: profileVisibility.value,

        // avatarText gardé en fallback si pas d’image
        avatarText: avatarText.value.trim(),

        schoolLine: schoolLine.value.trim(),
        city: city.value.trim(),
        sinceDate: sinceDateDb,
        bio: bio.value,

        showSocials: showSocials.value,
        instagramHandle: instagramHandle.value.trim(),
        linkedinUrl: linkedinUrl.value.trim(),
        websiteUrl: websiteUrl.value.trim(),
      },
    });

    await auth.bootstrap();
    router.push("/app/profile");
  } catch (e: any) {
    error.value = e instanceof ApiError ? (e.body?.message ?? "Erreur sauvegarde") : "Erreur sauvegarde";
  } finally {
    saving.value = false;
  }
}

// Avatar upload
async function onPickAvatar(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file || !auth.token) return;

  if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
    error.value = "Format invalide (PNG/JPEG/WEBP uniquement).";
    input.value = "";
    return;
  }
  if (file.size > 3 * 1024 * 1024) {
    error.value = "Image trop lourde (max 3MB).";
    input.value = "";
    return;
  }

  uploading.value = true;
  error.value = null;

  try {
    const fd = new FormData();
    fd.append("file", file);

    const resp = await apiRequest<{ avatarUrl: string }>("/profile/me/avatar", {
      method: "POST",
      token: auth.token,
      body: fd,
    });

    avatarUrl.value = resp.avatarUrl;
    // Optionnel : refresh complet
    // await fetchMe();
  } catch (e: any) {
    error.value = e instanceof ApiError ? (e.body?.message ?? "Erreur upload avatar") : "Erreur upload avatar";
  } finally {
    uploading.value = false;
    input.value = "";
  }
}

function removeAvatarImage() {
  avatarUrl.value = null;
  // si tu veux le supprimer côté backend, tu peux PATCH avatarUrl: "" (selon ta logique)
}

onMounted(async () => {
  if (isGuest.value) return;

  if (auth.token && !auth.me && !auth.loading) {
    await auth.bootstrap();
  }

  if (!auth.isAuthenticated) return router.replace({ name: "login" });

  await fetchMe();
});
</script>

<template>
  <div style="max-width: 760px; margin: 0 auto;">
    <div v-if="isGuest">
      <EmptyState
          icon="⛔"
          title="Édition impossible en invité"
          description="Connecte-toi pour modifier ton profil."
          actionLabel="Se connecter"
          @action="router.push({ name: 'login' })"
      />
    </div>

    <div v-else-if="loading">
      <EmptyState title="Chargement..." description="Récupération de ton profil." />
    </div>

    <div v-else-if="error && !profile">
      <EmptyState title="Impossible de charger" :description="error" actionLabel="Réessayer" @action="fetchMe">
        <template #icon>⚠️</template>
      </EmptyState>
    </div>

    <template v-else>
      <BaseCard style="padding: 14px;">
        <h2 style="margin:0 0 6px;">Modifier mon profil</h2>
        <p style="margin:0 0 14px; color: rgba(0,0,0,0.55); font-weight:700;">
          Choisis ce qui est visible sur ton profil (RGPD ✅).
        </p>

        <!-- Avatar image -->
        <div style="display:flex; gap:12px; align-items:center; margin: 8px 0 12px;">
          <div style="width:72px; height:72px; border-radius:18px; overflow:hidden; background: rgba(0,0,0,0.06); display:grid; place-items:center;">
            <img v-if="avatarUrl" :src="avatarUrl" alt="avatar" style="width:100%; height:100%; object-fit:cover;" />
            <div v-else style="font-weight:900; font-size: 22px; color: rgba(0,0,0,0.75);">
              {{ avatarText?.trim() || "🙂" }}
            </div>
          </div>

<div style="flex:1; display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <input
                ref="avatarInputRef"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="onPickAvatar"
                style="display:none"
              />
              <button
                  type="button"
                  @click="triggerAvatarInput"
                  style="display:inline-flex; align-items:center; justify-content:center; height:38px; padding:0 12px;
                  border-radius:12px; border:1px solid rgba(0,0,0,0.12); background:#fff; cursor:pointer; font-weight:900;"
              >
                {{ uploading ? "Upload..." : "📷 Changer l'avatar" }}
              </button>

              <button
                  type="button"
                  v-if="avatarUrl"
                  @click="removeAvatarImage"
                  style="height:38px; padding:0 12px; border-radius:12px; border:1px solid rgba(0,0,0,0.12); background:#fff; cursor:pointer; font-weight:900;"
              >
                Retirer l’image
              </button>
            </div>

            <label style="display:flex; flex-direction:column; gap:6px;">
              <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Fallback avatar (emoji / initiales)</span>
              <input v-model="avatarText" type="text" placeholder="Ex: JD ou 😎"
                     style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
            </label>
          </div>
        </div>

        <!-- Identity -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Prénom</span>
            <input v-model="firstName" type="text"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
          </label>

          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Nom</span>
            <input v-model="lastName" type="text"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
          </label>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:10px;">
          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Affichage du nom</span>
            <select v-model="lastNameVisibility" style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;">
              <option value="FULL">Nom complet</option>
              <option value="INITIAL">Initiale</option>
              <option value="HIDDEN">Masquer le nom</option>
            </select>
          </label>

          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Nom d’affichage (app)</span>
            <input v-model="displayName" type="text"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
          </label>
        </div>

        <!-- RGPD toggles -->
        <div style="margin-top:12px; display:flex; flex-direction:column; gap:10px;">
          <div style="font-weight:900; color: rgba(0,0,0,0.75);">Confidentialité</div>

          <label style="display:flex; align-items:center; gap:10px; font-weight:800; color: rgba(0,0,0,0.70);">
            <input type="checkbox" v-model="showEmail" />
            Afficher mon email sur mon profil
          </label>

          <label style="display:flex; align-items:center; gap:10px; font-weight:800; color: rgba(0,0,0,0.70);">
            <input type="checkbox" v-model="showBirthDate" />
            Afficher ma date de naissance
          </label>

          <label style="display:flex; align-items:center; gap:10px; font-weight:800; color: rgba(0,0,0,0.70);">
            <input type="checkbox" v-model="showAge" />
            Afficher mon âge (calculé automatiquement)
          </label>

          <label style="display:flex; flex-direction:column; gap:6px; margin-top: 2px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Date de naissance</span>
            <input
                v-model="birthDate"
                type="date"
                style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);"
            />
          </label>

          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Visibilité du profil</span>
            <select v-model="profileVisibility" style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12); font-weight:800;">
              <option value="CAMPUS">Campus</option>
              <option value="PRIVATE">Privé</option>
            </select>
          </label>
        </div>

        <!-- Campus -->
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:12px;">
          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Ville</span>
            <input v-model="city" type="text" placeholder="Ex: Paris"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
          </label>

          <label style="display:flex; flex-direction:column; gap:6px;">
            <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Arrivé depuis</span>
            <input
                v-model="sinceDate"
                type="month"
                style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);"
            />
          </label>
        </div>

        <label style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Formation</span>
          <input v-model="schoolLine" type="text" placeholder="Ex: Bachelor 3 - Web"
                 style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
        </label>

        <label style="display:flex; flex-direction:column; gap:6px; margin-top:10px;">
          <span style="font-size:12px; font-weight:900; color: rgba(0,0,0,0.65);">Bio</span>
          <textarea v-model="bio" rows="4" placeholder="Parle un peu de toi… (280 max)"
                    style="border-radius:12px; padding:10px 12px; border:1px solid rgba(0,0,0,0.12);" />
        </label>

        <!-- Socials -->
        <div style="margin-top:12px; padding-top:12px; border-top:1px solid rgba(0,0,0,0.08);">
          <label style="display:flex; align-items:center; gap:10px; font-weight:900; color: rgba(0,0,0,0.75);">
            <input type="checkbox" v-model="showSocials" />
            Afficher mes liens (réseaux / site)
          </label>

          <div style="display:grid; grid-template-columns: 1fr; gap:10px; margin-top:10px;">
            <input v-model="instagramHandle" type="text" placeholder="Instagram (ex: @pseudo)"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
            <input v-model="linkedinUrl" type="text" placeholder="LinkedIn (URL)"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
            <input v-model="websiteUrl" type="text" placeholder="Site web (URL)"
                   style="height:42px; border-radius:12px; padding:0 12px; border:1px solid rgba(0,0,0,0.12);" />
          </div>
        </div>

        <p v-if="error" style="margin: 10px 0 0; color: rgba(210,30,60,0.95); font-weight:900;">
          {{ error }}
        </p>

        <div style="display:flex; gap:10px; margin-top: 12px;">
          <button
              type="button"
              @click="cancel"
              style="flex:1; height:44px; border-radius:12px; border:1px solid rgba(0,0,0,0.12);
              background:#fff; cursor:pointer; font-weight:900;"
          >
            Annuler
          </button>

          <button
              type="button"
              :disabled="saving || uploading"
              @click="save"
              style="flex:1; height:44px; border:none; border-radius:12px; cursor:pointer;
              background: linear-gradient(135deg, rgba(255,120,140,0.95), rgba(180,40,90,0.95));
              color:white; font-weight:900;"
          >
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </BaseCard>
    </template>
  </div>
</template>