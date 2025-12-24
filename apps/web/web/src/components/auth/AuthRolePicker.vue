<template>
  <div class="wrap">
    <AuthRoleOptionCard
        title="Membre MediaSchool"
        description="Accès complet à toutes les fonctionnalités"
        :selected="modelValue === 'mediaschool'"
        @select="emit('update:modelValue', 'mediaschool')"
    >
      <template #icon>👥</template>
    </AuthRoleOptionCard>

    <AuthRoleOptionCard
        title="Membre Extérieur"
        description="Accès à la carte et l'activité"
        :selected="modelValue === 'external'"
        @select="emit('update:modelValue', 'external')"
    >
      <template #icon>🏢</template>
    </AuthRoleOptionCard>
  </div>
</template>

<script setup lang="ts">
import AuthRoleOptionCard from "./AuthRoleOptionCard.vue";

export type AuthRole = "mediaschool" | "external";

defineProps<{ modelValue: AuthRole }>();

const emit = defineEmits<{
  (e: "update:modelValue", v: AuthRole): void
}>();
</script>

<style scoped>
  .wrap{
    display:flex;
    flex-direction:column;
    gap:14px;
    margin-top: 22px;
  }
</style>
