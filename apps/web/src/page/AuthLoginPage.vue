<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

import BrandMark from "../components/auth/BrandMark.vue";
import LanguageQuickSwitch from "../components/auth/LanguageQuickSwitch.vue";
import AuthRolePicker, { type AuthRole } from "../components/auth/AuthRolePicker.vue";
import TermsNotice from "../components/auth/TermsNotice.vue";
import { useAuthStore } from "@/stores/auth";

const auth = useAuthStore();
const router = useRouter();

const lang = ref<"fr" | "en" | "es">("fr");
const role = ref<AuthRole>("mediaschool");

function onSelectRole(r: AuthRole) {
  role.value = r;

  if (r === "mediaschool") {
    router.push("/auth/mediaschool-login");
    return;
  }

  auth.enterAsGuest();
  router.push("/feed");
}

function goTerms() {
  router.push("/auth/terms");
}
</script>

<template>
  <div class="top-right">
    <LanguageQuickSwitch v-model="lang" />
  </div>

  <div class="content">
    <BrandMark />
    <AuthRolePicker v-model="role" @select="onSelectRole" />
    <TermsNotice @open-terms="goTerms" />
  </div>

  <div class="bottom-left">
    <button class="cookie" type="button">Manage cookies or opt out</button>
  </div>
</template>

<style scoped>
.top-right{
  position: fixed;
  top: 18px;
  right: 18px;
  z-index: 10;
}

.bottom-left{
  position: fixed;
  left: 14px;
  bottom: 14px;
  z-index: 10;
}

.content{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap: 14px;
}

.cookie{
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.20);
  background: rgba(0,0,0,0.20);
  color: rgba(255,255,255,0.85);
  cursor:pointer;
  font-size: 12px;
}
.cookie:hover{ background: rgba(0,0,0,0.28); }
</style>
