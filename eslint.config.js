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
       * 规则严重级别：
       * "off" 或 0    ==>  关闭规则
       * "warn" 或 1   ==>  将规则违反显示为警告（代码仍可运行）
       * "error" 或 2  ==>  将规则违反显示为错误（代码无法运行/编译）
       */
      '@typescript-eslint/no-explicit-any': 'off', // 使用any报错
      '@typescript-eslint/no-unused-vars': 'warn', // 定义未使用报错
      '@typescript-eslint/no-unused-expressions': 'off',
      'react-refresh/only-export-components': 'off',
    },
  },
])
