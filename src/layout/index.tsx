import { useEffect } from 'react'
import { useOutlet } from 'react-router-dom'

import Footer from './Footer'
import Header from './Header'

export default function RootLayout() {
  // 动态计算导航栏高度并设置页面主体的 padding-top
  useEffect(() => {
    const navElement = document.querySelector(
      'header nav',
    ) as HTMLElement | null
    const mainElement = document.querySelector('main') as HTMLElement | null

    if (!navElement || !mainElement) return

    const setMainPadding = () => {
      const navHeight = navElement.offsetHeight
      mainElement.style.paddingTop = `${navHeight}px`
    }

    setMainPadding()

    window.addEventListener('resize', setMainPadding)
    return () => window.removeEventListener('resize', setMainPadding)
  }, [])

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 bg-gray-50 dark:bg-gray-900 md:flex md:flex-col`}
    >
      {/* 导航栏 */}
      <Header />
      {/* 主体内容 */}
      <main className="max-w-6xl mx-auto md:flex-1">
        <div className="pt-8 pb-2 px-4">{useOutlet()}</div>
      </main>
      {/* 页脚 */}
      <Footer />
    </div>
  )
}
