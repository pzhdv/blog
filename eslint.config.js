import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { globalIgnores } from 'eslint/config'

export default tseslint.config([
  globalIgnores([
    'dist', // 构建输出目录 忽略整个 dist 目录及其目录下所有内容
    'node_modules', // Node.js 依赖项
    '**/assets/fonts/**', // 不需要检查的字体资源
  ]),
  {
    files: ['**/*.{js,ts,tsx,jsx}'], // 指定 ESLint 检查的文件
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /*
       * 规则严重级别配置说明：
       * "off" 或 0    ==>  关闭规则检查
       * "warn" 或 1   ==>  将规则违反显示为警告（代码仍可运行）
       * "error" 或 2  ==>  将规则违反显示为错误（阻止代码运行/编译）
       */

      // 关闭对显式使用 any 类型的检查
      // 允许在类型不明确或临时过渡时使用 any，需谨慎使用以免失去类型安全
      '@typescript-eslint/no-explicit-any': 'off',

      // 对定义但未使用的变量显示警告而非错误
      // 帮助识别可能冗余的代码，但允许在特定场景（如保留接口参数）下存在
      '@typescript-eslint/no-unused-vars': 'warn',

      // 关闭对未使用表达式的检查
      // 适用于故意编写的表达式（如立即调用函数）或测试代码
      '@typescript-eslint/no-unused-expressions': 'off',

      // 关闭 React Refresh 仅导出组件的限制
      // 允许在开发环境中热更新时导出非组件内容（如工具函数）
      'react-refresh/only-export-components': 'off',
    },
  },
])
