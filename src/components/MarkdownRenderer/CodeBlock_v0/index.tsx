import { memo, useState, useEffect } from 'react'
import { useAppStateContext } from '@/context/AppStateContext'
import IconFont from '@/components/IconFont'

// ⚠️渲染代码有闪烁问题

// # 核心入口
// npm i shiki
// # JS‑Regex 引擎（抛弃Wasm，网页首选）
// npm i @shikijs/engine-javascript
// # 全部语言合集包
// npm i @shikijs/langs
// # 全部主题合集包
// npm i @shikijs/themes

import { createBundledHighlighter, createSingletonShorthands } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

import './index.css'

function escapeHtml(raw: string) {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 按需懒加载语言（不要添加 text，text 为引擎内置）
const bundledLanguages = {
  javascript: () => import('@shikijs/langs/javascript'),
  typescript: () => import('@shikijs/langs/typescript'),
  tsx: () => import('@shikijs/langs/tsx'),
  jsx: () => import('@shikijs/langs/jsx'),
  css: () => import('@shikijs/langs/css'),
  scss: () => import('@shikijs/langs/scss'),
  less: () => import('@shikijs/langs/less'),
  html: () => import('@shikijs/langs/html'),
  vue: () => import('@shikijs/langs/vue'),
  xml: () => import('@shikijs/langs/xml'),
  json: () => import('@shikijs/langs/json'),
  yaml: () => import('@shikijs/langs/yaml'),
  markdown: () => import('@shikijs/langs/markdown'),
  java: () => import('@shikijs/langs/java'),
  sql: () => import('@shikijs/langs/sql'),
  bash: () => import('@shikijs/langs/bash'),
  nginx: () => import('@shikijs/langs/nginx'),
  ini: () => import('@shikijs/langs/ini'),
  tex: () => import('@shikijs/langs/tex'),
}

// 按需懒加载主题
const bundledThemes = {
  'one-dark-pro': () => import('@shikijs/themes/one-dark-pro'),
  'material-theme-lighter': () =>
    import('@shikijs/themes/material-theme-lighter'),
}

/**
 * 别名映射：简写映射为标准语言key
 */
const aliasMap: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  md: 'markdown',
  sh: 'bash',
  yml: 'yaml',
  plaintext: 'text',
}

// 行号transformer
const lineNumberTransformer = [
  {
    pre(node: any) {
      node.properties['data-line-numbers'] = ''
      node.properties.style =
        (node.properties.style ?? '') + '; min-width: max-content;'
    },
    // 操作shiki根节点，浅色模式背景就在这里
    root(node: any) {
      const shikiEl = node.children?.[0]
      if (shikiEl?.properties?.class?.includes('shiki')) {
        shikiEl.properties.style =
          (shikiEl.properties.style ?? '') + '; min-width: max-content;'
      }
    },
  },
]

export const createHighlighter = createBundledHighlighter<
  keyof typeof bundledLanguages,
  keyof typeof bundledThemes
>({
  langs: bundledLanguages,
  themes: bundledThemes,
  engine: () => createJavaScriptRegexEngine(),
})

const { codeToHtml } = createSingletonShorthands(createHighlighter)

interface CodeBlockProps {
  language: string
  codeString: string
}

const CodeBlock = memo(({ language, codeString }: CodeBlockProps) => {
  const { theme } = useAppStateContext()
  const darkMode = theme === 'dark'
  const [copied, setCopied] = useState(false)
  const [highlightHtml, setHighlightHtml] = useState(
    `<pre><code>${escapeHtml(codeString)}</code></pre>`,
  )

  const renderHighlight = async () => {
    const targetTheme = darkMode ? 'one-dark-pro' : 'material-theme-lighter'
    let rawLang = (language ?? '').toLowerCase()

    // 1.优先处理语言别名
    if (aliasMap[rawLang]) rawLang = aliasMap[rawLang]
    // 2.不在已配置语言列表，直接使用内置纯文本模式 text
    if (!Object.keys(bundledLanguages).includes(rawLang)) {
      rawLang = 'text'
    }

    const resultHtml = await codeToHtml(codeString, {
      lang: rawLang,
      theme: targetTheme,
      transformers: lineNumberTransformer,
    })
    setHighlightHtml(resultHtml)
  }

  useEffect(() => {
    renderHighlight()
  }, [language, darkMode, codeString])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('复制失败:', err)
    }
  }

  return (
    <div className="code-block">
      <div className="flex justify-between py-2 px-4 rounded-t-xl bg-[#f2f2fe] dark:bg-gray-800">
        <span className="language-tag">
          {language && language.toLowerCase()}
        </span>
        <button
          onClick={handleCopy}
          className="flex justify-center items-center"
          aria-label="复制代码"
        >
          <IconFont
            iconClass="iconfont icon-fuzhi"
            color={copied ? '#3498db' : 'gray'}
            size={16}
          />
        </button>
      </div>
      <div tabIndex={-1} className="rounded-b-xl overflow-x-auto outline-none">
        <div dangerouslySetInnerHTML={{ __html: highlightHtml }} />
      </div>
    </div>
  )
})

export default CodeBlock
