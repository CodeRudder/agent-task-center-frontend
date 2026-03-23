import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      // 开发环境：将 /api 请求代理到后端服务（Dev2后端，3002端口）
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        // 保留 /api 前缀
        rewrite: (path) => path
      }
    }
  }
})
