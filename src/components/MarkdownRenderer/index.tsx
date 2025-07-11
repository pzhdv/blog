/* eslint-disable @typescript-eslint/no-unused-vars */
// npm i react-markdown  rehype-sanitize remark-gfm rehype-external-links

import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'
import rehypeExternalLinks from 'rehype-external-links'

import CodeBlock from './CodeBlock'

interface MarkdownRendererProps {
  content: string
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <ReactMarkdown
      remarkPlugins={[
        remarkGfm,
        [
          rehypeExternalLinks,
          { target: '_blank', rel: ['noopener', 'nofollow'] },
        ],
      ]}
      rehypePlugins={[rehypeSanitize]}
      components={{
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
        p: ({ node, ...props }) => (
          <p
            className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed text-sm sm:text-base break-words"
            {...props}
          />
        ),
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
            className="pl-1 sm:pl-2 ml-1 text-sm sm:text-base leading-relaxed break-words"
            {...props}
          />
        ),
        pre: ({ node, ...props }) => (
          <pre
            className="m-1 max-w-full overflow-x-auto overflow-y-hidden outline-none border-none"
            {...props}
          />
        ),
        code({ node, inline, className, children, ...props }: any) {
          const isBlockCode =
            className?.includes('language-') || String(children).includes('\n')
          if (isBlockCode) {
            const match = /language-(\w+)/.exec(className || '') || ['']
            const rawCode = String(children)
            return <CodeBlock language={match[1]} codeString={rawCode} />
          } else {
            return (
              <code {...props} className="p-1 text-orange-500">
                {children}
              </code>
            )
          }
        },
        hr: ({ node, ...props }) => (
          <hr
            className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent dark:via-gray-600"
            {...props}
          />
        ),
        br: ({ node, ...props }) => <br className="block h-4" {...props} />,
        blockquote: ({ node, ...props }) => (
          <blockquote
            className="border-l-4 border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 pl-4 sm:pl-6 pr-3 sm:pr-4 py-3 sm:py-4 my-4 sm:my-6 rounded-r-lg italic text-gray-700 dark:text-gray-300 shadow-sm break-words"
            {...props}
          />
        ),
        img: ({ node, ...props }) => (
          <div className="my-6 text-center">
            <img
              loading="lazy"
              className="max-w-full h-auto mx-auto"
              {...props}
            />
          </div>
        ),
        a: ({ node, ...props }) => (
          <a
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500 underline-offset-2 transition-colors duration-200 font-medium break-all"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
          />
        ),
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
        strong: ({ node, ...props }) => (
          <strong className="font-semibold" {...props} />
        ),
        em: ({ node, ...props }) => <em {...props} />,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
