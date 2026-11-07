<script setup lang="ts">
import { computed } from 'vue'
import katex from 'katex'

const props = withDefaults(
  defineProps<{ latex: string; display?: boolean }>(),
  { display: true }
)

const html = computed(() =>
  katex.renderToString(props.latex, {
    displayMode: props.display,
    throwOnError: false,
    strict: false
  })
)
</script>

<template>
  <span class="katex-wrap" :class="{ block: display }" v-html="html" />
</template>

<style scoped>
.katex-wrap.block {
  display: flex;
  justify-content: center;
  padding: 10px 6px;
  overflow-x: auto;
}
</style>
