import { useEffect } from 'react'
import { useOutlet } from 'react-router-dom'

import Footer from './Footer'
import Header from './Header'

export default function RootLayout() {
  // 动态计算导航栏高度并设置页面主体的 padding-top
  useEffect(() => {
    const navElement = document.querySelector('nav')
    const mainElement = document.querySelector('main')

    if (navElement && mainElement) {
      const navHeight = navElement.clientHeight
      mainElement.style.setProperty('padding-top', `${navHeight}px`)
    }
  }, [])

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-900 `}
    >
      {/* 导航栏 */}
      <Header />
      {/* 主体内容 */}
      <main className="max-w-6xl mx-auto">
        <div className="pt-8 pb-2 px-4">{useOutlet()}</div>
      </main>
      {/* 页脚 */}
      <Footer />
    </div>
  )
}
