<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    desc?: string
    icon?: string
  }>(),
  { icon: 'Document', desc: '' }
)
</script>

<template>
  <div class="empty-state">
    <div class="empty-icon">
      <el-icon :size="34"><component :is="icon" /></el-icon>
    </div>
    <h4>{{ title }}</h4>
    <p v-if="desc">{{ desc }}</p>
    <div class="empty-action">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: var(--cv-text-secondary);
}
.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--cv-primary-soft);
  color: var(--cv-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}
.empty-state h4 {
  margin: 0 0 6px;
  font-size: 16px;
  color: var(--cv-text);
}
.empty-state p {
  margin: 0 0 16px;
  max-width: 420px;
}
.empty-action {
  display: flex;
  gap: 10px;
}
</style>
