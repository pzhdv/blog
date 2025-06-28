import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 或者指定为你的局域网 IP 地址
    port: 4000, // 可选，指定端口号
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    //导入时想要省略的扩展名列表
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
})
