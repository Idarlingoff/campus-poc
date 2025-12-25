<script setup lang="ts">
import BaseCard from "@/components/ui/BaseCard.vue";
import ChallengeDifficultyTag from "./ChallengeDifficultyTag.vue";
import ChallengeMetaRow from "./ChallengeMetaRow.vue";
import ChallengeLockState from "./ChallengeLockState.vue";
import RemainingTime from "./RemainingTime.vue";

export type ChallengeItem = {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  time?: string;
  points?: number;
  durationMin?: number;
  remaining?: string;
  locked?: boolean;
};

const props = defineProps<{ item: ChallengeItem }>();

defineEmits<{ (e: "open", id: number): void }>();

</script>

<template>
  <BaseCard class="card" :class="{ locked: item.locked }" @click="!item.locked && $emit('open', item.id)">
    <div class="top">
      <div class="num">{{ item.id }}</div>

      <div class="content">
        <div class="head">
          <div class="title">{{ item.title }}</div>
          <ChallengeDifficultyTag :label="item.difficulty" />
        </div>

        <div class="desc">{{ item.description }}</div>

        <ChallengeMetaRow :time="item.time" :points="item.points" :durationMin="item.durationMin" />

        <RemainingTime v-if="item.remaining && !item.locked" :value="item.remaining" />

        <ChallengeLockState v-if="item.locked" />
      </div>
    </div>
  </BaseCard>
</template>

<style scoped>
.card{
  cursor:pointer;
  transition: transform 120ms ease, opacity 120ms ease;
}
.card:hover{ transform: translateY(-1px); }

.top{ display:flex; gap: 14px; }

.num{
  width: 44px; height: 44px;
  border-radius: 999px;
  display:grid; place-items:center;
  font-weight: 900;
  color: rgba(255,255,255,0.92);
  background: linear-gradient(135deg, rgba(255,150,150,0.95), rgba(150,20,75,0.95));
  flex: 0 0 auto;
}

.content{ flex: 1; min-width: 0; }

.head{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 10px;
}
.title{
  font-weight: 900;
  color: rgba(0,0,0,0.78);
  font-size: 16px;
}
.desc{
  margin-top: 4px;
  color: rgba(0,0,0,0.55);
  font-weight: 700;
  font-size: 13px;
  line-height: 1.35;
}

.locked{
  opacity: 0.55;
  cursor: default;
}
.locked:hover{ transform:none; }
</style>
