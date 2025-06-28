import { useEffect } from 'react'
import { useOutlet } from 'react-router-dom'

import Footer from './Footer'
import Header from './Header'

export default function RootLayout() {
  // 动态计算导航栏高度并设置页面主体的 padding-top
  useEffect(() => {
    // 头部固定
    const navHeight = document.querySelector('nav')?.clientHeight || 0
    document
      .querySelector('main')
      ?.style.setProperty('padding-top', `${navHeight}px`)
  }, [])
  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-900 `}
    >
      {/* 导航栏 */}
      <Header />
      {/* 主体内容 */}
      <main className="max-w-6xl mx-auto">
        <div className="px-4 pt-8 pb-2">{useOutlet()}</div>
      </main>
      {/* 页脚 */}
      <Footer />
    </div>
  )
}
