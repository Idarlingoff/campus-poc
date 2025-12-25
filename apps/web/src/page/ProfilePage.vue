<script setup lang="ts">
import ProfileHeroCard from "../components/profile/ProfileHeroCard.vue";
import ProfileIdentity from "../components/profile/ProfileIdentity.vue";
import ProfileStatsRow from "../components/profile/ProfileStatsRow.vue";

import ProfileProgressCard from "../components/profile/ProfileProgressCard.vue";
import LevelProgressBar from "../components/profile/LevelProgressBar.vue";

import BadgesCard from "../components/profile/BadgesCard.vue";
import BadgeGrid, { type Badge } from "../components/profile/BadgeGrid.vue";

import RecentActivityCard from "../components/profile/RecentActivityCard.vue";
import ActivityList from "../components/profile/ActivityList.vue";
import type { ActivityItem } from "../components/profile/ActivityListItem.vue";

import ProfileActionsCard from "../components/profile/ProfileActionsCard.vue";
import ProfileActionItem from "../components/profile/ProfileActionItem.vue";

import ContactInfoCard from "../components/profile/ContactInfoCard.vue";
import ContactLine from "../components/profile/ContactLine.vue";

const stats = [
  { value: 850, label: "Points totaux" },
  { value: 12, label: "Défis" },
  { value: "#23", label: "Classement actuel" },
];

const badges: Badge[] = [
  { title: "Early Bird", description: "Premier défi complété", icon: "🌅", unlocked: true },
  { title: "Globe Trotter", description: "5 campus visités", icon: "🌍", unlocked: true },
  { title: "Créatif", description: "10 défis créatifs", icon: "🎨", unlocked: true },
  { title: "Social Star", description: "50 partages", icon: "⭐", unlocked: false },
  { title: "Marathonien", description: "Tous les défis d'une journée", icon: "🏃", unlocked: true },
  { title: "Ambassadeur", description: "5 défis proposés validés", icon: "🎖️", unlocked: false },
];

const activity: ActivityItem[] = [
  { icon: "◎", title: "Photo du campus", meta: "2h · ECS Paris", points: 100 },
  { icon: "🏅", title: 'Badge "Créatif" obtenu', meta: "5h", points: undefined },
  { icon: "◎", title: "Interview étudiant", meta: "1j · SUPDEWEB Lyon", points: 150 },
  { icon: "⭐", title: "Défi proposé validé", meta: "2j", points: 50 },
];
</script>

<template>
    <ProfileHeroCard :showEdit="true" @edit="console.log('edit')">
      <ProfileIdentity
          name="Sophie Martin"
          schoolLine="ECS Paris · Master 1"
          bio="Passionnée de communication digitale et de voyages 🌍"
          city="Paris"
          since="Septembre 2023"
          avatarText="👩‍🎓"
      />
      <ProfileStatsRow :stats="stats" />
    </ProfileHeroCard>

    <ProfileProgressCard rightLabel="Top 5%">
      <LevelProgressBar
          :current="850"
          :max="1000"
          hint="Encore 150 points pour passer au niveau supérieur 🎯"
      />
    </ProfileProgressCard>

    <BadgesCard countLabel="4/6">
      <BadgeGrid :badges="badges" />
    </BadgesCard>

    <RecentActivityCard>
      <ActivityList :items="activity" />
    </RecentActivityCard>

    <ProfileActionsCard>
      <ProfileActionItem icon="👤" label="Modifier le profil" @click="console.log('edit profile')" />
      <ProfileActionItem icon="🔗" label="Partager mon profil" @click="console.log('share')" />
      <ProfileActionItem icon="⚙️" label="Paramètres" @click="console.log('settings')" />
      <ProfileActionItem icon="⎋" label="Déconnexion" danger @click="console.log('logout')" />
    </ProfileActionsCard>

    <ContactInfoCard>
      <ContactLine icon="✉️" label="Email" value="sophie.martin@ecs-paris.com" />
    </ContactInfoCard>
</template>
