<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'

const settingsStore = useSettingsStore()
const progressStore = useProgressStore()
const ready = ref(false)

onMounted(async () => {
  await settingsStore.load()
  await progressStore.load()
  ready.value = true
})
</script>

<template>
  <div v-if="!ready" class="boot-splash">
    <div class="boot-logo">
      <span class="boot-mark">&lt;/&gt;</span>
      <div class="boot-name">CV键知</div>
    </div>
    <div class="boot-loader" />
    <p>键入代码，理解视觉</p>
  </div>
  <router-view v-else />
</template>

<style scoped>
.boot-splash {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: linear-gradient(160deg, #f5f8ff 0%, #e0f2fe 100%);
  color: var(--cv-text-secondary);
}
.boot-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.boot-mark {
  font-family: var(--cv-mono);
  font-size: 40px;
  font-weight: 800;
  background: linear-gradient(120deg, var(--cv-primary), var(--cv-cyan));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.boot-name {
  font-size: 22px;
  font-weight: 800;
  color: var(--cv-primary-deep);
  letter-spacing: 2px;
}
.boot-loader {
  width: 180px;
  height: 4px;
  border-radius: 4px;
  background: #dbeafe;
  overflow: hidden;
  position: relative;
}
.boot-loader::after {
  content: '';
  position: absolute;
  height: 100%;
  width: 60px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--cv-primary), var(--cv-cyan));
  animation: boot-slide 1s ease-in-out infinite;
}
@keyframes boot-slide {
  from { left: -60px; }
  to { left: 180px; }
}
</style>
