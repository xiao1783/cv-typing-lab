import { defineStore } from 'pinia'
import { settingsRepo } from '@/db/repo'
import type { SettingsRecord } from '@/db/types'
import { DEFAULT_SETTINGS } from '@/db/database'

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: { ...DEFAULT_SETTINGS } as SettingsRecord,
    loaded: false
  }),
  getters: {
    isDark: (s) => s.settings.theme === 'dark',
    strictMode: (s) => s.settings.strictMode
  },
  actions: {
    async load() {
      this.settings = await settingsRepo.get()
      this.applyTheme()
      this.loaded = true
    },
    applyTheme() {
      const root = document.documentElement
      root.classList.toggle('dark', this.settings.theme === 'dark')
    },
    async update(patch: Partial<SettingsRecord>) {
      Object.assign(this.settings, patch)
      await settingsRepo.save(this.settings)
      if (patch.theme) this.applyTheme()
    },
    async toggleTheme() {
      await this.update({
        theme: this.settings.theme === 'light' ? 'dark' : 'light',
        codeTheme: this.settings.theme === 'light' ? 'vs-dark' : 'vs'
      })
    },
    async reset() {
      this.settings = { ...DEFAULT_SETTINGS }
      await settingsRepo.save(this.settings)
      this.applyTheme()
    }
  }
})
