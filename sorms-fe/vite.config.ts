import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), tailwindcss()],
    server: {
      // cố định cổng dev để cookie / token luôn hợp lệ khi khởi động lại
      port: 5173,
      strictPort: false, // tắt strictPort để nếu port bận, vite sẽ tự động tăng lên 5174, 5175...
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:5183',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

