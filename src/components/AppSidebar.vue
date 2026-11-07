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
  height: 100%;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, var(--cv-primary-deep) 0%, #14306b 100%);
  color: #cdddfb;
  overflow: hidden;
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 16px;
}
.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #38bdf8, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
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
}
.nav-list {
  flex: 1;
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  overflow-y: auto;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 12px;
  border-radius: 10px;
  color: #c2d4f4;
  font-size: 14px;
  white-space: nowrap;
  transition: background 0.18s ease, color 0.18s ease;
}
.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}
.nav-item.active {
  background: linear-gradient(90deg, rgba(56, 189, 248, 0.28), rgba(6, 182, 212, 0.18));
  color: #fff;
  box-shadow: inset 3px 0 0 #38bdf8;
}
.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
}
.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 10px;
}
.sidebar-footer {
  padding: 14px 16px 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.footer-head {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #b9cdf0;
  margin-bottom: 8px;
}
.sidebar-footer p {
  margin: 8px 0 0;
  font-size: 11px;
  color: #8faad6;
}
</style>
