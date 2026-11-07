<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/AppSidebar.vue'
import AppTopbar from '@/components/AppTopbar.vue'

const route = useRoute()
const collapsed = ref(false)
const mobileOpen = ref(false)
const isMobile = ref(window.innerWidth <= 768)

function onResize() {
  isMobile.value = window.innerWidth <= 768
  if (!isMobile.value) mobileOpen.value = false
}
onMounted(() => window.addEventListener('resize', onResize))
onBeforeUnmount(() => window.removeEventListener('resize', onResize))

watch(
  () => route.fullPath,
  () => {
    mobileOpen.value = false
  }
)

const sidebarWidth = computed(() => (collapsed.value ? '72px' : 'var(--cv-sidebar-w)'))
</script>

<template>
  <div class="layout">
    <!-- 桌面端固定侧边栏 -->
    <aside v-show="!isMobile" class="layout-sidebar" :style="{ width: sidebarWidth }">
      <AppSidebar :collapsed="collapsed" />
    </aside>

    <!-- 移动端抽屉 -->
    <el-drawer v-model="mobileOpen" direction="ltr" :with-header="false" size="240px">
      <div class="drawer-sidebar">
        <AppSidebar :collapsed="false" />
      </div>
    </el-drawer>

    <div class="layout-body" :class="{ shifted: !isMobile }" :style="!isMobile ? { marginLeft: sidebarWidth } : {}">
      <AppTopbar @toggle-sidebar="collapsed = !collapsed" @open-mobile="mobileOpen = true" />
      <main class="layout-main">
        <RouterView v-slot="{ Component }">
          <transition name="fade-slide" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  height: 100%;
}
.layout-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  transition: width 0.24s ease;
}
.drawer-sidebar {
  height: 100%;
}
.layout-body {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.layout-main {
  flex: 1;
  background: var(--cv-bg);
  min-width: 0;
}
</style>
