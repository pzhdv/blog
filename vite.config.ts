import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  const env = loadEnv(mode, process.cwd())

  // 模式判断
  const isProduction = mode === 'production'

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Brotli 压缩 生产环境启用
      isProduction &&
        viteCompression({
          verbose: true, // 控制台输出压缩结果
          threshold: 10240, // 大于10kb的文件才压缩
          algorithm: 'brotliCompress', // 或 'brotli'
          ext: '.br',
          deleteOriginFile: false, // 生产环境建议改为 false 保留源文件 以确保兼容性
        }),

      // Gzip 压缩配置 生产环境启用
      isProduction &&
        viteCompression({
          verbose: true, // 控制台输出压缩结果
          threshold: 10240, // 大于10kb的文件才压缩
          algorithm: 'gzip', // 压缩算法
          ext: '.gz', // 生成的压缩文件后缀
          deleteOriginFile: false, // 生产环境建议改为 false 保留源文件 以确保兼容性
        }),

      isProduction &&
        visualizer({
          // 是否自动在浏览器中打开分析报告
          // - true: 构建完成后自动打开浏览器显示可视化报告
          // - false: 仅生成报告文件但不自动打开
          open: true,

          // 是否显示 gzip 压缩后的大小
          // - true: 在可视化图表中显示 gzip 压缩后的文件大小
          // - false: 只显示原始文件大小
          // 注意：这需要先启用 gzip 压缩（如通过 vite-plugin-compression）
          gzipSize: true,

          // 是否显示 brotli 压缩后的大小
          // - true: 在可视化图表中显示 brotli 压缩后的文件大小
          // - false: 不显示 brotli 压缩大小
          // 注意：需要项目支持 brotli 压缩（比 gzip 压缩率更高）
          brotliSize: true,

          // 其他可用选项（示例）：
          filename: 'report.html', // 生成的报告文件名
          template: 'treemap', // 图表类型: sunburst|treemap|network|raw-data
          title: 'Bundle Analysis', // 报告标题
          sourcemap: false, // 是否包含 sourcemap 分析
        }),
    ].filter(Boolean),
    server: {
      host: '0.0.0.0', // 局域网访问支持
      port: 4000, // 可选，指定端口号
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      //导入时想要省略的扩展名列表
      extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
    },
    define: {
      'process.env': Object.fromEntries(
        // 将处理后的环境变量映射为 `process.env` 对象
        Object.entries(env) // 获取环境变量对象 `env` 的所有键值对
          .filter(([key]) => key.startsWith('VITE_')), // 筛选出以 `VITE_` 开头的环境变量
      ),
    },
    build: {
      // outDir: 'blog_dist', // 确保与Nginx配置一致
      minify: 'terser', // 使用 Terser 进行压缩
      terserOptions: {
        compress: {
          drop_console: ['log', 'info'], // 只移除 console.log 和 console.info
          drop_debugger: true, // 移除所有 debugger 语句
          pure_funcs: ['console.log', 'console.info'], // 双重保险（可选）
        },
        format: {
          comments: false, // 移除注释
        },
      },
      rollupOptions: {
        output: {
          //  分包策略
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return id
                .toString()
                .split('node_modules/')[1]
                .split('/')[0]
                .toString()
            }
          },
          chunkFileNames: 'js/[name]-[hash:8].js', // 分包文件命名
          entryFileNames: 'js/[name]-[hash].js', // 入口文件命名
          assetFileNames: 'assets/[name]-[hash][extname]', // 静态资源命名
        },
      },
    },
  }
})
