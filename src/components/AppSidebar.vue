<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NAV_ITEMS } from '@/config/nav'
import { useProgressStore } from '@/stores/progress'
import { totalLevelCount } from '@/data/courses'

defineProps<{ collapsed: boolean }>()

const route = useRoute()
const progressStore = useProgressStore()

function isActive(routePath: string): boolean {
  if (routePath === '/home') return route.path === '/home'
  return route.path.startsWith(routePath)
}

const completionPct = computed(() =>
  totalLevelCount === 0 ? 0 : Math.round((progressStore.completedCount / totalLevelCount) * 100)
)
</script>

<template>
  <div class="sidebar" :class="{ collapsed }">
    <div class="brand">
      <div class="brand-badge">
        <span class="brand-mark">CV</span>
      </div>
      <div v-if="!collapsed" class="brand-text">
        <strong>CV键知</strong>
        <small>代码打字学习平台</small>
      </div>
    </div>

    <nav class="nav-list">
      <RouterLink
        v-for="item in NAV_ITEMS"
        :key="item.route"
        :to="item.route"
        class="nav-item"
        :class="{ active: isActive(item.route) }"
        :title="item.name"
      >
        <el-icon class="nav-icon"><component :is="item.icon" /></el-icon>
        <span v-if="!collapsed" class="nav-label">{{ item.name }}</span>
      </RouterLink>
    </nav>

    <div v-if="!collapsed" class="sidebar-footer">
      <div class="footer-head">
        <span>课程完成度</span>
        <strong>{{ completionPct }}%</strong>
      </div>
      <el-progress :percentage="completionPct" :stroke-width="6" :show-text="false" />
      <p>已完成 {{ progressStore.completedCount }} / {{ totalLevelCount }} 关</p>
    </div>
  </div>
</template>

<style scoped>
.sidebar {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(185deg, #16307a 0%, #10245c 48%, #0c1c48 100%);
  color: #cdddfb;
  overflow: hidden;
}
.sidebar::before {
  content: '';
  position: absolute;
  top: -120px;
  right: -90px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.28), transparent 70%);
  pointer-events: none;
}
.brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 20px 16px 18px;
}
.brand-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #38bdf8, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(56, 189, 248, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.35);
}
.brand-mark {
  font-family: var(--cv-mono);
  font-weight: 800;
  color: #fff;
  font-size: 15px;
}
.brand-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
}
.brand-text strong {
  color: #fff;
  font-size: 16px;
  letter-spacing: 1px;
}
.brand-text small {
  color: #93b4e8;
  font-size: 11px;
  margin-top: 1px;
}
.nav-list {
  position: relative;
  flex: 1;
  padding: 10px 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  overflow-y: auto;
}
.nav-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 13px;
  border-radius: 12px;
  color: #b9cdf2;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.09);
  color: #fff;
  transform: translateX(2px);
}
.nav-item.active {
  background: linear-gradient(100deg, rgba(56, 189, 248, 0.32), rgba(6, 182, 212, 0.16));
  color: #fff;
  font-weight: 600;
  box-shadow: 0 8px 18px rgba(8, 20, 60, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.18);
}
.nav-item.active::before {
  content: '';
  position: absolute;
  left: -3px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 20px;
  border-radius: 4px;
  background: linear-gradient(180deg, #38bdf8, #22d3ee);
  box-shadow: 0 0 10px rgba(56, 189, 248, 0.8);
}
.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}
.sidebar.collapsed .nav-item.active::before {
  display: none;
}
.sidebar-footer {
  position: relative;
  margin: 6px 12px 16px;
  padding: 14px 14px 13px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.09);
}
.footer-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #c3d4f5;
  margin-bottom: 9px;
}
.sidebar-footer p {
  margin: 9px 0 0;
  font-size: 11px;
  color: #93add8;
}
</style>
