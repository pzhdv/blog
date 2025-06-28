import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command, mode }: ConfigEnv) => {
  // 一些自定义的逻辑写在这里
  console.log('command', command)
  console.log('mode', mode)
  const env = loadEnv(mode, process.cwd()) // 环境变量对象
  const { VITE_API_BASE_URL } = env //不同模式中取值
  console.log('VITE_API_BASE_URL', VITE_API_BASE_URL)
  return {
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
  }
})
