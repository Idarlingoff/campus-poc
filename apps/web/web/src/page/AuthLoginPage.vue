<template>
  <AuthLayout>
    <template #top-right>
      <LanguageQuickSwitch v-model="lang" />
    </template>

    <div class="content">
      <BrandMark />

      <AuthRolePicker v-model="role" />

      <TermsNotice />
    </div>

    <!-- optionnel (bouton cookies comme sur la capture) -->
    <template #bottom-left>
      <button class="cookie" type="button">Manage cookies or opt out</button>
    </template>
  </AuthLayout>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import AuthLayout from "@/layouts/AuthLayout.vue";

import BrandMark from "@/components/auth/BrandMark.vue";
import LanguageQuickSwitch from "@/components/auth/LanguageQuickSwitch.vue";
import AuthRolePicker, { type AuthRole } from "@/components/auth/AuthRolePicker.vue";
import TermsNotice from "@/components/auth/TermsNotice.vue";

const lang = ref<"fr" | "en" | "es">("fr");
const role = ref<AuthRole>("mediaschool");

/**
 * Ici tu brancheras ensuite:
 * - navigation vers /challenges ou /feed selon le rôle
 * - ouverture d’un vrai écran login (SSO mediaschool, ou login simple)
 * - i18n (vue-i18n) si besoin
 */
watch(role, (r) => {
  // console.log("selected role:", r);
});
</script>

<style scoped>
  .content{
    display:flex;
    flex-direction:column;
    align-items:center;
    gap: 14px;
  }

  /* cookie button minimal */
  .cookie{
    padding: 10px 12px;
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.20);
    background: rgba(0,0,0,0.20);
    color: rgba(255,255,255,0.85);
    cursor:pointer;
    font-size: 12px;
  }
  .cookie:hover{
    background: rgba(0,0,0,0.28);
  }
</style>
