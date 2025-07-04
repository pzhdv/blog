/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import remarkGfm from 'remark-gfm'
import rehypeExternalLinks from 'rehype-external-links'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'

// 主题查看 https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/prism.html
// 按需导入主题
import oneDark from 'react-syntax-highlighter/dist/cjs/styles/prism/one-dark'
import materialLight from 'react-syntax-highlighter/dist/cjs/styles/prism/material-light'
// 其他主题：https://github.com/react-syntax-highlighter/react-syntax-highlighter/tree/master/src/styles/prism

// 导入更多语言
// 前端语言
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css'
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript'
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript'
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx'
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx'
import scss from 'react-syntax-highlighter/dist/cjs/languages/prism/scss'
import less from 'react-syntax-highlighter/dist/cjs/languages/prism/less'
import stylus from 'react-syntax-highlighter/dist/cjs/languages/prism/stylus'
import sass from 'react-syntax-highlighter/dist/cjs/languages/prism/sass'
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json'
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml'
import markdown from 'react-syntax-highlighter/dist/cjs/languages/prism/markdown'

// 后端语言
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python'
import java from 'react-syntax-highlighter/dist/cjs/languages/prism/java'

// SQL及数据库相关
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql'

// 脚本与命令行
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash'
import docker from 'react-syntax-highlighter/dist/cjs/languages/prism/docker'

// 配置文件
import ini from 'react-syntax-highlighter/dist/cjs/languages/prism/ini'

// 其他语言：https://github.com/react-syntax-highlighter/react-syntax-highlighter/tree/master/src/languages/prism

import { useTheme } from '@/context/ThemeContext'
import IconFont from '../IconFont'

// npm i react-markdown react-syntax-highlighter remark-gfm rehype-external-links rehype-raw
// npm i -D @types/react-syntax-highlighter
interface MarkdownRendererProps {
  content: string
}

interface CodeBlockProps {
  language: string
  codeString: string
}
// 代码组件部分
const CodeBlock: React.FC<CodeBlockProps> = ({ language, codeString }) => {
  const { theme } = useTheme()
  const darkMode = theme === 'dark'
  const [copied, setCopied] = useState(false) // 复制状态
  // 使用useEffect注册语言
  useEffect(() => {}, [])
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
        <span className="language-tag">{language.toLocaleLowerCase()}</span>
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
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [rehypeExternalLinks, { target: '_blank', rel: ['nofollow'] }],
      ]}
      rehypePlugins={[rehypeRaw]}
      components={{
        // 标题
        h1: ({ node, ...props }) => (
          <h1
            className="text-3xl md:text-4xl font-bold mb-6 mt-12 border-b pb-2 border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            className="text-2xl md:text-3xl font-semibold mb-5 mt-10 border-b pb-2 border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <h3
            className="text-xl md:text-2xl font-medium mb-4 mt-8"
            {...props}
          />
        ),
        h4: ({ node, ...props }) => (
          <h4 className="text-lg md:text-xl font-medium mb-3 mt-6" {...props} />
        ),
        h5: ({ node, ...props }) => (
          <h5
            className="text-base md:text-lg font-medium mb-2 mt-4"
            {...props}
          />
        ),
        h6: ({ node, ...props }) => (
          <h6
            className="text-sm md:text-base font-medium mb-2 mt-4"
            {...props}
          />
        ),

        // 段落
        p: ({ node, ...props }) => (
          <p
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed"
            {...props}
          />
        ),

        // 列表
        ul: ({ node, depth, ...props }: any) => (
          <ul
            className={`list-disc pl-6 mb-4 space-y-1 ${depth > 0 ? 'ml-4' : ''}`}
            {...props}
          />
        ),
        ol: ({ node, depth, ...props }: any) => (
          <ol
            className={`list-decimal pl-6 mb-4 space-y-1 ${depth > 0 ? 'ml-4' : ''}`}
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li
            className="pl-1 marker:text-gray-400 dark:marker:text-gray-600"
            {...props}
          />
        ),
        pre: ({ node, ...props }) => (
          <pre
            className="m-1  max-w-full overflow-x-auto overflow-y-hidden"
            {...props}
          />
        ),
        code({ node: any, inline, className, children, ...props }: any) {
          if (inline) {
            return (
              <code
                className={`px-1.5 py-0.5 rounded ${
                  isDarkMode
                    ? 'bg-gray-700 text-pink-300'
                    : 'bg-gray-100 text-pink-600'
                }`}
                {...props}
              />
            )
          }
          const match = /language-(\w+)/.exec(className || '')
          return match ? (
            <CodeBlock
              language={match[1]}
              codeString={String(children).replace(/\n$/, '')}
            />
          ) : (
            <code
              {...props}
              className="p-1  bg-gray-100 dark:bg-gray-700 text-orange-500 "
            >
              {children}
            </code>
          )
        },
        // 分隔线
        hr: ({ node, ...props }) => (
          <hr
            className="my-5 border-t border-gray-200 dark:border-gray-700"
            {...props}
          />
        ),

        // 换行
        br: ({ node, ...props }) => <br className="block h-4" {...props} />,

        // 引用
        blockquote: ({ node, ...props }) => (
          <blockquote
            className={`border-l-4 pl-4 my-4 italic ${
              isDarkMode
                ? 'border-gray-600 text-gray-400'
                : 'border-gray-300 text-gray-600'
            }`}
            {...props}
          />
        ),

        // 图片优化
        img: ({ node, ...props }) => (
          <img
            className="rounded-m my-3 shadow-lg max-w-full h-auto dark:brightness-95"
            {...props}
          />
        ),

        // 链接
        a: ({ node, ...props }) => (
          <a
            className={`hover:underline ${
              isDarkMode
                ? 'text-blue-400 hover:text-blue-300'
                : 'text-blue-600 hover:text-blue-800'
            }`}
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
        // thead: ({ node, ...props }) => <thead className="bg-gray-100 dark:bg-gray-700" {...props} />,
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
