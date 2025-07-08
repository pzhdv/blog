// src/types/react-syntax-highlighter.d.ts

declare module 'react-syntax-highlighter/dist/esm/prism-light' {
  import type { SyntaxHighlighterProps } from 'react-syntax-highlighter'
  import React from 'react'

  const SyntaxHighlighter: React.ComponentType<SyntaxHighlighterProps> & {
    registerLanguage(langName: string, langDef: unknown): void
  }
  export default SyntaxHighlighter
}

// 主题
declare module 'react-syntax-highlighter/dist/esm/styles/prism/*' {
  const content: Record<string, React.CSSProperties>
  export default content
}

// 语言包
declare module 'react-syntax-highlighter/dist/esm/languages/prism/*' {
  const langDef: unknown
  export default langDef
}
