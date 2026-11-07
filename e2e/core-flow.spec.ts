import { expect, test } from '@playwright/test'

test('学习首页渲染核心信息', async ({ page }) => {
  await page.goto('/#/home')
  await expect(page.getByText('键入代码，理解视觉').first()).toBeVisible()
  await expect(page.getByRole('button', { name: '开始学习' })).toBeVisible()
})

test('全部导航页面可访问且无空白', async ({ page }) => {
  const paths = [
    ['/#/home', '键入代码，理解视觉'],
    ['/#/courses', '课程中心'],
    ['/#/practice', '代码练习'],
    ['/#/lab', '算法实验室'],
    ['/#/quiz', '知识测验'],
    ['/#/analytics', '学习分析'],
    ['/#/mistakes', '错题与复习'],
    ['/#/achievements', '成就中心'],
    ['/#/settings', '系统设置']
  ]
  for (const [hash, text] of paths) {
    await page.goto(hash)
    await expect(page.locator('main')).toContainText(text)
  }
})

test('课程→章节→关卡展示代码编辑器', async ({ page }) => {
  await page.goto('/#/courses/ch1')
  await page.getByText('关卡列表').waitFor()
  await page.locator('.level-item').first().click()
  await page.waitForURL(/\/#\/level\/ch1-l01/)
  await expect(page.locator('.monaco-editor').first()).toBeVisible()
})

test('实验室运行真实运算并出现结果解释', async ({ page }) => {
  await page.goto('/#/lab')
  await page.getByRole('button', { name: '运行实验' }).click()
  await expect(page.locator('.change-text')).toBeVisible({ timeout: 20000 })
  await expect(page.locator('.stat-bar').first()).toContainText('耗时')
})

test('设置页可导出备份', async ({ page }) => {
  await page.goto('/#/settings')
  await expect(page.getByRole('button', { name: /导出备份/ })).toBeVisible()
})
