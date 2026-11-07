/// <reference types="node" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'

// 使用相对 base，配合 Hash 路由，可直接静态部署到 GitHub Pages 任意子路径
export default defineConfig({
  base: './',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          monaco: ['monaco-editor'],
          echarts: ['echarts'],
          element: ['element-plus', '@element-plus/icons-vue'],
          katex: ['katex']
        }
      }
    }
  },
  worker: {
    format: 'es'
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.ts']
  }
})
