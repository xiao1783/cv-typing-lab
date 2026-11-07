<script setup lang="ts">
import { computed } from 'vue'
import { ACHIEVEMENTS } from '@/config/achievements'
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()

const unlockedCount = computed(() =>
  ACHIEVEMENTS.filter((a) => progressStore.achievements[a.id]).length
)

function unlockedAt(id: string): number | undefined {
  return progressStore.achievements[id]?.unlockedAt
}
</script>

<template>
  <div class="cv-page">
    <h2 class="cv-page-title">成就中心</h2>
    <p class="cv-page-sub">坚持练习、提升速度与准确率即可解锁徽章，全部基于真实学习行为自动评估。</p>

    <div class="cv-card summary">
      <h3>已解锁 {{ unlockedCount }} / {{ ACHIEVEMENTS.length }} 个成就</h3>
      <el-progress :percentage="Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)" :stroke-width="12" />
    </div>

    <div class="badge-grid">
      <div
        v-for="a in ACHIEVEMENTS"
        :key="a.id"
        class="cv-card badge-card"
        :class="{ locked: !progressStore.achievements[a.id] }"
      >
        <div class="badge-icon">
          <el-icon :size="34">
            <component :is="a.icon" />
          </el-icon>
        </div>
        <h4>{{ a.title }}</h4>
        <p>{{ a.desc }}</p>
        <el-tag v-if="progressStore.achievements[a.id]" size="small" type="success" effect="dark">
          已解锁 · {{ new Date(unlockedAt(a.id)!).toLocaleDateString() }}
        </el-tag>
        <el-tag v-else size="small" type="info" effect="plain">未解锁</el-tag>
      </div>
    </div>
  </div>
</template>

<style scoped>
.summary {
  padding: 20px 24px;
  margin-bottom: 18px;
}
.summary h3 {
  margin: 0 0 12px;
  font-size: 15px;
}
.badge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}
.badge-card {
  padding: 22px 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.badge-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--cv-primary-soft);
  color: var(--cv-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.badge-card h4 {
  margin: 0;
  font-size: 15px;
}
.badge-card p {
  margin: 0;
  font-size: 12px;
  color: var(--cv-text-secondary);
  line-height: 1.6;
}
.badge-card.locked {
  opacity: 0.65;
}
.badge-card.locked .badge-icon {
  background: #f1f5f9;
  color: #94a3b8;
}
</style>
