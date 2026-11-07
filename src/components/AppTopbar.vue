<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useProgressStore } from '@/stores/progress'
import { loadStats, type StudyStats } from '@/services/stats'
import { allLevels, totalLevelCount } from '@/data/courses'

defineEmits<{ (e: 'toggle-sidebar'): void; (e: 'open-mobile'): void }>()

const route = useRoute()
const router = useRouter()
const settingsStore = useSettingsStore()
const progressStore = useProgressStore()

const pageTitle = computed(() => (route.meta.title as string) ?? 'CV键知')
const keyword = ref('')
const stats = ref<StudyStats | null>(null)

const searchOptions = allLevels.map((l) => ({
  value: l.id,
  label: `${l.title}（${l.chapterId.replace('ch', '第')}章）`,
  difficulty: l.difficulty
}))

async function refreshStats() {
  stats.value = await loadStats(progressStore.progressMap)
}

onMounted(refreshStats)
watch(() => route.fullPath, refreshStats)

function onSearch(id: string) {
  if (id) {
    router.push({ name: 'level', params: { levelId: id } })
    keyword.value = ''
  }
}
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <el-button class="mobile-btn" text @click="$emit('open-mobile')">
        <el-icon :size="20"><Menu /></el-icon>
      </el-button>
      <el-button class="collapse-btn" text @click="$emit('toggle-sidebar')">
        <el-icon :size="19"><Fold v-if="!route.meta.collapsed" /><Expand /></el-icon>
      </el-button>
      <h1 class="page-title">{{ pageTitle }}</h1>
    </div>

    <div class="topbar-right">
      <el-select
        v-model="keyword"
        class="global-search"
        filterable
        clearable
        placeholder="搜索课程 / 关卡 / 函数"
        :options="searchOptions"
        @change="onSearch"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-select>

      <el-tooltip content="课程完成进度" placement="bottom">
        <div class="top-chip">
          <el-icon class="chip-icon"><CircleCheck /></el-icon>
          <span>{{ progressStore.completedCount }}/{{ totalLevelCount }} 关</span>
        </div>
      </el-tooltip>

      <el-tooltip content="累计学习时长" placement="bottom">
        <div class="top-chip">
          <el-icon class="chip-icon"><Timer /></el-icon>
          <span>{{ stats?.totalMinutes ?? 0 }} 分钟</span>
        </div>
      </el-tooltip>

      <el-tooltip :content="settingsStore.isDark ? '切换浅色' : '切换深色'" placement="bottom">
        <el-button circle text class="theme-btn" @click="settingsStore.toggleTheme()">
          <el-icon :size="19">
            <Moon v-if="!settingsStore.isDark" />
            <Sunny v-else />
          </el-icon>
        </el-button>
      </el-tooltip>

      <el-popover placement="bottom-end" :width="260" trigger="click">
        <template #reference>
          <div class="user-entry">
            <div class="avatar" :style="{ background: settingsStore.settings.avatarColor }">
              {{ settingsStore.settings.userName.slice(0, 1) }}
            </div>
            <span class="user-name">{{ settingsStore.settings.userName }}</span>
          </div>
        </template>
        <div class="profile-pop">
          <div class="pop-row">
            <el-icon><User /></el-icon><span>本地资料（无需登录）</span>
          </div>
          <el-input
            :model-value="settingsStore.settings.userName"
            maxlength="12"
            @update:model-value="(v: string) => settingsStore.update({ userName: v })"
          />
          <div class="color-row">
            <span>头像颜色</span>
            <div class="color-swatches">
              <button
                v-for="c in ['#1d4ed8', '#0ea5e9', '#06b6d4', '#7c3aed', '#dc2626', '#16a34a']"
                :key="c"
                class="swatch"
                :class="{ on: settingsStore.settings.avatarColor === c }"
                :style="{ background: c }"
                @click="settingsStore.update({ avatarColor: c })"
              />
            </div>
          </div>
          <el-button size="small" class="pop-link" text @click="router.push('/settings')">
            前往系统设置
          </el-button>
        </div>
      </el-popover>
    </div>
  </header>
</template>

<style scoped>
.topbar {
  height: var(--cv-topbar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  background: var(--cv-card);
  border-bottom: 1px solid var(--cv-border);
  gap: 14px;
}
.topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.page-title {
  font-size: 17px;
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  color: var(--cv-text);
}
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.global-search {
  width: 250px;
}
.top-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  border-radius: 999px;
  background: var(--cv-primary-soft);
  color: var(--cv-primary-deep);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}
html.dark .top-chip {
  color: #bfdbfe;
}
.chip-icon {
  font-size: 15px;
}
.theme-btn {
  font-size: 19px;
}
.user-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 999px;
}
.user-entry:hover {
  background: var(--cv-bg);
}
.avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--cv-text);
}
.profile-pop {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.pop-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--cv-text-secondary);
}
.color-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 13px;
}
.color-swatches {
  display: flex;
  gap: 8px;
}
.swatch {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid transparent;
  cursor: pointer;
}
.swatch.on {
  border-color: var(--cv-text);
}
.pop-link {
  align-self: flex-start;
}
.mobile-btn {
  display: none;
}
@media (max-width: 1100px) {
  .global-search { width: 170px; }
  .user-name { display: none; }
}
@media (max-width: 768px) {
  .mobile-btn { display: inline-flex; }
  .collapse-btn { display: none; }
  .top-chip { display: none; }
  .global-search { width: 130px; }
}
</style>
