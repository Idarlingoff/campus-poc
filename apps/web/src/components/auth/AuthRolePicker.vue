<script setup lang="ts">
import AuthRoleOptionCard from "./AuthRoleOptionCard.vue";

export type AuthRole = "mediaschool" | "external";

defineProps<{ modelValue: AuthRole }>();

const emit = defineEmits<{
  (e: "update:modelValue", v: AuthRole): void;
  (e: "select", v: AuthRole): void;
}>();
</script>

<template>
  <div class="wrap">
    <AuthRoleOptionCard
        title="Membre MediaSchool"
        description="Accès complet à toutes les fonctionnalités"
        :selected="modelValue === 'mediaschool'"
        @select="emit('update:modelValue', 'mediaschool'); emit('select', 'mediaschool')"
    >
      <template #icon>👥</template>
    </AuthRoleOptionCard>

    <AuthRoleOptionCard
        title="Membre Extérieur"
        description="Accès à la carte et l'activité"
        :selected="modelValue === 'external'"
        @select="emit('update:modelValue', 'external'); emit('select', 'external')"
    >
      <template #icon>🏢</template>
    </AuthRoleOptionCard>
  </div>
</template>

<style scoped>
.wrap{
  display:flex;
  flex-direction:column;
  gap:14px;
  margin-top: 22px;
}
</style>
