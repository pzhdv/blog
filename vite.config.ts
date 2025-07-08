import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import type { ConfigEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// 全局收集所有 node_modules 依赖包名
const packageSet = new Set<string>()

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
      // 注：不建议br与gzip同时开启，会增加打包体积，如需兼容老旧服务器再放开
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
      // 自定义插件：打包结束输出所有依赖包名称
      {
        name: 'log‑all‑packages',
        buildStart() {
          // 每次打包开始清空集合，防止缓存叠加
          console.log('打包前清空集合，防止缓存叠加')
          packageSet.clear()
        },
        // 分包全部执行完成之后触发
        async generateBundle() {
          const list = [...packageSet].sort()
          fs.writeFileSync(
            path.resolve(__dirname, 'vendor-packages.txt'),
            list.join('\r\n'),
          )
          console.log(
            `第三方依赖清单已保存，一共${list.length}个包 → vendor-packages.txt`,
          )
        },
      },
    ].filter(Boolean),
    server: {
      host: '0.0.0.0', // 局域网访问支持
      port: 4000, // 可选，指定端口号
      strictPort: false, // 端口被占用自动顺延
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
      outDir: 'blog_dist', // 确保与Nginx配置一致
      // 生产环境启用代码压缩，开发环境不压缩
      minify: isProduction ? ('terser' as const) : false,

      // 设置 chunk 大小警告阈值（单位 KB）
      // 超过该值会输出警告，但不中断构建
      chunkSizeWarningLimit: 800, // 收紧至800KB，严格管控分包体积

      rollupOptions: {
        output: {
          /**
           * 自定义分包策略
           * - 将 node_modules 依赖按功能分组
           * - 避免单个 vendor 文件过大
           */
          manualChunks: createOptimizedChunks(),

          // 非入口 chunk 的命名规则（限制 hash 长度）
          chunkFileNames: 'js/[name]-[hash:8].js',

          // 入口 chunk 的命名规则（加长hash，防止缓存冲突）
          entryFileNames: 'js/entry-[name]-[hash:12].js',

          // 静态资源（图片/字体等）命名规则
          assetFileNames: 'assets/[name]-[hash:10][extname]',

          // 提升公共依赖，减少重复导入
          hoistTransitiveImports: true,
        },

        /**
         * 入口模块签名保留模式
         * - 'strict': 保持原始导出签名（最佳 Tree‑Shaking）
         * - 确保组件库按需导入时能正确被优化
         */
        preserveEntrySignatures: 'strict' as const,
      },

      // Terser 压缩配置（仅在生产环境生效）
      terserOptions: {
        compress: {
          // 禁用全局移除 console（改为用 pure_funcs 精确控制）
          drop_console: false,

          // 精确指定要移除的 console 方法
          pure_funcs: isProduction
            ? ['console.log', 'console.info', 'console.debug', 'console.trace']
            : [],

          // 始终移除 debugger
          drop_debugger: isProduction,
        },
        format: {
          // 移除所有注释（包括法律声明）
          comments: false,
        },
      },
    },
  }
})

// 分块策略
function createOptimizedChunks(): (id: string) => string | undefined {
  const cache = new Map<string, string>()

  const groups = {
    // React核心全家桶
    reactCore: new Set([
      'react',
      'react-dom',
      'scheduler',
      'react-fast-compare',
      'invariant',
      'shallowequal',
    ]),
    // 路由
    routing: new Set(['react-router', '@remix-run/router', 'react-router-dom']),
    // 状态管理
    store: new Set(['zustand']),
    // 请求数据处理
    data: new Set(['axios', 'qs', 'object-hash', '@ungap/structured-clone']),
    // 日期库
    date: new Set(['date-fns']),
    // SEO头部
    helmet: new Set(['react-helmet-async']),
    // 代码高亮
    syntax: new Set(['react-syntax-highlighter', 'refractor']),
    // babel运行时
    babelRuntime: new Set(['@babel/runtime']),
    // ========= Markdown整套生态【全部合并到一组】 =========
    markdown: new Set([
      'react-markdown',
      'rehype-sanitize',
      'remark-gfm',
      'rehype-external-links',
      'remark-parse',
      'remark-rehype',
      'unified',
      'vfile',
      'vfile-message',
    ]),
  }

  // JS底层垫片工具
  const jsBaseDeps = new Set([
    'call-bind-apply-helpers',
    'call-bound',
    'dunder-proto',
    'es-define-property',
    'es-errors',
    'es-object-atoms',
    'function-bind',
    'get-intrinsic',
    'get-proto',
    'gopd',
    'has-symbols',
    'hasown',
    'math-intrinsics',
    'side-channel',
    'side-channel-list',
    'side-channel-map',
    'side-channel-weakmap',
    'object-inspect',
  ])

  return (id: string) => {
    if (!id.includes('node_modules')) return
    if (cache.has(id)) return cache.get(id)

    const { fullName } = parsePackageId(id)
    fullName && packageSet.add(fullName)

    let chunkName: string | undefined

    // 1.匹配主分组
    for (const [group, libs] of Object.entries(groups)) {
      if (libs.has(fullName)) {
        chunkName = `vendor‑${group}`
        break
      }
    }

    // 2. 所有markdown相关底层包全部归入 vendor‑markdown
    if (!chunkName) {
      if (
        fullName.startsWith('micromark') ||
        fullName.startsWith('hast') ||
        fullName.startsWith('mdast') ||
        fullName.startsWith('unist')
      ) {
        chunkName = 'vendor‑markdown'
      }
    }

    // 3.js底层垫片
    if (!chunkName && jsBaseDeps.has(fullName)) {
      chunkName = 'vendor‑js‑base'
    }

    // 4. 其余所有细碎小工具全部归入兜底 common，不再拆分碎片
    if (!chunkName) {
      chunkName = 'vendor‑common'
    }

    cache.set(id, chunkName)
    return chunkName
  }
}

// 包解析器，兼容@scope作用域包、Windows反斜杠路径
function parsePackageId(id: string): { fullName: string } {
  const normalizedPath = id.replace(/\\/g, '/')
  // 匹配 @xxx/yyy 作用域包
  const scopePkg = normalizedPath.match(/node_modules\/(@[^/]+\/[^/]+)/)
  if (scopePkg) return { fullName: scopePkg[1] }
  // 普通包名
  const normalPkg = normalizedPath.match(/node_modules\/([^/]+)/)
  return { fullName: normalPkg ? normalPkg[1] : '' }
}
