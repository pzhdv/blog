/* eslint-disable @typescript-eslint/no-unused-vars */
// npm i react-markdown  rehype-sanitize remark-gfm rehype-external-links react-syntax-highlighter
// npm i -D @types/react-syntax-highlighter
import React, { useState } from 'react'
// ReactMarkdown 负责将 Markdown 字符串转换为 React 元素 (最终渲染为 HTML)。
import ReactMarkdown from 'react-markdown'
// HTML 内容清理插件 它会移除潜在的危险内容（如 <script> 标签和 onclick 事件），以防止跨站脚本（XSS）攻击
import rehypeSanitize from 'rehype-sanitize'
// GitHub 风格 Markdown (GFM) 插件
import remarkGfm from 'remark-gfm'
// 外部链接处理插件。
import rehypeExternalLinks from 'rehype-external-links'
// PrismLight是Prism的轻量版本,该组件本身不包含任何一种语言的解析逻辑。它只是一个“空的渲染外壳”,这使得它的体积非常小。
// 你必须通过 SyntaxHighlighter.registerLanguage() 方法，手动地、按需地将你需要的语言注册进去
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light'

// 主题查看 https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/prism.html
import {
  oneDark,
  materialLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism' // 高亮主题

import { useAppStateContext } from '@/context/AppStateContext'

import IconFont from './IconFont'

// --- 语言包导入与注册 ---
// 我们将导入进行分类，以保持代码的整洁和可维护性。

// 类别一: Web 前端 (JavaScript, TypeScript, 样式, 标记语言)
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript'
import tsx from 'react-syntax-highlighter/dist/esm/languages/prism/tsx'
import jsx from 'react-syntax-highlighter/dist/esm/languages/prism/jsx'
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css'
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss'
import less from 'react-syntax-highlighter/dist/esm/languages/prism/less'
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup' // 用于 HTML, XML, Vue 模板

// 类别二: 数据格式与标记语言
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json'
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml'
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown'

// 类别三: 后端、运维及通用语言
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java'
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql'
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash'
import nginx from 'react-syntax-highlighter/dist/esm/languages/prism/nginx'
import ini from 'react-syntax-highlighter/dist/esm/languages/prism/ini'

// 这个逻辑在模块首次导入时执行一次，完成所有语言的注册。
// Web 前端
SyntaxHighlighter.registerLanguage('js', javascript)
SyntaxHighlighter.registerLanguage('javascript', javascript)
SyntaxHighlighter.registerLanguage('ts', typescript)
SyntaxHighlighter.registerLanguage('typescript', typescript)
SyntaxHighlighter.registerLanguage('tsx', tsx)
SyntaxHighlighter.registerLanguage('jsx', jsx)
SyntaxHighlighter.registerLanguage('css', css)
SyntaxHighlighter.registerLanguage('scss', scss)
SyntaxHighlighter.registerLanguage('less', less)
SyntaxHighlighter.registerLanguage('html', markup)
SyntaxHighlighter.registerLanguage('xml', markup)
SyntaxHighlighter.registerLanguage('vue', markup) // .vue 文件中的模板部分也使用 markup 进行高亮

// 数据格式与标记语言
SyntaxHighlighter.registerLanguage('json', json)
SyntaxHighlighter.registerLanguage('yml', yaml)
SyntaxHighlighter.registerLanguage('yaml', yaml)
SyntaxHighlighter.registerLanguage('md', markdown)
SyntaxHighlighter.registerLanguage('markdown', markdown)

// 后端、运维及通用语言
SyntaxHighlighter.registerLanguage('java', java)
SyntaxHighlighter.registerLanguage('sql', sql)
SyntaxHighlighter.registerLanguage('bash', bash)
SyntaxHighlighter.registerLanguage('shell', bash) // 为 shell 添加别名
SyntaxHighlighter.registerLanguage('nginx', nginx)
SyntaxHighlighter.registerLanguage('ini', ini)

interface MarkdownRendererProps {
  content: string
}

interface CodeBlockProps {
  language: string
  codeString: string
}
// 代码组件部分
const CodeBlock: React.FC<CodeBlockProps> = ({ language, codeString }) => {
  const { theme } = useAppStateContext()
  const darkMode = theme === 'dark'
  const [copied, setCopied] = useState(false) // 复制状态

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
      <div className="flex justify-between py-2 px-4 rounded-t-xl bg-[#f2f2fe] dark:bg-gray-800 ">
        <span className="language-tag">
          {language && language.toLocaleLowerCase()}
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
      {/* 代码高亮 */}
      <SyntaxHighlighter
        language={language}
        customStyle={{ margin: 0, marginTop: -4 }}
        style={darkMode ? oneDark : materialLight}
        className="rounded-t-0 rounded-b-xl"
        showLineNumbers
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }],
      ]}
      rehypePlugins={[rehypeSanitize]}
      components={{
        // 标题
        h1: ({ node, ...props }) => (
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-5 mt-6 first:mt-0 pb-2 text-gray-900 dark:text-gray-100 break-words"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 mt-6 first:mt-0 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 break-words"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-base sm:text-lg md:text-xl font-semibold mb-3 mt-5 first:mt-0 text-gray-800 dark:text-gray-200 break-words"
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4
            className="text-sm sm:text-base md:text-lg font-medium mb-3 mt-4 first:mt-0 text-gray-700 dark:text-gray-300 break-words"
            {...props}
          />
        ),
        h5: ({ node, ...props }) => (
          <h5
            className="text-sm sm:text-base font-medium mb-2 mt-4 first:mt-0 text-gray-700 dark:text-gray-300 break-words"
            {...props}
          />
        ),
        h6: ({ node, ...props }) => (
          <h6
            className="text-xs sm:text-sm font-medium mb-2 mt-3 first:mt-0 text-gray-600 dark:text-gray-400 break-words"
            {...props}
          />
        ),

        // 段落
        p: ({ node, ...props }) => (
          <p
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-sm sm:text-base break-words"
            {...props}
          />
        ),

        // 列表
        ul: ({ node, depth, ...props }: any) => (
          <ul
            className={`list-disc pl-4 sm:pl-6 mb-4 space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 break-words ${depth > 0 ? 'ml-2 sm:ml-4' : ''}`}
            {...props}
          />
        ),
        ol: ({ node, depth, ...props }: any) => (
          <ol
            className={`list-decimal pl-4 sm:pl-6 mb-4 space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 break-words ${depth > 0 ? 'ml-2 sm:ml-4' : ''}`}
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li
            className="pl-1 sm:pl-2 text-sm sm:text-base leading-relaxed break-words"
            {...props}
          />
        ),
        pre: ({ node, ...props }) => (
          <pre
            className="m-1  max-w-full overflow-x-auto overflow-y-hidden"
            {...props}
          />
        ),
        code({ node, inline, className, children, ...props }: any) {
          // 检查是否是块级代码
          const isBlockCode =
            className?.includes('language-') || String(children).includes('\n')
          if (isBlockCode) {
            const match = /language-(\w+)/.exec(className || '') || ['']
            return (
              <CodeBlock
                language={match[1]}
                codeString={String(children).replace(/\n$/, '')}
              />
            )
          } else {
            // 明确处理行内代码
            return (
              <code {...props} className="p-1 text-orange-500 ">
                {children}
              </code>
            )
          }
        },
        // 分隔线
        hr: ({ node, ...props }) => (
          <hr
            className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
            {...props}
          />
        ),

        // 换行
        br: ({ node, ...props }) => <br className="block h-4" {...props} />,

        // 引用
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg italic text-gray-700 dark:text-gray-300 shadow-sm break-words"
            {...props}
          />
        ),

        // 图片优化
        img: ({ node, ...props }) => (
          <div className="my-6 text-center">
            <img className="max-w-full h-auto mx-auto" {...props} />
          </div>
        ),

        // 链接
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500 underline-offset-2 transition-colors duration-200 font-medium break-all"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),

        // 表格
        table: ({ node, ...props }) => (
          <div className="overflow-x-auto touch-pan-x mx-3 sm:mx-0">
            <table
              className="w-full min-w-[600px] sm:min-w-0 my-3 border border-gray-200 dark:border-gray-600"
              {...props}
            />
          </div>
        ),
        thead: ({ node, ...props }) => (
          <thead className="bg-gray-100 dark:bg-gray-700" {...props} />
        ),
        tbody: ({ children, ...props }: any) => (
          <tbody
            {...props}
            className="[&>tr]:border-b [&>tr]:border-gray-200 dark:[&>tr]:border-gray-600"
          >
            {children}
          </tbody>
        ),
        tr: ({ children, ...props }: any) => (
          <tr
            {...props}
            className="odd:bg-white even:bg-gray-50 dark:odd:bg-gray-800 dark:even:bg-gray-700"
          >
            {children}
          </tr>
        ),
        th: ({ node, ...props }) => (
          <th
            className="px-4 py-2 text-left border-r border-gray-200 dark:border-gray-600 font-bold bg-gray-100 dark:bg-gray-700"
            {...props}
          />
        ),
        td: ({ node, ...props }) => (
          <td
            className="px-4 py-2 border-r border-gray-200 dark:border-gray-600 last:border-r-0"
            {...props}
          />
        ),
        // 强调文本
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
        em: ({ node, ...props }) => <em className="italic" {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
