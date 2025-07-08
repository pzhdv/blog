import { memo, useState } from 'react'
import { useAppStateContext } from '@/context/AppStateContext'
import IconFont from '@/components/IconFont'

// ⚠️ vue语言 不能高亮

// npm i react-syntax-highlighter
// npm i -D @types/react-syntax-highlighter

// PrismLight是Prism的轻量版本,该组件本身不包含任何一种语言的解析逻辑。它只是一个“空的渲染外壳”,这使得它的体积非常小。
// 你必须通过 SyntaxHighlighter.registerLanguage() 方法，手动地、按需地将你需要的语言注册进去
import SyntaxHighlighter from 'react-syntax-highlighter/dist/esm/prism-light'

// 主题查看 https://react-syntax-highlighter.github.io/react-syntax-highlighter/demo/prism.html
import {
  oneDark,
  materialLight,
} from 'react-syntax-highlighter/dist/esm/styles/prism' // 高亮主题

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
SyntaxHighlighter.registerLanguage('vue', markup)

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

interface CodeBlockProps {
  language: string
  codeString: string
}

const CodeBlock = memo(({ language, codeString }: CodeBlockProps) => {
  console.log('渲染 CodeBlock:', language, codeString)
  const { theme } = useAppStateContext()
  const darkMode = theme === 'dark'
  const [copied, setCopied] = useState(false)

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
      {/* 代码高亮 */}
      <SyntaxHighlighter
        language={language}
        customStyle={{ margin: 0, marginTop: -4 }}
        style={darkMode ? oneDark : materialLight}
        className="rounded-t-0 rounded-b-xl"
        showLineNumbers
        lineNumberStyle={{
          minWidth: '0',
        }}
      >
        {codeString}
      </SyntaxHighlighter>
    </div>
  )
})

export default CodeBlock
