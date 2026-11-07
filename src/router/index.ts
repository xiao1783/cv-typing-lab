import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: { title: '学习首页' }
      },
      {
        path: 'courses',
        name: 'courses',
        component: () => import('@/views/CoursesView.vue'),
        meta: { title: '课程中心' }
      },
      {
        path: 'courses/:chapterId',
        name: 'chapter',
        component: () => import('@/views/ChapterView.vue'),
        meta: { title: '章节详情' }
      },
      {
        path: 'level/:levelId',
        name: 'level',
        component: () => import('@/views/LevelView.vue'),
        meta: { title: '关卡学习' }
      },
      {
        path: 'practice',
        name: 'practice',
        component: () => import('@/views/PracticeView.vue'),
        meta: { title: '代码练习' }
      },
      {
        path: 'lab',
        name: 'lab',
        component: () => import('@/views/LabView.vue'),
        meta: { title: '算法实验室' }
      },
      {
        path: 'lab/:experimentId',
        name: 'lab-experiment',
        component: () => import('@/views/LabView.vue'),
        meta: { title: '算法实验室' }
      },
      {
        path: 'quiz',
        name: 'quiz',
        component: () => import('@/views/QuizCenterView.vue'),
        meta: { title: '知识测验' }
      },
      {
        path: 'quiz/:levelId',
        name: 'quiz-run',
        component: () => import('@/views/QuizRunView.vue'),
        meta: { title: '关卡测验' }
      },
      {
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/AnalyticsView.vue'),
        meta: { title: '学习分析' }
      },
      {
        path: 'mistakes',
        name: 'mistakes',
        component: () => import('@/views/MistakesView.vue'),
        meta: { title: '错题与复习' }
      },
      {
        path: 'achievements',
        name: 'achievements',
        component: () => import('@/views/AchievementsView.vue'),
        meta: { title: '成就中心' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/SettingsView.vue'),
        meta: { title: '系统设置' }
      }
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
