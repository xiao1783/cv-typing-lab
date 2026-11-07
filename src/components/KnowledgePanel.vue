<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Level } from '@/data/types'
import KatexFormula from '@/components/KatexFormula.vue'

const props = defineProps<{ level: Level }>()
const router = useRouter()
const k = props.level.knowledge
</script>

<template>
  <div class="knowledge">
    <section class="cv-card k-block">
      <h3 class="cv-section-title">功能概述</h3>
      <p>{{ k.overview }}</p>
    </section>

    <section class="cv-card k-block">
      <h3 class="cv-section-title">完整代码</h3>
      <pre class="cv-codeblock">{{ level.targetCode }}</pre>
    </section>

    <section v-if="k.lineExplanations.length" class="cv-card k-block">
      <h3 class="cv-section-title">逐行讲解</h3>
      <div class="line-list">
        <div v-for="(item, i) in k.lineExplanations" :key="i" class="line-item">
          <code>{{ item.code }}</code>
          <p>{{ item.explain }}</p>
        </div>
      </div>
    </section>

    <section v-if="k.pythonNotes.length" class="cv-card k-block">
      <h3 class="cv-section-title">Python 语法知识</h3>
      <ul class="dot-list">
        <li v-for="(n, i) in k.pythonNotes" :key="i">{{ n }}</li>
      </ul>
    </section>

    <section v-if="k.apiDocs.length" class="cv-card k-block">
      <h3 class="cv-section-title">OpenCV 函数说明</h3>
      <div v-for="(api, i) in k.apiDocs" :key="i" class="api-doc">
        <div class="api-head">
          <code class="api-sig">{{ api.signature }}</code>
        </div>
        <p v-if="api.returns" class="api-return">返回值：{{ api.returns }}</p>
        <el-table :data="api.params" size="small" border class="api-table">
          <el-table-column prop="name" label="参数" width="150" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="desc" label="说明" />
          <el-table-column prop="default" label="默认值" width="140">
            <template #default="{ row }">{{ row.default ?? '—' }}</template>
          </el-table-column>
        </el-table>
      </div>
    </section>

    <section v-if="k.formulas.length" class="cv-card k-block">
      <h3 class="cv-section-title">数学原理与公式</h3>
      <div v-for="(f, i) in k.formulas" :key="i" class="formula-item">
        <p class="formula-title">{{ f.title }}</p>
        <KatexFormula :latex="f.latex" />
      </div>
    </section>

    <section class="cv-card k-block">
      <h3 class="cv-section-title">算法执行流程</h3>
      <el-steps :active="k.flow.length" align-center>
        <el-step v-for="(step, i) in k.flow" :key="i" :title="step" />
      </el-steps>
    </section>

    <div class="two-col">
      <section class="cv-card k-block">
        <h3 class="cv-section-title">典型应用场景</h3>
        <ul class="dot-list">
          <li v-for="(s, i) in k.scenarios" :key="i">{{ s }}</li>
        </ul>
      </section>
      <section class="cv-card k-block">
        <h3 class="cv-section-title">科研应用拓展</h3>
        <ul class="dot-list">
          <li v-for="(r, i) in k.research" :key="i">{{ r }}</li>
        </ul>
      </section>
    </div>

    <section v-if="k.pitfalls.length" class="cv-card k-block">
      <h3 class="cv-section-title">常见错误及解决方法</h3>
      <el-collapse>
        <el-collapse-item v-for="(p, i) in k.pitfalls" :key="i" :name="i">
          <template #title>
            <span class="pitfall-problem">{{ p.problem }}</span>
          </template>
          <p class="pitfall-fix">{{ p.fix }}</p>
        </el-collapse-item>
      </el-collapse>
    </section>

    <section class="cv-card k-block k-actions">
      <div>
        <h3 class="cv-section-title">巩固与推荐</h3>
        <div class="related">
          <RouterLink v-for="rid in k.related" :key="rid" :to="`/level/${rid}`" class="related-link">
            <el-icon><Link /></el-icon>{{ rid }}
          </RouterLink>
        </div>
      </div>
      <el-button type="primary" @click="router.push(`/quiz/${level.id}`)">
        <el-icon><EditPen /></el-icon>前往巩固测试
      </el-button>
    </section>
  </div>
</template>

<style scoped>
.knowledge {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.k-block {
  padding: 20px;
}
.k-block p {
  margin: 0;
  color: var(--cv-text-regular);
}
.line-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.line-item code {
  display: block;
  background: var(--cv-bg);
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 13px;
  color: var(--cv-primary-deep);
  margin-bottom: 4px;
}
.line-item p {
  font-size: 13px;
}
.dot-list {
  margin: 0;
  padding-left: 20px;
}
.dot-list li {
  margin-bottom: 6px;
  color: var(--cv-text-regular);
}
.api-doc {
  margin-bottom: 16px;
}
.api-sig {
  font-size: 13px;
  color: var(--cv-primary);
  background: var(--cv-primary-soft);
  padding: 8px 12px;
  border-radius: 8px;
  display: inline-block;
}
.api-return {
  font-size: 12px;
  margin: 8px 0;
}
.api-table {
  margin-top: 8px;
}
.formula-item {
  margin-bottom: 10px;
}
.formula-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--cv-text);
  text-align: center;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.pitfall-problem {
  font-weight: 600;
  color: var(--cv-danger);
}
.pitfall-fix {
  color: var(--cv-text-regular);
  margin: 0;
}
.k-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
}
.related {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.related-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
}
@media (max-width: 900px) {
  .two-col { grid-template-columns: 1fr; }
  .k-actions { flex-direction: column; align-items: stretch; }
}
</style>
