<template>
  <Drawer v-model="open" side="right" @close="$emit('close')">
    <template #header>
      <div class="header-row">
        <div class="h-title"> </div>
        <button class="close" type="button" @click="open = false" aria-label="Fermer">✕</button>
      </div>
    </template>

    <MenuUserHeader :name="user.name" :email="user.email" />

    <MenuList>
      <MenuItemWithBadge icon="🏆" label="Mes points" :badge="String(user.points)" @click="$emit('go', 'points')" />
      <MenuItem icon="👥" label="Groupes" @click="$emit('go', 'groups')" />
      <MenuItem icon="👤" label="Mon profil" @click="$emit('go', 'profile')" />

      <MenuHighlightCard
          title="Espace Pro"
          subtitle="Accès entreprises"
          badge="NEW"
          @click="$emit('go', 'pro-space')"
      />

      <MenuItem icon="⚙️" label="Paramètres" @click="$emit('go', 'settings')" />
      <MenuItem icon="❓" label="Aide" @click="$emit('go', 'help')" />

      <MenuShareCard title="Partager l'app" subtitle="Invite tes amis" @click="$emit('go', 'share')" />

      <div class="divider" />

      <LanguageSelector v-model="lang" />
    </MenuList>

    <div class="divider" />

    <LogoutButton @click="$emit('logout')" />
  </Drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Drawer from "@/components/ui/Drawer.vue";
import MenuUserHeader from "./MenuUserHeader.vue";
import MenuList from "./MenuList.vue";
import MenuItem from "./MenuItem.vue";
import MenuItemWithBadge from "./MenuItemWithBadge.vue";
import MenuHighlightCard from "./MenuHighlightCard.vue";
import MenuShareCard from "./MenuShareCard.vue";
import LanguageSelector from "./LanguageSelector.vue";
import LogoutButton from "./LogoutButton.vue";

type Lang = "fr" | "en" | "es";

const props = defineProps<{
  modelValue: boolean;
  user?: { name: string; email: string; points: number };
  language?: Lang;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", v: boolean): void;
  (e: "close"): void;
  (e: "go", key: string): void;
  (e: "logout"): void;
  (e: "update:language", v: Lang): void;
}>();

const open = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit("update:modelValue", v),
});

const user = computed(() => props.user ?? ({ name: "Étudiant MediaSchool", email: "Email", points: 1250 }));
const lang = computed({
  get: () => props.language ?? "fr",
  set: (v: Lang) => emit("update:language", v),
});
</script>

<style scoped>
  .header-row{
    display:flex;
    align-items:center;
    justify-content:space-between;
  }
  .close{
    border:none;
    background: transparent;
    cursor:pointer;
    font-size: 20px;
    color: rgba(0,0,0,0.65);
  }
  .divider{
    height: 1px;
    background: rgba(0,0,0,0.06);
    margin: 14px 0;
  }
</style>
